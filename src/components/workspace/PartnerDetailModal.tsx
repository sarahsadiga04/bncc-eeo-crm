import {useState, type FormEvent} from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  MapPin,
  Phone,
  Plus,
  Users,
  Video,
  X,
} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';
import type {
  ContactPersonInfo,
  DealResult,
  MeetingScheduleItem,
  PartnerRecord,
  UserAccount,
} from '../../types/database';
import {
  alertVariants,
  EASE_OUT_EXPO,
  modalBackdropVariants,
  modalPanelVariants,
} from '../../utils/motion';
import {
  formatRupiah,
  getNowWibLabel,
  getTodayIso,
  TIMELINE_STEPS,
} from '../../utils/pipeline';

interface PartnerDetailModalProps {
  partner: PartnerRecord;
  user: UserAccount;
  onClose: () => void;
  onUpdateProgress: (
    partnerId: string,
    nextStep: number,
    deadline: string,
    note: string
  ) => void;
  onAddMeeting: (partnerId: string, meeting: MeetingScheduleItem) => void;
  onSavePitching: (
    partnerId: string,
    payload: {
      meetingSummary: string;
      grade: string;
      sponsorshipValue: number;
      result: DealResult;
      rejectionReason?: string;
    }
  ) => void;
  onToggleBenefit: (partnerId: string, benefitId: string) => void;
  onAddBenefit: (partnerId: string, label: string) => void;
  onSubmitCpEdit: (partnerId: string, newCp: ContactPersonInfo) => void;
}

type DetailTab = 'followup' | 'meeting' | 'pitching';

export function PartnerDetailModal({
  partner,
  user,
  onClose,
  onUpdateProgress,
  onAddMeeting,
  onSavePitching,
  onToggleBenefit,
  onAddBenefit,
  onSubmitCpEdit,
}: PartnerDetailModalProps) {
  const isManager = user.role === 'admin';
  const [activeTab, setActiveTab] = useState<DetailTab>('followup');

  // Tab 1: Follow-up & Progress state
  const [nextStep, setNextStep] = useState<number>(
    Math.min(9, partner.currentStep + 1)
  );
  const [deadline, setDeadline] = useState<string>(
    !partner.followUpD3Done ? partner.deadlineD3 : partner.deadlineD7 || getTodayIso()
  );
  const [progressNote, setProgressNote] = useState('');
  const [progressError, setProgressError] = useState<string | null>(null);
  const [newBenefitText, setNewBenefitText] = useState('');

  // Tab 2: Meeting Schedule state
  const [meetingDate, setMeetingDate] = useState(getTodayIso());
  const [meetingTime, setMeetingTime] = useState('12:00');
  const [meetingMethod, setMeetingMethod] = useState<'Online' | 'Offline'>('Online');
  const [meetingAddress, setMeetingAddress] = useState('https://meet.google.com/');
  const [meetingParticipants, setMeetingParticipants] = useState('');
  const [meetingError, setMeetingError] = useState<string | null>(null);

  // Tab 3: Pitching & Grading (Manager Only)
  const [meetingSummary, setMeetingSummary] = useState(partner.meetingSummary ?? '');
  const [grade, setGrade] = useState(partner.grade || 'None');
  const [sponsorshipValue, setSponsorshipValue] = useState(
    String(partner.sponsorshipValue || 0)
  );
  const [result, setResult] = useState<DealResult>(partner.result);
  const [rejectionReason, setRejectionReason] = useState(partner.rejectionReason ?? '');
  const [pitchingError, setPitchingError] = useState<string | null>(null);

  // CP Editor state
  const [editingCp, setEditingCp] = useState(false);
  const [cpName, setCpName] = useState(partner.contactPerson.name);
  const [cpPosition, setCpPosition] = useState(partner.contactPerson.position);
  const [cpContact, setCpContact] = useState(partner.contactPerson.contact);
  const [cpAvailable, setCpAvailable] = useState(partner.contactPerson.isAvailable);
  const [cpNotes, setCpNotes] = useState(partner.contactPerson.notes ?? '');
  const [cpNotice, setCpNotice] = useState<string | null>(null);

  const handleProgressSubmit = (e: FormEvent) => {
    e.preventDefault();
    setProgressError(null);
    if (!progressNote.trim()) {
      setProgressError('Catatan progress follow-up wajib diisi.');
      return;
    }
    onUpdateProgress(partner.id, nextStep, deadline, progressNote.trim());
    setProgressNote('');
  };

  const handleMeetingSubmit = (e: FormEvent) => {
    e.preventDefault();
    setMeetingError(null);
    if (!meetingDate || !meetingTime || !meetingAddress.trim()) {
      setMeetingError('Tanggal, waktu, dan lokasi/tautan meeting wajib diisi.');
      return;
    }
    onAddMeeting(partner.id, {
      id: `mtg-${Date.now()}`,
      date: meetingDate,
      time: meetingTime,
      method: meetingMethod,
      address: meetingAddress.trim(),
      participants: meetingParticipants.trim() || `${user.name}, ${partner.contactPerson.name}`,
      createdBy: user.name,
    });
    setMeetingParticipants('');
  };

  const handlePitchingSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPitchingError(null);
    if (result === 'Decline' && !rejectionReason.trim()) {
      setPitchingError('Alasan penolakan wajib dicatat saat status diubah ke Decline.');
      return;
    }
    onSavePitching(partner.id, {
      meetingSummary: meetingSummary.trim(),
      grade: grade === 'None' ? '-' : grade,
      sponsorshipValue: Number(sponsorshipValue) || 0,
      result,
      rejectionReason: result === 'Decline' ? rejectionReason.trim() : undefined,
    });
  };

  const handleCpSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!cpName.trim() || !cpContact.trim()) return;
    onSubmitCpEdit(partner.id, {
      name: cpName.trim(),
      position: cpPosition.trim() || 'PIC Partnership',
      contact: cpContact.trim(),
      isAvailable: cpAvailable,
      lastUpdated: getTodayIso(),
      notes: cpNotes.trim() || undefined,
    });
    setEditingCp(false);
    setCpNotice(
      isManager
        ? 'Data Contact Person berhasil diperbarui langsung.'
        : 'Permintaan perubahan Contact Person dikirim ke Manager EEO untuk persetujuan.'
    );
  };

  const handleAddBenefit = () => {
    if (!newBenefitText.trim()) return;
    onAddBenefit(partner.id, newBenefitText.trim());
    setNewBenefitText('');
  };

  return (
    <motion.div
      variants={modalBackdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="partner-detail-title"
    >
      <motion.div
        variants={modalPanelVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="relative my-auto w-full max-w-[920px] max-h-[92vh] overflow-y-auto rounded-2xl bg-[#F3F8FD] shadow-2xl"
      >
        {/* Top Blue Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 bg-[#0755B1] px-6 py-5 text-white">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-2.5">
              <h2
                id="partner-detail-title"
                className="text-xl sm:text-2xl font-extrabold tracking-tight"
              >
                {partner.companyName}
              </h2>
              <span className="text-xs sm:text-sm font-semibold text-[#BCD9FC]">
                {partner.category}
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-[#E6F0FD]">
              {partner.pipelineStatus} · PIC EEO: {partner.picInternal}
              {user.canViewSponsorshipValue && partner.sponsorshipValue > 0
                ? ` · ${partner.grade} (${formatRupiah(partner.sponsorshipValue)})`
                : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail partner"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white hover:bg-white/25 cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          {/* 9-Step TIMELINE PROGRESS */}
          <div className="rounded-2xl border border-[#DBEAFE] bg-white p-4 sm:p-5">
            <p className="text-xs font-extrabold tracking-wider text-[#0755B1] uppercase">
              Timeline Progress
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
              {TIMELINE_STEPS.map((st) => {
                const isActive = st.step === partner.currentStep;
                const isDone = st.step < partner.currentStep;
                return (
                  <div
                    key={st.step}
                    className={`flex flex-col items-center justify-center rounded-xl border px-2 py-2.5 text-center transition-colors ${
                      isActive
                        ? 'border-[#0755B1] bg-[#0755B1] text-white shadow-sm'
                        : isDone
                          ? 'border-[#83B1EC] bg-[#E6F0FD] text-[#0755B1]'
                          : 'border-[#DBEAFE] bg-[#F8FBFF] text-[#64748B]'
                    }`}
                  >
                    <span className="font-mono text-sm font-extrabold tabular-nums">
                      {st.step}
                    </span>
                    <span className="mt-1 text-[10px] font-semibold leading-tight">
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tabs Container */}
          <div className="rounded-2xl border border-[#DBEAFE] bg-white overflow-hidden">
            <div
              role="tablist"
              aria-label="Detail progress partner"
              className="flex border-b border-[#DBEAFE] overflow-x-auto"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'followup'}
                onClick={() => setActiveTab('followup')}
                className={`flex-1 min-w-[160px] px-4 py-3.5 text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer border-b-2 transition-colors ${
                  activeTab === 'followup'
                    ? 'border-[#0755B1] text-[#0755B1] bg-[#F8FBFF]'
                    : 'border-transparent text-[#64748B] hover:text-[#1E1E1E]'
                }`}
              >
                1. Follow Up &amp; Progres
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'meeting'}
                onClick={() => setActiveTab('meeting')}
                className={`flex-1 min-w-[160px] px-4 py-3.5 text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer border-b-2 transition-colors ${
                  activeTab === 'meeting'
                    ? 'border-[#0755B1] text-[#0755B1] bg-[#F8FBFF]'
                    : 'border-transparent text-[#64748B] hover:text-[#1E1E1E]'
                }`}
              >
                2. Meeting Schedule ({partner.meetings.length})
              </button>
              {isManager && (
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'pitching'}
                  onClick={() => setActiveTab('pitching')}
                  className={`flex-1 min-w-[160px] px-4 py-3.5 text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer border-b-2 transition-colors ${
                    activeTab === 'pitching'
                      ? 'border-[#0755B1] text-[#0755B1] bg-[#F8FBFF]'
                      : 'border-transparent text-[#64748B] hover:text-[#1E1E1E]'
                  }`}
                >
                  3. Pitching &amp; Grading
                </button>
              )}
            </div>

            <div className="p-5">
              {/* TAB 1: FOLLOW UP & PROGRES */}
              {activeTab === 'followup' && (
                <motion.div
                  key="tab-followup"
                  initial={{opacity: 0, y: 6}}
                  animate={{opacity: 1, y: 0}}
                  transition={{duration: 0.18, ease: EASE_OUT_EXPO}}
                  className="space-y-5"
                >
                  <form
                    onSubmit={handleProgressSubmit}
                    className="rounded-2xl border border-[#BCD9FC] bg-[#E6F0FD]/55 p-4 sm:p-5 space-y-4"
                  >
                    <h3 className="text-base font-extrabold text-[#0755B1]">
                      Update Progress
                    </h3>

                    <div className="flex items-center gap-2.5 rounded-xl border border-[#BCD9FC] bg-white px-3.5 py-2.5">
                      <CheckCircle2 className="h-4 w-4 text-[#0755B1] shrink-0" aria-hidden="true" />
                      <span className="text-xs sm:text-sm font-bold text-[#0755B1]">
                        Current Progress : {partner.pipelineStatus}
                      </span>
                    </div>

                    <AnimatePresence>
                      {progressError && (
                        <motion.div
                          key="progress-error"
                          variants={alertVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          role="alert"
                          className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                        >
                          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                          <span>{progressError}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="detail-next-step" className="block text-xs font-bold text-[#334155]">
                          Next Step
                        </label>
                        <select
                          id="detail-next-step"
                          value={nextStep}
                          onChange={(e) => setNextStep(Number(e.target.value))}
                          className="mt-1.5 block h-10 w-full rounded-xl border border-[#BCD9FC] bg-white px-3 text-sm font-semibold text-[#1E1E1E] focus:border-[#0755B1] focus:outline-none"
                        >
                          {TIMELINE_STEPS.map((st) => (
                            <option key={st.step} value={st.step}>
                              Tahap {st.step}: {st.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="detail-deadline" className="block text-xs font-bold text-[#334155]">
                          Deadline
                        </label>
                        <input
                          id="detail-deadline"
                          type="date"
                          value={deadline}
                          onChange={(e) => setDeadline(e.target.value)}
                          className="mt-1.5 block h-10 w-full rounded-xl border border-[#BCD9FC] bg-white px-3 font-mono text-sm text-[#1E1E1E] focus:border-[#0755B1] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="detail-progress-note" className="block text-xs font-bold text-[#334155]">
                        Catatan Progress Follow Up *
                      </label>
                      <textarea
                        id="detail-progress-note"
                        rows={3}
                        value={progressNote}
                        onChange={(e) => setProgressNote(e.target.value)}
                        placeholder="Catatan hasil follow up terakhir..."
                        className="mt-1.5 block w-full rounded-xl border border-[#BCD9FC] bg-white p-3 text-sm text-[#1E1E1E] focus:border-[#0755B1] focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex min-h-[40px] items-center justify-center rounded-xl bg-[#0755B1] px-5 py-2 text-xs sm:text-sm font-bold text-white hover:bg-[#105EA9] cursor-pointer"
                      >
                        Simpan Progress
                      </button>
                    </div>
                  </form>

                  {/* Benefit Checklist */}
                  <div className="rounded-xl border border-[#DBEAFE] bg-white p-4">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-extrabold tracking-wider text-[#334155] uppercase">
                        Checklist Pemenuhan Benefit
                      </h4>
                      <span className="font-mono text-xs font-bold tabular-nums text-[#0755B1]">
                        {partner.benefits.filter((b) => b.completed).length}/{partner.benefits.length} Terpenuhi
                      </span>
                    </div>
                    <ul className="mt-3 space-y-2">
                      {partner.benefits.map((b) => (
                        <li key={b.id} className="flex items-center gap-2.5">
                          <input
                            id={`benefit-${b.id}`}
                            type="checkbox"
                            checked={b.completed}
                            onChange={() => onToggleBenefit(partner.id, b.id)}
                            className="h-4 w-4 rounded border-slate-300 text-[#0755B1] cursor-pointer"
                          />
                          <label
                            htmlFor={`benefit-${b.id}`}
                            className={`text-sm cursor-pointer ${
                              b.completed ? 'line-through text-[#64748B]' : 'text-[#1E1E1E] font-medium'
                            }`}
                          >
                            {b.label}
                          </label>
                        </li>
                      ))}
                    </ul>
                    {isManager && (
                      <div className="mt-3 flex gap-2">
                        <input
                          type="text"
                          value={newBenefitText}
                          onChange={(e) => setNewBenefitText(e.target.value)}
                          placeholder="Tambah item benefit baru..."
                          aria-label="Tambah item benefit baru"
                          className="h-9 flex-1 rounded-lg border border-slate-200 px-3 text-xs text-[#1E1E1E] focus:border-[#0755B1] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddBenefit}
                          className="inline-flex h-9 items-center gap-1 rounded-lg bg-[#E6F0FD] px-3 text-xs font-bold text-[#0755B1] hover:bg-[#BCD9FC] cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Tambah</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Partner History */}
                  <div>
                    <h4 className="text-xs font-extrabold tracking-wider text-[#475569] uppercase">
                      Riwayat Aktivitas
                    </h4>
                    {partner.history.length === 0 ? (
                      <p className="mt-2 text-xs text-[#64748B]">Belum ada riwayat aktivitas tercatat.</p>
                    ) : (
                      <div className="mt-2.5 space-y-2">
                        {partner.history.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-xl border border-[#BCD9FC] bg-[#E6F0FD]/50 px-4 py-3"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-sm font-bold text-[#0755B1]">{item.title}</p>
                              <span className="font-mono text-[11px] text-[#64748B]">
                                {item.timestamp}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-[#334155]">{item.description}</p>
                            <p className="mt-1 text-[11px] font-semibold text-[#64748B]">
                              Oleh: {item.actor}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 2: MEETING SCHEDULE */}
              {activeTab === 'meeting' && (
                <motion.div
                  key="tab-meeting"
                  initial={{opacity: 0, y: 6}}
                  animate={{opacity: 1, y: 0}}
                  transition={{duration: 0.18, ease: EASE_OUT_EXPO}}
                  className="space-y-5"
                >
                    <form
                      onSubmit={handleMeetingSubmit}
                      className="rounded-2xl border border-[#BCD9FC] bg-[#E6F0FD]/55 p-4 sm:p-5 space-y-4"
                    >
                      <h3 className="text-base font-extrabold text-[#0755B1]">
                        New Schedule
                      </h3>

                      <AnimatePresence>
                        {meetingError && (
                          <motion.div
                            key="meeting-error"
                            variants={alertVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            role="alert"
                            className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                          >
                            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                            <span>{meetingError}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="mtg-date" className="block text-xs font-bold text-[#334155]">
                          Date *
                        </label>
                        <input
                          id="mtg-date"
                          type="date"
                          value={meetingDate}
                          onChange={(e) => setMeetingDate(e.target.value)}
                          className="mt-1.5 block h-10 w-full rounded-xl border border-[#BCD9FC] bg-white px-3 font-mono text-sm text-[#1E1E1E] focus:border-[#0755B1] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="mtg-time" className="block text-xs font-bold text-[#334155]">
                          Time *
                        </label>
                        <input
                          id="mtg-time"
                          type="time"
                          value={meetingTime}
                          onChange={(e) => setMeetingTime(e.target.value)}
                          className="mt-1.5 block h-10 w-full rounded-xl border border-[#BCD9FC] bg-white px-3 font-mono text-sm text-[#1E1E1E] focus:border-[#0755B1] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <span className="block text-xs font-bold text-[#334155]">
                          Method *
                        </span>
                        <div className="mt-1.5 grid grid-cols-2 overflow-hidden rounded-xl border border-[#BCD9FC] bg-white">
                          <label className="flex h-10 items-center justify-center gap-2 text-xs font-bold text-[#1E1E1E] cursor-pointer">
                            <input
                              type="radio"
                              name="meeting-method"
                              checked={meetingMethod === 'Online'}
                              onChange={() => setMeetingMethod('Online')}
                            />
                            <span>Online</span>
                          </label>
                          <label className="flex h-10 items-center justify-center gap-2 border-l border-[#BCD9FC] text-xs font-bold text-[#1E1E1E] cursor-pointer">
                            <input
                              type="radio"
                              name="meeting-method"
                              checked={meetingMethod === 'Offline'}
                              onChange={() => setMeetingMethod('Offline')}
                            />
                            <span>Offline</span>
                          </label>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="mtg-address" className="block text-xs font-bold text-[#334155]">
                          Address / Link *
                        </label>
                        <input
                          id="mtg-address"
                          type="text"
                          value={meetingAddress}
                          onChange={(e) => setMeetingAddress(e.target.value)}
                          placeholder={
                            meetingMethod === 'Online'
                              ? 'https://meet.google.com/...'
                              : 'Lokasi meeting offline...'
                          }
                          className="mt-1.5 block h-10 w-full rounded-xl border border-[#BCD9FC] bg-white px-3 text-sm text-[#1E1E1E] focus:border-[#0755B1] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="mtg-participants" className="block text-xs font-bold text-[#334155]">
                        Participants &amp; Agenda
                      </label>
                      <textarea
                        id="mtg-participants"
                        rows={2}
                        value={meetingParticipants}
                        onChange={(e) => setMeetingParticipants(e.target.value)}
                        placeholder="Daftar peserta meeting & agenda pembahasan..."
                        className="mt-1.5 block w-full rounded-xl border border-[#BCD9FC] bg-white p-3 text-sm text-[#1E1E1E] focus:border-[#0755B1] focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex min-h-[40px] items-center justify-center rounded-xl bg-[#0755B1] px-5 py-2 text-xs sm:text-sm font-bold text-white hover:bg-[#105EA9] cursor-pointer"
                      >
                        Simpan Jadwal Meeting
                      </button>
                    </div>
                  </form>

                  <div>
                    <h4 className="text-xs font-extrabold tracking-wider text-[#475569] uppercase">
                      Meeting List
                    </h4>
                    {partner.meetings.length === 0 ? (
                      <div className="mt-2.5 rounded-xl border border-[#DBEAFE] bg-[#F3F8FD] px-4 py-3 text-xs font-medium text-[#64748B]">
                        No meeting has been conducted or planned yet.
                      </div>
                    ) : (
                      <div className="mt-2.5 space-y-2.5">
                        {partner.meetings.map((m) => (
                          <div
                            key={m.id}
                            className="rounded-xl border border-[#DBEAFE] bg-white p-3.5"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0755B1]">
                                <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                                <span className="font-mono tabular-nums">{m.date} · {m.time} WIB</span>
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-md bg-[#E6F0FD] px-2 py-0.5 text-[11px] font-bold text-[#0755B1]">
                                {m.method === 'Online' ? (
                                  <Video className="h-3 w-3" aria-hidden="true" />
                                ) : (
                                  <MapPin className="h-3 w-3" aria-hidden="true" />
                                )}
                                <span>{m.method}</span>
                              </span>
                            </div>
                            <p className="mt-1.5 text-xs font-medium text-[#1E1E1E] break-all">
                              {m.address}
                            </p>
                            <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-[#64748B]">
                              <Users className="h-3 w-3" aria-hidden="true" />
                              <span>{m.participants}</span>
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 3: PITCHING & GRADING (MANAGER ONLY) */}
              {activeTab === 'pitching' && isManager && (
                <motion.form
                  key="tab-pitching"
                  initial={{opacity: 0, y: 6}}
                  animate={{opacity: 1, y: 0}}
                  transition={{duration: 0.18, ease: EASE_OUT_EXPO}}
                  onSubmit={handlePitchingSubmit}
                  className="rounded-2xl border border-[#BCD9FC] bg-[#E6F0FD]/55 p-4 sm:p-5 space-y-4"
                >
                    <h3 className="text-base font-extrabold text-[#0755B1]">
                      Summary &amp; Grading
                    </h3>

                    <AnimatePresence>
                      {pitchingError && (
                        <motion.div
                          key="pitching-error"
                          variants={alertVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          role="alert"
                          className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                        >
                          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                          <span>{pitchingError}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  <div>
                    <label htmlFor="pitch-summary" className="block text-xs font-bold text-[#334155]">
                      Meeting Summary
                    </label>
                    <textarea
                      id="pitch-summary"
                      rows={3}
                      value={meetingSummary}
                      onChange={(e) => setMeetingSummary(e.target.value)}
                      placeholder="Catatan hasil pitching & kesepakatan akhir..."
                      className="mt-1.5 block w-full rounded-xl border border-[#BCD9FC] bg-white p-3 text-sm text-[#1E1E1E] focus:border-[#0755B1] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="pitch-grade" className="block text-xs font-bold text-[#334155]">
                        Grade
                      </label>
                      <select
                        id="pitch-grade"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="mt-1.5 block h-10 w-full rounded-xl border border-[#BCD9FC] bg-white px-3 text-sm font-semibold text-[#1E1E1E] focus:border-[#0755B1] focus:outline-none"
                      >
                        <option value="None">None</option>
                        <option value="Platinum">Platinum</option>
                        <option value="Gold">Gold</option>
                        <option value="Silver">Silver</option>
                        <option value="Bronze">Bronze</option>
                        <option value="Partner">Media Partner / Komunitas</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="pitch-nominal" className="block text-xs font-bold text-[#334155]">
                        Nominal Sponsorship (Rp)
                      </label>
                      <input
                        id="pitch-nominal"
                        type="number"
                        min={0}
                        step={500000}
                        value={sponsorshipValue}
                        onChange={(e) => setSponsorshipValue(e.target.value)}
                        className="mt-1.5 block h-10 w-full rounded-xl border border-[#BCD9FC] bg-white px-3 font-mono text-sm text-[#1E1E1E] focus:border-[#0755B1] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="block text-xs font-bold text-[#334155]">Result</span>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {(['Pending', 'Accept', 'Decline'] as const).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setResult(opt)}
                          className={`min-h-[38px] rounded-xl px-4 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                            result === opt
                              ? opt === 'Accept'
                                ? 'bg-[#16A34A] text-white'
                                : opt === 'Decline'
                                  ? 'bg-[#DC2626] text-white'
                                  : 'bg-[#0755B1] text-white'
                              : 'border border-[#BCD9FC] bg-white text-[#334155] hover:bg-[#F3F8FD]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                    <AnimatePresence>
                      {result === 'Decline' && (
                        <motion.div
                          key="decline-reason-box"
                          variants={alertVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          <label htmlFor="pitch-decline-reason" className="block text-xs font-bold text-[#DC2626]">
                            Alasan Penolakan (Wajib Diisi) *
                          </label>
                          <input
                            id="pitch-decline-reason"
                            type="text"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Contoh: Anggaran Q4 sudah penuh / fokus ke event lain..."
                            className="mt-1.5 block h-10 w-full rounded-xl border border-red-300 bg-white px-3 text-sm text-[#1E1E1E] focus:border-red-500 focus:outline-none"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="inline-flex min-h-[40px] items-center justify-center rounded-xl bg-[#0755B1] px-5 py-2 text-xs sm:text-sm font-bold text-white hover:bg-[#105EA9] cursor-pointer"
                      >
                        Simpan Keputusan Pitching
                      </button>
                    </div>
                  </motion.form>
                )}
            </div>
          </div>

          {/* Contact Person (CP) Card */}
          <div className="rounded-2xl border border-[#DBEAFE] bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base sm:text-lg font-extrabold text-[#0755B1]">
                Contact Person (CP)
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingCp((prev) => !prev);
                  setCpNotice(null);
                }}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl bg-[#0755B1] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#105EA9] cursor-pointer whitespace-nowrap"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{editingCp ? 'Batal Edit CP' : 'Tambah / Edit CP'}</span>
              </button>
            </div>

            <AnimatePresence>
              {cpNotice && (
                <motion.div
                  key="cp-notice"
                  variants={alertVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  role="status"
                  className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-800"
                >
                  {cpNotice}
                </motion.div>
              )}
            </AnimatePresence>

            {editingCp ? (
              <motion.form
                key="cp-edit-form"
                initial={{opacity: 0, y: 6}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.18, ease: EASE_OUT_EXPO}}
                onSubmit={handleCpSubmit}
                className="mt-4 rounded-xl border border-[#BCD9FC] bg-[#F3F8FD] p-4 space-y-3"
              >
                <p className="text-xs font-bold text-[#0755B1]">
                  {isManager
                    ? 'Perubahan CP oleh Manager langsung diterapkan ke database partner.'
                    : 'Mode Staff: Perubahan CP akan dikirim ke menu Persetujuan Edit Manager terlebih dahulu.'}
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="edit-cp-name" className="block text-xs font-bold text-[#334155]">
                      Nama CP *
                    </label>
                    <input
                      id="edit-cp-name"
                      type="text"
                      required
                      value={cpName}
                      onChange={(e) => setCpName(e.target.value)}
                      className="mt-1 block h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-cp-pos" className="block text-xs font-bold text-[#334155]">
                      Jabatan CP
                    </label>
                    <input
                      id="edit-cp-pos"
                      type="text"
                      value={cpPosition}
                      onChange={(e) => setCpPosition(e.target.value)}
                      className="mt-1 block h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="edit-cp-contact" className="block text-xs font-bold text-[#334155]">
                      Kontak (WA / Email) *
                    </label>
                    <input
                      id="edit-cp-contact"
                      type="text"
                      required
                      value={cpContact}
                      onChange={(e) => setCpContact(e.target.value)}
                      className="mt-1 block h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-cp-avail" className="block text-xs font-bold text-[#334155]">
                      Ketersediaan CP
                    </label>
                    <select
                      id="edit-cp-avail"
                      value={cpAvailable ? 'available' : 'unavailable'}
                      onChange={(e) => setCpAvailable(e.target.value === 'available')}
                      className="mt-1 block h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                    >
                      <option value="available">Available (Aktif)</option>
                      <option value="unavailable">Sudah Tidak Aktif / Cuti</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="edit-cp-notes" className="block text-xs font-bold text-[#334155]">
                    Catatan Pembaruan
                  </label>
                  <input
                    id="edit-cp-notes"
                    type="text"
                    value={cpNotes}
                    onChange={(e) => setCpNotes(e.target.value)}
                    placeholder="Alasan pergantian CP atau catatan jam aktif..."
                    className="mt-1 block h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex min-h-[38px] items-center rounded-xl bg-[#0755B1] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#105EA9] cursor-pointer"
                  >
                    {isManager ? 'Simpan Pembaruan CP' : 'Ajukan Pembaruan CP ke Manager'}
                  </button>
                </div>
                </motion.form>
              ) : (
                <motion.div
                  key="cp-read-card"
                  initial={{opacity: 0, y: 6}}
                  animate={{opacity: 1, y: 0}}
                  transition={{duration: 0.18, ease: EASE_OUT_EXPO}}
                  className="mt-4 rounded-xl border border-[#BCD9FC] bg-[#F3F8FD] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-base font-bold text-[#0755B1]">
                        {partner.contactPerson.name}
                      </p>
                      <p className="text-xs font-medium text-[#64748B]">
                        {partner.contactPerson.position}
                      </p>
                    </div>
                    <span
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                        partner.contactPerson.isAvailable
                          ? 'bg-emerald-50 text-[#15803D] border border-emerald-200'
                          : 'bg-red-50 text-[#DC2626] border border-red-200'
                      }`}
                    >
                      {partner.contactPerson.isAvailable ? 'Available' : 'Sudah Tidak Aktif'}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#DBEAFE] bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-[#1E1E1E]">
                    <Phone className="h-4 w-4 text-[#0755B1] shrink-0" aria-hidden="true" />
                    <span>{partner.contactPerson.contact}</span>
                  </div>

                  {partner.contactPerson.notes && (
                    <p className="mt-2 text-xs text-[#475569]">
                      Catatan: {partner.contactPerson.notes}
                    </p>
                  )}
                </motion.div>
              )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
