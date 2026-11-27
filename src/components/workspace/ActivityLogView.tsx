import {useMemo, useState} from 'react';
import {Search} from 'lucide-react';
import type {
  ActivityCategory,
  ActivityLogItem,
  BnccEvent,
  UserAccount,
} from '../../types/database';
import {redactActivityForRole} from '../../utils/pipeline';

interface ActivityLogViewProps {
  user: UserAccount;
  activeEvent: BnccEvent;
  logs: ActivityLogItem[];
}

const CATEGORIES: Array<'Semua Kategori' | ActivityCategory> = [
  'Semua Kategori',
  'Proposal & Pipeline',
  'Contact Person',
  'Pitching & MoU',
  'Impor & Handover',
];

function getCategoryStyle(category: ActivityCategory): string {
  switch (category) {
    case 'Contact Person':
      return 'bg-amber-50 text-[#B45309]';
    case 'Proposal & Pipeline':
      return 'bg-red-50 text-[#DC2626]';
    case 'Pitching & MoU':
      return 'bg-emerald-50 text-[#15803D]';
    case 'Impor & Handover':
      return 'bg-indigo-50 text-indigo-700';
  }
}

export function ActivityLogView({user, activeEvent, logs}: ActivityLogViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<'Semua Kategori' | ActivityCategory>(
    'Semua Kategori'
  );
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return logs.filter((log) => {
      if (selectedCategory !== 'Semua Kategori' && log.category !== selectedCategory) {
        return false;
      }
      if (!query) return true;
      const desc = redactActivityForRole(log, user.canViewSponsorshipValue).toLowerCase();
      return (
        log.title.toLowerCase().includes(query) ||
        log.actorName.toLowerCase().includes(query) ||
        (log.companyName ?? '').toLowerCase().includes(query) ||
        desc.includes(query)
      );
    });
  }, [logs, selectedCategory, searchQuery, user.canViewSponsorshipValue]);

  return (
    <div className="space-y-5">
      {/* Header & Filter Card */}
      <div className="rounded-2xl border border-[#DBEAFE] bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-[#0755B1]">
              Log Aktivitas &amp; Audit Trail — {activeEvent.name}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#64748B]">
              Merekam setiap perubahan status proposal, update CP, keputusan pitching/grading, MoU, impor, dan handover pengurus
            </p>
          </div>
          <span className="rounded-lg bg-[#E6F0FD] px-3 py-1 font-mono text-xs font-bold tabular-nums text-[#0755B1]">
            {filteredLogs.length} Aktivitas Tercatat
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filter kategori log">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedCategory(cat)}
                  className={`min-h-[34px] rounded-xl px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#0755B1] text-white'
                      : 'bg-[#E6F0FD]/75 text-[#334155] hover:bg-[#BCD9FC]/60'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:w-[260px]">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari aktor / perusahaan..."
              aria-label="Cari aktor atau perusahaan dalam log"
              className="block h-9 w-full rounded-xl border border-slate-200 bg-white pr-3 pl-8 text-xs text-[#1E1E1E] focus:border-[#0755B1] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Log Entries */}
      {filteredLogs.length === 0 ? (
        <div className="rounded-2xl border border-[#DBEAFE] bg-white px-5 py-10 text-center text-xs sm:text-sm font-medium text-[#64748B]">
          Tidak ada log aktivitas yang cocok dengan filter saat ini.
        </div>
      ) : (
        <div className="rounded-2xl border border-[#DBEAFE] bg-white p-5 sm:p-6">
          <ol className="relative space-y-4 border-l-2 border-[#DBEAFE] pl-5">
            {filteredLogs.map((log) => (
              <li key={log.id} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute -left-[27px] top-4 h-3 w-3 rounded-full border-2 border-white bg-[#0755B1]"
                />
                <div className="rounded-xl border border-[#DBEAFE] bg-[#F8FBFF] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${getCategoryStyle(
                          log.category
                        )}`}
                      >
                        {log.category}
                      </span>
                      <h2 className="text-sm font-extrabold text-[#1E1E1E]">
                        {log.title}
                      </h2>
                    </div>
                    <span className="font-mono text-[11px] text-[#64748B]">
                      {log.timestamp}
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs sm:text-sm text-[#334155]">
                    {redactActivityForRole(log, user.canViewSponsorshipValue)}
                  </p>
                  <p className="mt-1.5 text-[11px] font-semibold text-[#64748B]">
                    Oleh: {log.actorName} ({log.actorRole})
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
