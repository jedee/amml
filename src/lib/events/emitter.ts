// ─────────────────────────────────────────────────────────────
//  Event Bus — Redis Pub/Sub Fan-Out for ZK Biometric Events
//
//  EDA pattern replacing the direct handler call chain.
//  ZK events are published to Redis channels; any subscriber
//  (attendance processor, payroll recalculator, audit logger)
//  receives them independently without coupling to the listener.
//
//  Channels:
//    zk:attendance   — clock in/out events
//    zk:health       — device heartbeats / status changes
//    zk:error        — device errors, authentication failures
// ─────────────────────────────────────────────────────────────
import type { ZKClockEvent, ZKHealthStatus } from '../zk/types';

const REDIS_URL = process.env.REDIS_URL ?? 'redis://127.0.0.1:6379';

// ── Redis client (lazy — connect on first use) ───────────────
let _redis: import('ioredis').Redis | null = null;

async function getRedis(): Promise<import('ioredis').Redis> {
  if (_redis) return _redis;
  const { default: Redis } = await import('ioredis');
  _redis = new Redis(REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 3,
    retryStrategy: (tries) => tries > 3 ? null : Math.min(tries * 100, 1000),
  });
  await _redis.connect();
  return _redis;
}

// ── Publisher ────────────────────────────────────────────────
export async function publishAttendanceEvent(event: ZKClockEvent): Promise<void> {
  const redis = await getRedis();
  const channel = 'zk:attendance';
  const eventId = `${event.deviceSerial}:${event.userId}:${event.timestamp}`;
  const message = JSON.stringify({
    ...event,
    publishedAt: new Date().toISOString(),
    eventId,
  });
  const count = await redis.publish(channel, message);
  console.log(`[events] → ${channel} (${count} subscribers): ${eventId}`);
}

export async function publishHealthEvent(status: ZKHealthStatus): Promise<void> {
  const redis = await getRedis();
  await redis.publish('zk:health', JSON.stringify({
    ...status,
    publishedAt: new Date().toISOString(),
  }));
}

export async function publishError(channel: string, error: string, meta?: Record<string, unknown>): Promise<void> {
  const redis = await getRedis();
  await redis.publish('zk:error', JSON.stringify({ error, channel, meta, ts: new Date().toISOString() }));
}

// ── Subscriber ───────────────────────────────────────────────
type Handler<T> = (payload: T) => Promise<void>;

const handlers = new Map<string, Set<Handler<unknown>>>();
let _subClient: import('ioredis').Redis | null = null;

async function getSubscriber(): Promise<import('ioredis').Redis> {
  if (_subClient) return _subClient;
  const { default: Redis } = await import('ioredis');
  _subClient = new Redis(REDIS_URL, { lazyConnect: true });
  await _subClient.connect();

  _subClient.on('message', (ch: string, msg: string) => {
    const channelHandlers = handlers.get(ch);
    if (!channelHandlers) return;
    let parsed: unknown;
    try { parsed = JSON.parse(msg); } catch { return; }
    for (const h of channelHandlers) {
      h(parsed as never).catch((err) =>
        console.error(`[events] handler error on ${ch}: ${err}`)
      );
    }
  });

  return _subClient;
}

export async function subscribeToAttendance(
  handler: Handler<ZKClockEvent & { publishedAt: string; eventId: string }>
): Promise<void> {
  if (!handlers.has('zk:attendance')) handlers.set('zk:attendance', new Set());
  handlers.get('zk:attendance')!.add(handler as Handler<unknown>);
  const sub = await getSubscriber();
  await sub.subscribe('zk:attendance');
}

export async function subscribeToHealth(
  handler: Handler<ZKHealthStatus & { publishedAt: string }>
): Promise<void> {
  if (!handlers.has('zk:health')) handlers.set('zk:health', new Set());
  handlers.get('zk:health')!.add(handler as Handler<unknown>);
  const sub = await getSubscriber();
  await sub.subscribe('zk:health');
}
