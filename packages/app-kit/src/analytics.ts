// Console + in-memory event log (build-spec.md > Analytics: no vendor).
export type AnalyticsEvent = { name: string; props: Record<string, unknown>; at: number };
const log: AnalyticsEvent[] = [];
const subs = new Set<() => void>();
let common: Record<string, unknown> = {};

export const analytics = {
  setCommon(p: Record<string, unknown>) { common = { ...common, ...p }; },
  track(name: string, props: Record<string, unknown> = {}) {
    const e = { name, props: { ...common, ...props }, at: Date.now() };
    log.unshift(e);
    if (log.length > 200) log.pop();
    console.log('[event]', name, e.props);
    subs.forEach((f) => f());
  },
  list: () => log,
  subscribe(f: () => void) { subs.add(f); return () => { subs.delete(f); }; },
};
