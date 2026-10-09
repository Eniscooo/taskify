import { randomInt } from 'node:crypto';

/** "Adaeze Okafor" → "adaeze.o", matching the style of existing usernames. */
export function usernameBase(name: string): string {
  const words = name
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return 'user';
  const [first, ...rest] = words;
  const last = rest.at(-1);
  return (last ? `${first}.${last[0]}` : first!).slice(0, 24);
}

/**
 * Picks a username not already taken: the plain base first, then the base
 * with a random number. `isTaken` checks the database.
 */
export async function uniqueUsername(name: string, isTaken: (username: string) => Promise<boolean>) {
  const base = usernameBase(name);
  if (!(await isTaken(base))) return base;
  for (let i = 0; i < 5; i++) {
    const candidate = `${base}${randomInt(10, 10_000)}`;
    if (!(await isTaken(candidate))) return candidate;
  }
  return `${base}${randomInt(10_000, 100_000_000)}`;
}
