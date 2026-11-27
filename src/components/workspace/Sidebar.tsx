import {useState} from 'react';
import {
  CheckCircle2,
  ClipboardList,
  Clock,
  Download,
  FileText,
  Home,
  LogOut,
  Menu,
  Plus,
  RotateCcw,
  X,
} from 'lucide-react';
import type {BnccEvent, UserAccount} from '../../types/database';

export type WorkspaceView =
  | 'dashboard'
  | 'sponsorship'
  | 'proposal-new'
  | 'mou-templates'
  | 'edit-approvals'
  | 'import-spreadsheet'
  | 'activity-log';

interface SidebarProps {
  user: UserAccount;
  events: BnccEvent[];
  activeEventId: string;
  onSelectEvent: (eventId: string) => void;
  activeView: WorkspaceView;
  onSelectView: (view: WorkspaceView) => void;
  pendingApprovalCount: number;
  onLogout: () => void;
  onResetDemoData: () => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

export function Sidebar({
  user,
  events,
  activeEventId,
  onSelectEvent,
  activeView,
  onSelectView,
  pendingApprovalCount,
  onLogout,
  onResetDemoData,
}: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isManager = user.role === 'admin';

  const navItems: Array<{
    id: WorkspaceView;
    label: string;
    icon: typeof Home;
    badge?: number;
    managerOnly?: boolean;
  }> = [
    {
      id: 'dashboard',
      label: isManager ? 'Dashboard Manager' : 'Dashboard Staff',
      icon: Home,
    },
    {
      id: 'sponsorship',
      label: 'Daftar Sponsorship',
      icon: ClipboardList,
    },
    {
      id: 'proposal-new',
      label: 'Proposal Baru',
      icon: Plus,
    },
    {
      id: 'mou-templates',
      label: 'Template MoU Event',
      icon: FileText,
    },
    {
      id: 'edit-approvals',
      label: 'Persetujuan Edit',
      icon: CheckCircle2,
      badge: pendingApprovalCount,
      managerOnly: true,
    },
    {
      id: 'import-spreadsheet',
      label: 'Impor Spreadsheet',
      icon: Download,
    },
    {
      id: 'activity-log',
      label: 'Log Aktivitas',
      icon: Clock,
    },
  ];

  const visibleNavItems = navItems.filter((item) => !item.managerOnly || isManager);

  const handleNavClick = (view: WorkspaceView) => {
    onSelectView(view);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white">
      <div>
        {/* Brand Header */}
        <div className="border-b border-[#DBEAFE] px-6 py-6">
          <p className="text-[26px] font-extrabold tracking-tight text-[#0755B1] leading-none">
            Gather.in
          </p>
          <p className="mt-1.5 text-sm font-medium text-[#64748B]">
            BNCC Sponsorship Hub
          </p>
        </div>

        {/* Active Event Switcher */}
        <div className="px-5 pt-5">
          <div className="rounded-2xl border border-[#DBEAFE] bg-[#F3F8FD] p-3.5">
            <label
              htmlFor="sidebar-event-select"
              className="block text-[11px] font-extrabold tracking-wider text-[#0755B1] uppercase"
            >
              Event Aktif Dikelola
            </label>
            <select
              id="sidebar-event-select"
              value={activeEventId}
              onChange={(e) => onSelectEvent(e.target.value)}
              className="mt-2 block w-full rounded-xl border border-[#BCD9FC] bg-white px-3 py-2 text-sm font-semibold text-[#1E1E1E] focus:border-[#0755B1] focus:outline-none focus:ring-2 focus:ring-[#83B1EC]/40"
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Navigation */}
        <nav aria-label="Menu Utama" className="px-5 pt-6">
          <p className="px-2 text-[11px] font-bold tracking-wider text-[#64748B] uppercase">
            Menu Utama
          </p>
          <ul className="mt-2.5 space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex min-h-[44px] w-full items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-[#0755B1] text-white shadow-sm'
                        : 'text-[#334155] hover:bg-[#E6F0FD] hover:text-[#0755B1]'
                    }`}
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="truncate">{item.label}</span>
                    </span>
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span
                        className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 font-mono text-[11px] font-bold tabular-nums ${
                          isActive
                            ? 'bg-white text-[#0755B1]'
                            : 'bg-[#DC2626] text-white'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* User Footer */}
      <div className="border-t border-[#DBEAFE] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0755B1] text-sm font-bold text-white">
            {getInitials(user.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-[#1E1E1E]">
              {user.name} ({isManager ? 'Manager' : 'Staff'})
            </p>
            <p className="truncate text-xs font-medium text-[#0755B1]">
              {isManager ? 'Akun Pengurus/Bendahara' : 'Akun Staff EEO'}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#DBEAFE] bg-[#F3F8FD] px-3 py-1.5 text-xs font-semibold text-[#0755B1] transition-colors hover:bg-[#E6F0FD] cursor-pointer whitespace-nowrap"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Keluar</span>
          </button>
          <button
            type="button"
            onClick={onResetDemoData}
            title="Kembalikan data prototype ke JSON awal"
            aria-label="Reset Data Demo"
            className="inline-flex min-h-[38px] items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar (< lg) — under 15% viewport height */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-[#DBEAFE] bg-white px-4 py-2.5 lg:hidden">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Buka menu navigasi"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#DBEAFE] bg-[#F3F8FD] text-[#0755B1]"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="min-w-0">
            <p className="truncate text-base font-extrabold text-[#0755B1] leading-tight">
              Gather.in
            </p>
            <p className="truncate text-xs font-medium text-[#64748B]">
              {events.find((e) => e.id === activeEventId)?.name ?? 'BNCC EEO'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-xl border border-[#DBEAFE] bg-[#F3F8FD] px-3 text-xs font-bold text-[#0755B1] whitespace-nowrap"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Keluar</span>
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true" aria-label="Menu Navigasi">
          <div
            className="fixed inset-0 bg-slate-900/45"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-[280px] max-w-[85vw] flex-col bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Tutup menu navigasi"
              className="absolute top-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="h-full overflow-y-auto">{sidebarContent}</div>
          </aside>
        </div>
      )}

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block lg:w-[272px] lg:shrink-0 lg:border-r lg:border-[#DBEAFE] lg:bg-white">
        <div className="sticky top-0 h-screen overflow-y-auto">{sidebarContent}</div>
      </aside>
    </>
  );
}
