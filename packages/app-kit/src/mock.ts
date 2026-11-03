// Generic mock transport: latency, offline, timeout. Case apps supply the handlers.
export type Net = 'online' | 'offline';
export type Latency = 'fast' | 'normal' | 'slow';
export class MockError extends Error {
  constructor(public code: string, public sent: boolean) { super(code); }
}
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function mockCall<T>(opts: { net: Net; latency: Latency; normalMs: number; timeoutMs?: number }, run: () => T | Promise<T>): Promise<T> {
  if (opts.net === 'offline') throw new MockError('network', false); // request never left the device
  const ms = opts.latency === 'fast' ? 150 : opts.latency === 'slow' ? Math.max(3000, opts.normalMs) : opts.normalMs;
  if (opts.timeoutMs && ms > opts.timeoutMs) { await sleep(opts.timeoutMs); throw new MockError('timeout', true); }
  await sleep(ms);
  return run();
}
