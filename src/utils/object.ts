export function cleanObject<T extends Record<string, unknown>>(obj: T, sort = false): T {
  const entries = Object.entries(obj).filter(([, value]) => value !== undefined);
  if (sort) {
    entries.sort((a, b) => a[0].localeCompare(b[0]));
  }

  return Object.fromEntries(entries) as T;
}
