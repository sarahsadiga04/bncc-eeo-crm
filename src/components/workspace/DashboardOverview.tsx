import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  Phone,
  Plus,
  User,
} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';
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
  TIMELINE_STEPS,
} from '../../utils/pipeline';
import type {WorkspaceView} from './Sidebar';

interface DashboardOverviewProps {
  user: UserAccount;
  events: BnccEvent[];
  activeEvent: BnccEvent;
  partners: PartnerRecord[];
  onSelectEvent: (eventId: string) => void;
  onNavigate: (view: WorkspaceView) => void;
  onOpenNewEventModal: () => void;
  onOpenPartnerDetail: (partnerId: string) => void;
  onMarkFollowUpDone: (partnerId: string) => void;
}

export function DashboardOverview({
  user,
  events,
  activeEvent,
  partners,
  onSelectEvent,
  onNavigate,
  onOpenNewEventModal,
  onOpenPartnerDetail,
  onMarkFollowUpDone,
}: DashboardOverviewProps) {
  const isManager = user.role === 'admin';
  const summary = computeEventSummary(partners, user.canViewSponsorshipValue);

  const urgentPartners = partners
    .map((partner) => ({
      partner,
      urgency: getPartnerUrgency(partner),
    }))
    .filter((entry) => entry.partner.result === 'Pending' && entry.urgency.isOverdue);

  return (
    <div className="space-y-6">
      {/* Top Event Header Card */}
      <section className="rounded-2xl border border-[#DBEAFE] bg-white p-5 sm:p-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#1E1E1E]">
          {activeEvent.name}
        </h1>
        <p className="mt-1 text-sm text-[#475569]">
          {isManager
            ? 'Mode Manager: Anda dapat mengatur hasil pitching, grading, nominal sponsorship, Template MoU, dan menyetujui permintaan edit staff.'
            : 'Mode Staff: Anda dapat input proposal cepat, memperbarui progres follow-up, menjadwalkan meeting, dan mengajukan pembaruan Contact Person.'}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-2 rounded-xl bg-[#E6F0FD] px-3 py-2">
            <label
              htmlFor="dashboard-event-switch"
              className="text-xs font-bold text-[#0755B1] whitespace-nowrap"
            >
              Pilih Event :
            </label>
            <select
              id="dashboard-event-switch"
              value={activeEvent.id}
              onChange={(e) => onSelectEvent(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-bold text-[#0755B1] focus:outline-none cursor-pointer"
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.name}
                </option>
              ))}
            </select>
          </div>

          {isManager && (
            <button
              type="button"
              onClick={onOpenNewEventModal}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#BCD9FC] bg-white px-3.5 py-2 text-xs sm:text-sm font-bold text-[#0755B1] transition-colors hover:bg-[#F3F8FD] cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Event Baru</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigate('proposal-new')}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#0755B1] px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#105EA9] cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Proposal Baru</span>
          </button>
        </div>
      </section>

      {/* 4-Column KPI + Quick Access Row */}
      <motion.section
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1.4fr]"
      >
        {/* Pending Card */}
        <motion.div
          variants={staggerItemVariants}
          whileHover={{y: -2, transition: {duration: 0.15}}}
          className="rounded-2xl border border-[#DBEAFE] bg-white p-5"
        >
          <p className="text-[11px] font-extrabold tracking-wider text-[#B45309] uppercase">
            Status : Pending
          </p>
          <span className="mt-2 inline-block rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-[#B45309]">
            On Progress
          </span>
          <p className="mt-3 font-mono text-3xl font-extrabold tabular-nums text-[#1E1E1E]">
            {summary.pendingCount}
          </p>
          <p className="mt-1 text-xs text-[#64748B]">Sedang follow-up D+3/D+7</p>
        </motion.div>

        {/* Accept Card */}
        <motion.div
          variants={staggerItemVariants}
          whileHover={{y: -2, transition: {duration: 0.15}}}
          className="rounded-2xl border border-[#DBEAFE] bg-white p-5"
        >
          <p className="text-[11px] font-extrabold tracking-wider text-[#15803D] uppercase">
            Status : Accept
          </p>
          <span className="mt-2 inline-block rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-[#15803D]">
            Deal / Pitching
          </span>
          <p className="mt-3 font-mono text-3xl font-extrabold tabular-nums text-[#15803D]">
            {summary.acceptCount}
          </p>
          <p className="mt-1 text-xs font-medium text-[#64748B]">
            {summary.totalDealValue !== null
              ? `Total Deal : ${formatRupiah(summary.totalDealValue)}`
              : 'Deal yang berhasil'}
          </p>
        </motion.div>

        {/* Decline Card */}
        <motion.div
          variants={staggerItemVariants}
          whileHover={{y: -2, transition: {duration: 0.15}}}
          className="rounded-2xl border border-[#DBEAFE] bg-white p-5"
        >
          <p className="text-[11px] font-extrabold tracking-wider text-[#475569] uppercase">
            Status : Decline
          </p>
          <span className="mt-2 inline-block rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-[#475569]">
            Arsip Done
          </span>
          <p className="mt-3 font-mono text-3xl font-extrabold tabular-nums text-[#1E1E1E]">
            {summary.declineCount}
          </p>
          <p className="mt-1 text-xs text-[#64748B]">Wajib tercatat alasan penolakan</p>
        </motion.div>

        {/* Quick Menu Card */}
        <motion.div
          variants={staggerItemVariants}
          className="rounded-2xl border border-[#DBEAFE] bg-white p-5"
        >
          <p className="text-[11px] font-extrabold tracking-wider text-[#0755B1] uppercase">
            Akses Menu Cepat Event
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onNavigate('proposal-new')}
              className="flex min-h-[38px] items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-bold text-[#1E1E1E] transition-colors hover:border-[#83B1EC] hover:bg-[#F3F8FD] cursor-pointer whitespace-nowrap"
            >
              <BarChart3 className="h-3.5 w-3.5 shrink-0 text-[#0755B1]" aria-hidden="true" />
              <span>Proposal Track</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('sponsorship')}
              className="flex min-h-[38px] items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-bold text-[#1E1E1E] transition-colors hover:border-[#83B1EC] hover:bg-[#F3F8FD] cursor-pointer whitespace-nowrap"
            >
              <ClipboardList className="h-3.5 w-3.5 shrink-0 text-[#0755B1]" aria-hidden="true" />
              <span>Daftar Sponsor</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('mou-templates')}
              className="flex min-h-[38px] items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-bold text-[#1E1E1E] transition-colors hover:border-[#83B1EC] hover:bg-[#F3F8FD] cursor-pointer whitespace-nowrap"
            >
              <FileText className="h-3.5 w-3.5 shrink-0 text-[#0755B1]" aria-hidden="true" />
              <span>Template MoU</span>
            </button>
            {isManager ? (
              <button
                type="button"
                onClick={() => onNavigate('edit-approvals')}
                className="flex min-h-[38px] items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-bold text-[#1E1E1E] transition-colors hover:border-[#83B1EC] hover:bg-[#F3F8FD] cursor-pointer whitespace-nowrap"
              >
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#0755B1]" aria-hidden="true" />
                <span>Approval Edit</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate('activity-log')}
                className="flex min-h-[38px] items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-bold text-[#1E1E1E] transition-colors hover:border-[#83B1EC] hover:bg-[#F3F8FD] cursor-pointer whitespace-nowrap"
              >
                <Clock className="h-3.5 w-3.5 shrink-0 text-[#0755B1]" aria-hidden="true" />
                <span>Log Aktivitas</span>
              </button>
            )}
          </div>
        </motion.div>
      </motion.section>

      {/* Urgent Follow-Up Alert Box */}
      <section
        data-testid="urgent-followup-section"
        className="rounded-2xl border border-red-200 bg-white p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm sm:text-base font-extrabold text-[#1E1E1E]">
              Perlu Follow-Up Segera
            </span>
            <span className="text-xs sm:text-sm font-semibold text-[#DC2626]">
              · Melewati jadwal D+3 / D+7
            </span>
          </div>
          <span className="rounded-lg bg-[#DC2626] px-3 py-1 font-mono text-xs font-bold tabular-nums text-white">
            {urgentPartners.length} Proposal
          </span>
        </div>

        {urgentPartners.length === 0 ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm font-medium text-emerald-800">
            Semua proposal aktif pada event ini sudah di-follow up tepat waktu.
          </div>
        ) : (
          <div className="mt-4 divide-y divide-slate-100">
            <AnimatePresence initial={false}>
              {urgentPartners.map(({partner, urgency}) => (
                <motion.div
                  key={partner.id}
                  initial={{opacity: 0, y: 8}}
                  animate={{opacity: 1, y: 0}}
                  exit={{opacity: 0, x: 16}}
                  transition={{duration: 0.2, ease: EASE_OUT_EXPO}}
                  className="flex flex-col gap-3 py-3.5 first:pt-1 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-[#1E1E1E]">
                      {partner.companyName}
                    </p>
                    <span className="rounded-md bg-[#E6F0FD] px-2 py-0.5 text-[11px] font-bold text-[#0755B1]">
                      {partner.pipelineStatus}
                    </span>
                    <span className="rounded-md bg-red-50 px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums text-[#DC2626]">
                      Jatuh Tempo: {urgency.dueDate}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#475569]">
                    <span className="inline-flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-[#64748B]" aria-hidden="true" />
                      PIC EEO: <strong className="text-[#1E1E1E]">{partner.picInternal}</strong>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-[#64748B]" aria-hidden="true" />
                      CP Partner: <strong className="text-[#1E1E1E]">{partner.contactPerson.name}</strong> ({partner.contactPerson.contact})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onMarkFollowUpDone(partner.id)}
                    className="inline-flex min-h-[38px] items-center justify-center rounded-xl bg-[#16A34A] px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#15803D] cursor-pointer whitespace-nowrap"
                  >
                    Selesai Follow-Up
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenPartnerDetail(partner.id)}
                    className="inline-flex min-h-[38px] items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#334155] transition-colors hover:border-[#83B1EC] hover:text-[#0755B1] cursor-pointer whitespace-nowrap"
                  >
                    <span>Detail</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Pipeline, Meeting & Benefit Tracking Card */}
      <section className="rounded-2xl border border-[#DBEAFE] bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#1E1E1E]">
              Tracking Pipeline, Meeting &amp; Benefit ({activeEvent.name})
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-[#64748B]">
              Ringkasan tahap aktif, jadwal meeting, dan pemenuhan benefit
            </p>
            <button
              type="button"
              onClick={() => onNavigate('sponsorship')}
              className="mt-2 text-xs sm:text-sm font-bold text-[#0755B1] hover:underline cursor-pointer"
            >
              Lihat Daftar Sponsorship Lengkap
            </button>
          </div>
        </div>

        {partners.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-[#BCD9FC] bg-[#F3F8FD] p-8 text-center">
            <p className="text-sm font-semibold text-[#334155]">
              Belum ada partner tercatat pada event {activeEvent.name}.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('proposal-new')}
              className="mt-3 inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#0755B1] px-4 py-2 text-xs font-bold text-white hover:bg-[#105EA9] cursor-pointer"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Tambah Proposal Pertama</span>
            </button>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {partners.map((partner, index) => {
              const urgency = getPartnerUrgency(partner);
              const doneBenefits = partner.benefits.filter((b) => b.completed).length;
              const nextMeeting = partner.meetings[0];
              const stepDef = TIMELINE_STEPS[Math.max(0, Math.min(8, partner.currentStep - 1))];

              return (
                <motion.div
                  key={partner.id}
                  initial={{opacity: 0, y: 10}}
                  animate={{opacity: 1, y: 0}}
                  transition={{
                    duration: 0.24,
                    delay: Math.min(index * 0.04, 0.28),
                    ease: EASE_OUT_EXPO,
                  }}
                  whileHover={{y: -2, transition: {duration: 0.15}}}
                  className={`rounded-2xl border p-4 transition-colors ${
                    urgency.isOverdue
                      ? 'border-red-200 bg-red-50/20'
                      : 'border-[#DBEAFE] bg-white hover:border-[#83B1EC]'
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-extrabold text-[#1E1E1E]">
                          {partner.companyName}
                        </span>
                        <span className="text-xs font-medium text-[#64748B]">
                          {partner.category}
                        </span>
                        <span
                          className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums ${
                            urgency.isOverdue
                              ? 'border border-amber-200 bg-amber-50 text-[#B45309]'
                              : 'border border-emerald-200 bg-emerald-50 text-[#15803D]'
                          }`}
                        >
                          {urgency.isOverdue
                            ? `Perlu cek (${urgency.daysElapsed} hr)`
                            : `Aktif (${urgency.daysElapsed} hr)`}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-bold text-[#0755B1]">
                          • Tahap {partner.currentStep}/9: {partner.pipelineStatus || stepDef.label}
                        </span>
                        {nextMeeting && (
                          <span className="rounded-md bg-[#E6F0FD] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#0755B1]">
                            Meeting: {formatShortDate(nextMeeting.date)}
                          </span>
                        )}
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-[#334155]">
                          Benefit: {doneBenefits}/{partner.benefits.length}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#475569]">
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-[#64748B]" aria-hidden="true" />
                          PIC EEO: <strong className="text-[#1E1E1E]">{partner.picInternal}</strong>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-[#64748B]" aria-hidden="true" />
                          CP Partner: <strong className="text-[#1E1E1E]">{partner.contactPerson.name}</strong> ({partner.contactPerson.contact})
                        </span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <span
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                          partner.result === 'Accept'
                            ? 'bg-emerald-50 text-[#15803D] border border-emerald-200'
                            : partner.result === 'Decline'
                              ? 'bg-red-50 text-[#DC2626] border border-red-200'
                              : 'bg-amber-50 text-[#B45309] border border-amber-200'
                        }`}
                      >
                        {partner.result === 'Pending' ? 'On Progress' : partner.result}
                      </span>

                      <button
                        type="button"
                        onClick={() => onOpenPartnerDetail(partner.id)}
                        className="inline-flex min-h-[36px] items-center justify-center rounded-xl bg-[#E6F0FD] px-3 py-1.5 text-xs font-bold text-[#0755B1] transition-colors hover:bg-[#BCD9FC] cursor-pointer whitespace-nowrap"
                      >
                        Detail &amp; Pipeline
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
