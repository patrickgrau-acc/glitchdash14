// Browser-local persistence (no backend). Namespaced + guarded.
const NS = 'game';

export function loadNumber(key: string, dflt = 0): number {
  try { const v = localStorage.getItem(NS + '.' + key); return v ? (parseInt(v, 10) || dflt) : dflt; }
  catch { return dflt; }
}
export function saveNumber(key: string, val: number): void {
  try { localStorage.setItem(NS + '.' + key, String(val)); } catch { /* storage full/disabled */ }
}
export function loadJSON<T>(key: string, dflt: T): T {
  try { const v = localStorage.getItem(NS + '.' + key); return v ? (JSON.parse(v) as T) : dflt; }
  catch { return dflt; }
}
export function saveJSON(key: string, val: unknown): void {
  try { localStorage.setItem(NS + '.' + key, JSON.stringify(val)); } catch { /* ignore */ }
}
