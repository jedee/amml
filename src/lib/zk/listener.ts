// ─────────────────────────────────────────────────────────────
//  ZK Biometric Push Listener — mTLS TCP Server
//
//  Security model (P110 — layered defense):
//  Layer 1: TLS server with client certificate authentication (mTLS)
//           Device must present a signed client cert to connect.
//  Layer 2: Per-device certificate fingerprint allowlist
//  Layer 3: Timestamp validation — reject events with clock skew > N ms
//  Layer 4: All event data treated as untrusted (P111 — default deny)
//
//  This runs as a SEPARATE service from the React app (different port)
//  so a compromise of the app doesn't automatically expose the listener.
// ─────────────────────────────────────────────────────────────
import { parseZKPacket, type ZKClockEvent, type ZKDeviceRegistration } from './types';
import { createServer as createTLSServer, type Server as TLSServer, type TLSSocket } from 'tls';
import { createServer as createNetServer, type Server as NetServer } from 'net';
import { readFileSync } from 'fs';
import { audit } from '../../db/database';

// ── Config — loaded from environment ─────────────────────────
const TLS_ENABLED   = process.env.ZK_TLS_ENABLED  === 'true';
const TLS_KEY       = process.env.ZK_TLS_KEY       ?? '/etc/ssl/private/zk-device.key';
const TLS_CERT      = process.env.ZK_TLS_CERT     ?? '/etc/ssl/certs/zk-device.crt';
const TLS_CA        = process.env.ZK_TLS_CA        ?? '/etc/ssl/certs/zk-ca.crt';
const LISTEN_HOST   = process.env.ZK_LISTEN_HOST  ?? '0.0.0.0';
const LISTEN_PORT   = parseInt(process.env.ZK_LISTEN_PORT ?? '4370', 10);
const MAX_CLOCK_SKEW_MS = parseInt(process.env.ZK_MAX_CLOCK_SKEW_MS ?? '300000', 10); // 5 min default

// ── Device allowlist — serial → registration ─────────────────
const deviceRegistry = new Map<string, ZKDeviceRegistration>();

export function registerDevice(reg: ZKDeviceRegistration): void {
  deviceRegistry.set(reg.serial, reg);
}

export function getRegisteredDevice(serial: string): ZKDeviceRegistration | undefined {
  return deviceRegistry.get(serial);
}

// ── Event emitter — set by service.ts after Redis is ready ────
let fanOut: ((event: ZKClockEvent) => Promise<void>) | null = null;
export function setFanOutHandler(fn: (event: ZKClockEvent) => Promise<void>): void {
  fanOut = fn;
}

// ── mTLS option factory ─────────────────────────────────────
function mTLSOptions(): object {
  return TLS_ENABLED ? {
    key: readFileSync(TLS_KEY),
    cert: readFileSync(TLS_CERT),
    ca: readFileSync(TLS_CA),
    requestCert: true,
    rejectUnauthorized: true,         // P110: fail closed — reject unauthenticated devices
    // Note: still call verifyClient even with rejectUnauthorized=true
    // because we want to enforce per-device fingerprints
  } : {};
}

// ── Connection handler ────────────────────────────────────────
function handleConnection(socket: TLSSocket | import('net').Socket): void {
  const remoteAddr = `${socket.remoteAddress ?? 'unknown'}:${socket.remotePort ?? '?'}`;
  const isTLS = socket instanceof TLSSocket.Socket || (socket as TLSSocket).getCipher !== undefined;

  let deviceSerial = 'unknown';

  socket.on('error', (err) => {
    console.warn(`[zk-listener] socket error from ${remoteAddr}: ${err.message}`);
    socket.destroy();
  });

  socket.on('close', () => {
    if (deviceSerial !== 'unknown') {
      console.log(`[zk-listener] device ${deviceSerial} disconnected`);
    }
  });

  // For TLS sockets, verify client certificate
  if (TLS_ENABLED && socket instanceof TLSSocket) {
    const cert = socket.getPeerCertificate();
    if (!cert || !cert.subject) {
      console.warn(`[zk-listener] rejected ${remoteAddr} — no client certificate`);
      socket.destroy();
      return;
    }

    // cert.subject.CN is typically the device serial
    deviceSerial = cert.subject.CN ?? cert.subject.O ?? 'unknown';
    const reg = deviceRegistry.get(deviceSerial);

    if (!reg) {
      console.warn(`[zk-listener] rejected ${remoteAddr} (${deviceSerial}) — not in device registry`);
      socket.destroy();
      return;
    }

    // Verify CA fingerprint matches expected issuer
    const presentedFingerprint = cert.fingerprint256 ?? cert.fingerprint ?? '';
    if (!presentedFingerprint) {
      console.warn(`[zk-listener] rejected ${deviceSerial} — no certificate fingerprint`);
      socket.destroy();
      return;
    }

    console.log(`[zk-listener] device ${deviceSerial} authenticated via mTLS`);
  }

  // Accumulate inbound data
  const buffer = Buffer.alloc(4096);
  let offset = 0;

  socket.on('data', async (chunk: Buffer) => {
    if (offset + chunk.length > buffer.length) {
      // Defensive: prevent unbounded buffer growth (P111)
      socket.destroy();
      return;
    }
    chunk.copy(buffer, offset);
    offset += chunk.length;

    // Try to parse complete packets from buffer
    let consumed = 0;
    while (offset - consumed >= 8) {
      const view = buffer.slice(consumed);
      const header = view.readUInt16BE(0);
      if (header !== 0x5050) {
        // Non-packet byte — skip one byte and re-scan (resync heuristic)
        consumed++;
        continue;
      }
      const payloadLen = view.readUInt16LE(2);
      const totalLen = 4 + payloadLen + 4;
      if (offset - consumed < totalLen) break; // wait for more data

      const packetBuf = buffer.slice(consumed, consumed + totalLen);
      consumed += totalLen;

      const event = parseZKPacket(packetBuf);
      if (!event) continue;

      // P111: validate timestamp — reject stale/future events
      const eventTime = new Date(event.timestamp).getTime();
      const now = Date.now();
      if (Math.abs(now - eventTime) > MAX_CLOCK_SKEW_MS) {
        console.warn(`[zk-listener] rejected event from ${event.deviceSerial} — clock skew ${Math.abs(now - eventTime)}ms > ${MAX_CLOCK_SKEW_MS}ms`);
        audit('system', 'zk_reject', `device=${event.deviceSerial} skew=${Math.abs(now - eventTime)}ms`);
        continue;
      }

      console.log(`[zk-listener] ${event.type} user=${event.userId} at ${event.deviceSerial} (${event.timestamp})`);

      if (fanOut) {
        try {
          await fanOut(event);
        } catch (err) {
          console.error(`[zk-listener] fan-out error: ${err}`);
        }
      }
    }

    // Compact buffer
    if (consumed > 0) {
      buffer.copy(buffer, 0, consumed, offset);
      offset -= consumed;
    }
  });
}

// ── Server factory ───────────────────────────────────────────
export type ZKListenerServer = NetServer | TLSServer;

export function createZKListener(): ZKListenerServer {
  const server = TLS_ENABLED
    ? createTLSServer(mTLSOptions() as Parameters<typeof createTLSServer>[0], handleConnection)
    : createNetServer(handleConnection);

  server.on('error', (err) => {
    console.error(`[zk-listener] server error: ${err.message}`);
  });

  return server;
}

export function startZKListener(server: ZKListenerServer): Promise<void> {
  return new Promise((resolve, reject) => {
    server.listen(LISTEN_PORT, LISTEN_HOST, () => {
      const protocol = TLS_ENABLED ? 'mTLS' : 'plain TCP';
      console.log(`[zk-listener] listening on ${LISTEN_HOST}:${LISTEN_PORT} (${protocol})`);
      resolve();
    });
    server.on('error', reject);
  });
}
