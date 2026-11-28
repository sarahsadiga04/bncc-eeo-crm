import {useMemo, useState} from 'react';
import {Bell, Phone, Plus, Search, User} from 'lucide-react';
import {motion} from 'motion/react';
import type {BnccEvent, PartnerRecord, UserAccount} from '../../types/database';
import {
  EASE_OUT_EXPO,
  staggerContainerVariants,
  staggerItemVariants,
} from '../../utils/motion';
import {
  computeEventSummary,
  formatRupiah,
  formatShortDate,
  getPartnerUrgency,
} from '../../utils/pipeline';

interface SponsorshipListViewProps {
  user: UserAccount;
  activeEvent: BnccEvent;
  partners: PartnerRecord[];
  onOpenNewProposal: () => void;
  onOpenPartnerDetail: (partnerId: string) => void;
}

type SortOption = 'status' | 'newest' | 'name';
type StatusFilter = 'All' | 'Pending' | 'Accept' | 'Decline';

export function SponsorshipListView({
  user,
  activeEvent,
  partners,
  onOpenNewProposal,
  onOpenPartnerDetail,
}: SponsorshipListViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('status');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [onlyOverdue, setOnlyOverdue] = useState(false);

  const isManager = user.role === 'admin';
  const summary = computeEventSummary(partners, user.canViewSponsorshipValue);

  const filteredPartners = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const list = partners.filter((p) => {
      if (statusFilter !== 'All' && p.result !== statusFilter) return false;
      if (onlyOverdue && !getPartnerUrgency(p).isOverdue) return false;
      if (!query) return true;
      return (
        p.companyName.toLowerCase().includes(query) ||
        p.contactPerson.name.toLowerCase().includes(query) ||
        p.picInternal.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    });

    const sorted = [...list];
    if (sortBy === 'name') {
      sorted.sort((a, b) => a.companyName.localeCompare(b.companyName));
    } else if (sortBy === 'newest') {
      sorted.sort((a, b) => b.proposalSentAt.localeCompare(a.proposalSentAt));
    } else {
      const order: Record<string, number> = {Pending: 0, Decline: 1, Accept: 2};
      sorted.sort((a, b) => {
        const diff = (order[a.result] ?? 9) - (order[b.result] ?? 9);
        if (diff !== 0) return diff;
        return a.companyName.localeCompare(b.companyName);
      });
    }
    return sorted;
  }, [partners, searchQuery, sortBy, statusFilter, onlyOverdue]);

  return (
    <div className="space-y-5">
      {/* Top Search & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search
            className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#0755B1]/60"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Cari partner atau PIC di ${activeEvent.name}...`}
            aria-label="Cari partner sponsorship"
            className="block h-11 w-full rounded-full border border-[#BCD9FC] bg-[#E6F0FD]/65 pr-4 pl-10 text-sm text-[#1E1E1E] placeholder:text-[#64748B] focus:border-[#0755B1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#83B1EC]/40"
          />
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setOnlyOverdue((prev) => !prev)}
            aria-pressed={onlyOverdue}
            title="Filter proposal yang melewati jadwal follow-up"
            className={`relative inline-flex h-11 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              onlyOverdue
                ? 'border-red-300 bg-red-50 text-[#DC2626]'
                : 'border-[#DBEAFE] bg-white text-[#334155] hover:border-[#83B1EC]'
            }`}
          >
            <Bell className="h-4 w-4" aria-hidden="true" />
            <span className="font-mono tabular-nums">{summary.overdueCount}</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewProposal}
            className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-[#0755B1] px-4 text-xs sm:text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#105EA9] cursor-pointer whitespace-nowrap"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Proposal Baru</span>
          </button>
        </div>
      </div>

      {/* 3 Status KPI Summary Cards */}
      <motion.div
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
      >
        <motion.div
          variants={staggerItemVariants}
          whileHover={{y: -2, transition: {duration: 0.15}}}
          className="rounded-2xl border border-[#DBEAFE] bg-white p-5"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-extrabold tracking-wider text-[#B45309] uppercase">
              Status : Pending
            </p>
            <span className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-[#B45309]">
              On Progress
            </span>
          </div>
          <p className="mt-3 font-mono text-3xl font-extrabold tabular-nums text-[#B45309]">
            {summary.pendingCount}
          </p>
          <p className="mt-1 text-xs text-[#64748B]">Sedang follow-up D+3/D+7</p>
        </motion.div>

        <motion.div
          variants={staggerItemVariants}
          whileHover={{y: -2, transition: {duration: 0.15}}}
          className="rounded-2xl border border-[#DBEAFE] bg-white p-5"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-extrabold tracking-wider text-[#DC2626] uppercase">
              Status : Decline
            </p>
            <span className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-[#DC2626]">
              Decline
            </span>
          </div>
          <p className="mt-3 font-mono text-3xl font-extrabold tabular-nums text-[#DC2626]">
            {summary.declineCount}
          </p>
          <p className="mt-1 text-xs text-[#64748B]">Wajib tercatat alasan penolakan</p>
        </motion.div>

        <motion.div
          variants={staggerItemVariants}
          whileHover={{y: -2, transition: {duration: 0.15}}}
          className="rounded-2xl border border-[#DBEAFE] bg-white p-5"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-extrabold tracking-wider text-[#15803D] uppercase">
              Status : Accept
            </p>
            <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-[#15803D]">
              Accept
            </span>
          </div>
          <p className="mt-3 font-mono text-3xl font-extrabold tabular-nums text-[#15803D]">
            {summary.acceptCount}
          </p>
          <p className="mt-1 text-xs font-medium text-[#64748B]">
            {summary.totalDealValue !== null
              ? `Total Deal : ${formatRupiah(summary.totalDealValue)}`
              : 'Deal yang berhasil'}
          </p>
        </motion.div>
      </motion.div>

      {/* Partner List Card */}
      <div className="rounded-2xl border border-[#DBEAFE] bg-white p-4 sm:p-5">
        {/* Toolbar: Sort & Status Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="sort-sponsorship" className="sr-only">
              Urutkan berdasarkan
            </label>
            <select
              id="sort-sponsorship"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#1E1E1E] focus:border-[#0755B1] focus:outline-none"
            >
              <option value="status">Sort : Status</option>
              <option value="newest">Sort : Terbaru</option>
              <option value="name">Sort : Nama A-Z</option>
            </select>

            <div className="flex flex-wrap items-center gap-1 rounded-xl bg-[#F3F8FD] p-1">
              {(['All', 'Pending', 'Accept', 'Decline'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    statusFilter === status
                      ? 'bg-[#0755B1] text-white'
                      : 'text-[#475569] hover:text-[#0755B1]'
                  }`}
                >
                  {status === 'All' ? 'Semua' : status === 'Pending' ? 'On Progress' : status}
                </button>
              ))}
            </div>
          </div>

          <div
            className={`hidden md:grid items-center gap-4 text-xs font-bold text-[#64748B] ${
              isManager ? 'grid-cols-[90px_110px_100px]' : 'grid-cols-[110px_100px]'
            } text-center`}
          >
            {isManager && <span>Grade</span>}
            <span>Status</span>
            <span>Date</span>
          </div>
        </div>

        {/* Rows */}
        {filteredPartners.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-semibold text-[#64748B]">
              Tidak ada data partner yang sesuai filter pencarian.
            </p>
          </div>
        ) : (
          <div className="mt-3 space-y-2.5">
            {filteredPartners.map((partner, index) => {
              const urgency = getPartnerUrgency(partner);
              return (
                <motion.button
                  key={partner.id}
                  type="button"
                  onClick={() => onOpenPartnerDetail(partner.id)}
                  initial={{opacity: 0, y: 8}}
                  animate={{opacity: 1, y: 0}}
                  transition={{
                    duration: 0.22,
                    delay: Math.min(index * 0.03, 0.22),
                    ease: EASE_OUT_EXPO,
                  }}
                  whileHover={{y: -1.5, transition: {duration: 0.14}}}
                  whileTap={{scale: 0.995}}
                  className={`w-full rounded-xl border p-4 text-left transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0755B1] ${
                    urgency.isOverdue
                      ? 'border-red-200 bg-red-50/40 hover:border-red-300'
                      : 'border-[#DBEAFE] bg-white hover:border-[#0755B1]/50 hover:bg-[#F3F8FD]/50'
                  }`}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm sm:text-base font-extrabold text-[#1E1E1E]">
                          {partner.companyName}
                        </span>
                        <span className="text-xs font-medium text-[#64748B]">
                          {partner.category}
                        </span>
                      </div>

                      <p
                        className={`mt-1 text-xs font-semibold ${
                          urgency.isOverdue
                            ? 'text-[#DC2626]'
                            : partner.result === 'Accept'
                              ? 'text-[#15803D]'
                              : 'text-[#0755B1]'
                        }`}
                      >
                        • {partner.pipelineStatus}
                      </p>

                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#475569]">
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-[#64748B]" aria-hidden="true" />
                          PIC EEO: {partner.picInternal}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-[#64748B]" aria-hidden="true" />
                          CP Partner: {partner.contactPerson.name} ({partner.contactPerson.contact})
                        </span>
                      </div>
                    </div>

                    <div
                      className={`grid items-center gap-3 sm:gap-4 shrink-0 ${
                        isManager
                          ? 'grid-cols-3 md:w-[320px]'
                          : 'grid-cols-2 md:w-[220px]'
                      } text-center`}
                    >
                      {isManager && (
                        <span className="text-xs sm:text-sm font-bold text-[#1E1E1E]">
                          {partner.grade || '-'}
                        </span>
                      )}

                      <div>
                        <span
                          className={`inline-block rounded-lg px-2.5 py-1 text-xs font-bold ${
                            partner.result === 'Accept'
                              ? 'bg-emerald-50 text-[#15803D]'
                              : partner.result === 'Decline'
                                ? 'bg-red-50 text-[#DC2626]'
                                : 'bg-amber-50 text-[#B45309]'
                          }`}
                        >
                          {partner.result === 'Pending' ? 'On Progress' : partner.result}
                        </span>
                      </div>

                      <div className="text-right md:text-center">
                        <p className="font-mono text-xs font-semibold tabular-nums text-[#334155]">
                          {formatShortDate(urgency.dueDate)}
                        </p>
                        {urgency.isOverdue && (
                          <p className="text-[11px] font-bold text-[#DC2626]">
                            Overdue
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
