import type {
  ActivityLogItem,
  BnccEvent,
  CpEditRequest,
  MouTemplate,
  PartnerRecord,
  PrototypeWorkspaceData,
  UserAccount,
} from '../types/database';

const SESSION_STORAGE_KEY = 'gatherin_eeo_session_v1';
const WORKSPACE_STORAGE_KEY = 'gatherin_eeo_workspace_v2';

export interface PrototypeDatabaseSnapshot {
  users: UserAccount[];
  events: BnccEvent[];
  partners: PartnerRecord[];
  mouTemplates: MouTemplate[];
  editRequests: CpEditRequest[];
  activityLogs: ActivityLogItem[];
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

export async function loadSeedWorkspaceFromJson(): Promise<PrototypeWorkspaceData> {
  const [users, events, partners, mouTemplates, editRequests, activityLogs] = await Promise.all([
    fetchJsonFile<UserAccount[]>('./data/users.json'),
    fetchJsonFile<BnccEvent[]>('./data/events.json'),
    fetchJsonFile<PartnerRecord[]>('./data/partners.json'),
    fetchJsonFile<MouTemplate[]>('./data/mouTemplates.json'),
    fetchJsonFile<CpEditRequest[]>('./data/editRequests.json'),
    fetchJsonFile<ActivityLogItem[]>('./data/activityLogs.json'),
  ]);

  return {users, events, partners, mouTemplates, editRequests, activityLogs};
}

export async function loadDatabaseSnapshot(): Promise<PrototypeDatabaseSnapshot> {
  const seed = await loadSeedWorkspaceFromJson();
  const cached = loadWorkspaceCache();
  if (cached) {
    return {
      ...cached,
      users: seed.users,
    };
  }
  return seed;
}

export function saveWorkspaceCache(data: PrototypeWorkspaceData): void {
  try {
    localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota restrictions
  }
}

export function loadWorkspaceCache(): PrototypeWorkspaceData | null {
  try {
    const raw = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PrototypeWorkspaceData>;
    if (
      !Array.isArray(parsed.events) ||
      !Array.isArray(parsed.partners) ||
      !Array.isArray(parsed.mouTemplates) ||
      !Array.isArray(parsed.editRequests) ||
      !Array.isArray(parsed.activityLogs)
    ) {
      return null;
    }
    return parsed as PrototypeWorkspaceData;
  } catch {
    return null;
  }
}

export function clearWorkspaceCache(): void {
  try {
    localStorage.removeItem(WORKSPACE_STORAGE_KEY);
  } catch {
    // Ignore storage restrictions
  }
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
