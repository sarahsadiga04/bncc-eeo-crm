import type {BnccEvent, PartnerRecord, UserAccount} from '../types/database';

const SESSION_STORAGE_KEY = 'gatherin_eeo_session_v1';

export interface PrototypeDatabaseSnapshot {
  users: UserAccount[];
  events: BnccEvent[];
  partners: PartnerRecord[];
}

async function fetchJsonFile<T>(relativePath: string): Promise<T> {
  const response = await fetch(relativePath, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Gagal memuat database ${relativePath} (${response.status})`);
  }

  return (await response.json()) as T;
}

export async function loadUsersDatabase(): Promise<UserAccount[]> {
  return fetchJsonFile<UserAccount[]>('./data/users.json');
}

export async function loadDatabaseSnapshot(): Promise<PrototypeDatabaseSnapshot> {
  const [users, events, partners] = await Promise.all([
    fetchJsonFile<UserAccount[]>('./data/users.json'),
    fetchJsonFile<BnccEvent[]>('./data/events.json'),
    fetchJsonFile<PartnerRecord[]>('./data/partners.json'),
  ]);

  return {users, events, partners};
}

export function saveSessionUser(user: UserAccount): void {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  } catch {
    // Ignore storage quota / privacy mode restrictions
  }
}

export function loadSessionUser(): UserAccount | null {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserAccount;
  } catch {
    return null;
  }
}

export function clearSessionUser(): void {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Ignore storage restrictions
  }
}
