import {useState, type FormEvent} from 'react';
import {AlertCircle} from 'lucide-react';
import type {BnccEvent, PartnerCategory, PartnerRecord, UserAccount} from '../../types/database';
import {calculateFollowUpDeadlines, getTodayIso} from '../../utils/pipeline';

interface ProposalFormViewProps {
  user: UserAccount;
  activeEvent: BnccEvent;
  onCancel: () => void;
  onSaveProposal: (newPartner: PartnerRecord) => void;
}

export function ProposalFormView({
  user,
  activeEvent,
  onCancel,
  onSaveProposal,
}: ProposalFormViewProps) {
  const initialDate = getTodayIso();
  const initialDeadlines = calculateFollowUpDeadlines(initialDate);

  const [companyName, setCompanyName] = useState('');
  const [cpName, setCpName] = useState('');
  const [cpContact, setCpContact] = useState('');
  const [proposalSentAt, setProposalSentAt] = useState(initialDate);
  const [picInternal, setPicInternal] = useState(user.name);
  const [category, setCategory] = useState<PartnerCategory>('Sponsor');
  const [cpPosition, setCpPosition] = useState('');
  const [cpNotes, setCpNotes] = useState('');
  const [deadlineD3, setDeadlineD3] = useState(initialDeadlines.deadlineD3);
  const [deadlineD7, setDeadlineD7] = useState(initialDeadlines.deadlineD7);
  const [error, setError] = useState<string | null>(null);

  const handleSentDateChange = (newDate: string) => {
    setProposalSentAt(newDate);
    if (newDate) {
      const next = calculateFollowUpDeadlines(newDate);
      setDeadlineD3(next.deadlineD3);
      setDeadlineD7(next.deadlineD7);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!companyName.trim()) {
      setError('Nama Company wajib diisi.');
      return;
    }
    if (!cpName.trim() || !cpContact.trim()) {
      setError('Nama dan kontak Contact Person (CP) wajib diisi.');
      return;
    }
    if (!proposalSentAt) {
      setError('Tanggal Kirim Proposal wajib diisi.');
      return;
    }
    if (!picInternal.trim()) {
      setError('PIC Internal wajib diisi.');
      return;
    }

    const nowLabel = `${getTodayIso()} WIB`;
    const newPartner: PartnerRecord = {
      id: `prt-${Date.now()}`,
      companyName: companyName.trim(),
      category,
      eventId: activeEvent.id,
      picInternal: picInternal.trim(),
      contactPerson: {
        name: cpName.trim(),
        position: cpPosition.trim() || 'PIC Partnership',
        contact: cpContact.trim(),
        isAvailable: true,
        lastUpdated: getTodayIso(),
        notes: cpNotes.trim() || undefined,
      },
      currentStep: 1,
      pipelineStatus: 'Follow-Up D+3',
      proposalSentAt,
      deadlineD3,
      deadlineD7,
      followUpD3Done: false,
      followUpD7Done: false,
      grade: '-',
      sponsorshipValue: 0,
      result: 'Pending',
      meetings: [],
      benefits: [
        {id: `ben-${Date.now()}-1`, label: 'Logo di Materi Publikasi', completed: false},
        {id: `ben-${Date.now()}-2`, label: 'Mention Media Sosial Event', completed: false},
      ],
      mouStatus: 'Belum Dibuat',
      notes: cpNotes.trim(),
      history: [
        {
          id: `hist-${Date.now()}`,
          title: 'Proposal Terkirim',
          description: `Proposal ${activeEvent.name} dikirim ke ${cpName.trim()}. Reminder otomatis D+3 (${deadlineD3}) & D+7 (${deadlineD7}).`,
          timestamp: nowLabel,
          actor: `${user.name} (${user.title})`,
        },
      ],
    };

    onSaveProposal(newPartner);
  };

  return (
    <div className="mx-auto max-w-[780px] rounded-2xl border border-[#DBEAFE] bg-white p-6 sm:p-8 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0755B1]">
          Input Proposal Baru
        </h1>
        <span className="text-xs font-semibold text-[#64748B]">
          Event: {activeEvent.name}
        </span>
      </div>
      <p className="mt-1 text-xs sm:text-sm text-[#64748B]">
        Pengisian cepat 4 data inti partner — jadwal pengingat D+3 &amp; D+7 otomatis dibuat.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label htmlFor="prop-company" className="block text-xs sm:text-sm font-bold text-[#1E1E1E]">
            Nama Company *
          </label>
          <input
            id="prop-company"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Contoh: PT GoTo Gojek Tokopedia Tbk / Dicoding Indonesia"
            className="mt-1.5 block h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-[#1E1E1E] focus:border-[#0755B1] focus:outline-none focus:ring-2 focus:ring-[#83B1EC]/40"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="prop-cp-name" className="block text-xs sm:text-sm font-bold text-[#1E1E1E]">
              Contact Person (CP) *
            </label>
            <input
              id="prop-cp-name"
              type="text"
              value={cpName}
              onChange={(e) => setCpName(e.target.value)}
              placeholder="Nama PIC (mis: Budi Santoso)"
              className="mt-1.5 block h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-[#1E1E1E] focus:border-[#0755B1] focus:outline-none focus:ring-2 focus:ring-[#83B1EC]/40"
            />
          </div>
          <div>
            <label htmlFor="prop-cp-contact" className="block text-xs sm:text-sm font-bold text-[#1E1E1E]">
              Kontak CP (WA / Email) *
            </label>
            <input
              id="prop-cp-contact"
              type="text"
              value={cpContact}
              onChange={(e) => setCpContact(e.target.value)}
              placeholder="0812-xxx / budi@company.com"
              className="mt-1.5 block h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-[#1E1E1E] focus:border-[#0755B1] focus:outline-none focus:ring-2 focus:ring-[#83B1EC]/40"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="prop-sent-date" className="block text-xs sm:text-sm font-bold text-[#1E1E1E]">
              Tanggal Kirim Proposal *
            </label>
            <input
              id="prop-sent-date"
              type="date"
              value={proposalSentAt}
              onChange={(e) => handleSentDateChange(e.target.value)}
              className="mt-1.5 block h-11 w-full rounded-xl border border-slate-200 px-3.5 font-mono text-sm text-[#1E1E1E] focus:border-[#0755B1] focus:outline-none focus:ring-2 focus:ring-[#83B1EC]/40"
            />
          </div>
          <div>
            <label htmlFor="prop-pic-internal" className="block text-xs sm:text-sm font-bold text-[#1E1E1E]">
              PIC Internal *
            </label>
            <input
              id="prop-pic-internal"
              type="text"
              value={picInternal}
              onChange={(e) => setPicInternal(e.target.value)}
              placeholder="Nama pengurus EEO"
              className="mt-1.5 block h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-[#1E1E1E] focus:border-[#0755B1] focus:outline-none focus:ring-2 focus:ring-[#83B1EC]/40"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="prop-category" className="block text-xs sm:text-sm font-bold text-[#1E1E1E]">
              Kategori Partner
            </label>
            <select
              id="prop-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as PartnerCategory)}
              className="mt-1.5 block h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-[#1E1E1E] focus:border-[#0755B1] focus:outline-none focus:ring-2 focus:ring-[#83B1EC]/40"
            >
              <option value="Sponsor">Sponsor</option>
              <option value="Media Partner">Media Partner</option>
              <option value="Komunitas">Komunitas</option>
            </select>
          </div>
          <div>
            <label htmlFor="prop-cp-position" className="block text-xs sm:text-sm font-bold text-[#1E1E1E]">
              Jabatan CP
            </label>
            <input
              id="prop-cp-position"
              type="text"
              value={cpPosition}
              onChange={(e) => setCpPosition(e.target.value)}
              placeholder="Contoh: Brand Partnership Lead"
              className="mt-1.5 block h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-[#1E1E1E] focus:border-[#0755B1] focus:outline-none focus:ring-2 focus:ring-[#83B1EC]/40"
            />
          </div>
        </div>

        <div>
          <label htmlFor="prop-cp-notes" className="block text-xs sm:text-sm font-bold text-[#1E1E1E]">
            Catatan CP
          </label>
          <input
            id="prop-cp-notes"
            type="text"
            value={cpNotes}
            onChange={(e) => setCpNotes(e.target.value)}
            placeholder="Catatan awal komunikasi atau preferensi kontak..."
            className="mt-1.5 block h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-[#1E1E1E] focus:border-[#0755B1] focus:outline-none focus:ring-2 focus:ring-[#83B1EC]/40"
          />
        </div>

        {/* SET DEADLINE FOLLOW UP */}
        <div className="rounded-2xl border border-[#BCD9FC] bg-[#F3F8FD] p-5">
          <p className="text-sm font-extrabold tracking-wide text-[#0755B1] uppercase">
            Set Deadline Follow Up
          </p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="prop-d3" className="block text-xs font-bold text-[#334155]">
                Deadline Follow Up D+3
              </label>
              <input
                id="prop-d3"
                type="date"
                value={deadlineD3}
                onChange={(e) => setDeadlineD3(e.target.value)}
                className="mt-1.5 block h-10 w-full rounded-xl border border-[#BCD9FC] bg-white px-3 font-mono text-sm text-[#1E1E1E] focus:border-[#0755B1] focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="prop-d7" className="block text-xs font-bold text-[#334155]">
                Deadline Follow Up D+7
              </label>
              <input
                id="prop-d7"
                type="date"
                value={deadlineD7}
                onChange={(e) => setDeadlineD7(e.target.value)}
                className="mt-1.5 block h-10 w-full rounded-xl border border-[#BCD9FC] bg-white px-3 font-mono text-sm text-[#1E1E1E] focus:border-[#0755B1] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-bold text-[#475569] hover:bg-slate-50 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#0755B1] px-6 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#105EA9] cursor-pointer"
          >
            Simpan &amp; Buat Reminder Otomatis
          </button>
        </div>
      </form>
    </div>
  );
}
