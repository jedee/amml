// ─────────────────────────────────────────────────────────────
//  ZK Biometric Event Types
//  Covers Realand AL325, AL321, and compatible ZKTeco push formats
// ─────────────────────────────────────────────────────────────

export interface ZKClockEvent {
  /** ZKTeco push format: user ID as punched on device */
  userId: string;
  /** ISO 8601 timestamp of punch */
  timestamp: string;
  /** "check-in" | "check-out" — derived from ZK punch mode */
  type: 'check-in' | 'check-out';
  /** Device serial number */
  deviceSerial: string;
  /** Raw event mode (1=check-in, 2=check-out, 3=break-out, 4=break-in, etc.) */
  mode: number;
  /** Reserved bytes from ZK payload — present but unused */
  reserved?: string;
}

export interface ZKDeviceRegistration {
  serial: string;
  name: string;
  /** IP address on LAN — device pushes to this listener */
  ipAddress: string;
  /** Port device pushes to (default ZKTeco: 4370) */
  port: number;
  market: string;
  location: string;
  /** PEM-encoded CA cert that signed this device's client cert */
  issuerFingerprint: string;
  /** Unix ms — reject events older than this */
  clockSkewMs: number;
  /** Unix ms — last time device successfully authenticated with mTLS */
  lastAuthenticated: number | null;
}

export interface ZKAttendanceRecord {
  staffId: string;        // mapped from ZK userId via zkMap
  staffName: string;
  market: string;
  dept: string;
  date: string;           // YYYY-MM-DD
  clockIn: string;       // HH:MM
  clockOut: string;      // HH:MM
  device: string;         // device name
  late: boolean;
  duration: number | null; // minutes
  /** Source event ID — used for deduplication */
  eventId: string;
}

export interface ZKHealthStatus {
  serial: string;
  connected: boolean;
  lastSeen: string;
  clocksToday: number;
  error?: string;
}

// ── ZKTeco push packet parsing ────────────────────────────────

/**
 * Parses a ZKTeco push data packet (TCP, port 4370).
 *
 * Packet structure (variable length):
 *   [2 bytes] header (0x50 0x50)
 *   [2 bytes] payload length (little-endian)
 *   [N bytes] payload
 *   [4 bytes] checksum (CRC32, included in length)
 *
 * Payload format (string, null-padded):
 *   serial=DEVICE_SERIAL\n
 *   stamp=UNIX_TIMESTAMP\n
 *   method=1\n
 *   [userId=XX\n]*
 *
 * Returns null if packet is malformed.
 */
export function parseZKPacket(buffer: Buffer): ZKClockEvent | null {
  try {
    if (buffer.length < 8) return null;

    const header = buffer.readUInt16BE(0);
    // ZKTeco uses little-endian length field
    const payloadLen = buffer.readUInt16LE(2);
    if (buffer.length < 4 + payloadLen + 4) return null; // header + payload + checksum

    const payload = buffer.slice(4, 4 + payloadLen).toString('utf8');
    // Format: key=value\nkey=value\n...
    const fields: Record<string, string> = {};
    for (const line of payload.split('\n')) {
      const eq = line.indexOf('=');
      if (eq < 0) continue;
      fields[line.slice(0, eq)] = line.slice(eq + 1).trim();
    }

    // Validate required fields
    if (!fields.serial || !fields.stamp) return null;

    const mode = parseInt(fields.method ?? '1', 10);
    const isCheckIn = mode === 1 || mode === 3; // 1=check-in, 3=break-out
    const isCheckOut = mode === 2 || mode === 4; // 2=check-out, 4=break-in

    if (!isCheckIn && !isCheckOut) return null;

    // userId may appear multiple times for bulk punch data
    const userId = fields.userId ?? fields.cardno ?? '';
    if (!userId) return null;

    const timestamp = new Date(parseInt(fields.stamp, 10) * 1000).toISOString();

    return {
      userId,
      timestamp,
      type: isCheckIn ? 'check-in' : 'check-out',
      deviceSerial: fields.serial,
      mode,
      reserved: fields.reserved,
    };
  } catch {
    return null;
  }
}
