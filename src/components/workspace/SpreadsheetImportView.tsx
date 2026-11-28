import {useState, type ChangeEvent} from 'react';
import {CheckCircle2, Upload} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';
import type {BnccEvent, PartnerRecord, UserAccount} from '../../types/database';
import {alertVariants} from '../../utils/motion';
import {
  formatShortDate,
  getNowWibLabel,
  getTodayIso,
  parseSpreadsheetRows,
  type ParsedSpreadsheetRow,
} from '../../utils/pipeline';

interface SpreadsheetImportViewProps {
  user: UserAccount;
  activeEvent: BnccEvent;
  onImportPartners: (newPartners: PartnerRecord[]) => void;
  onGoToSponsorshipList: () => void;
}

const SAMPLE_CSV = `Nama Company,Contact Person,Jabatan CP,Kontak CP,Tanggal Kirim,PIC Internal,Kategori
PT Bukalapak.com,Rendy Wijaya,Campus Partnership Lead,0812-9000-1122 / rendy@bukalapak.com,2026-11-26,Nadia Putri,Sponsor
Tech in Asia Indonesia,Sinta Dewi,Community & Media Lead,0813-7788-9900 / sinta@techinasia.com,2026-11-26,Alya Rahma,Media Partner
Google Developer Group Jakarta,Bima Sakti,Chapter Lead,0857-4433-2211 / bima@gdgjakarta.org,2026-11-26,Rizky Pratama,Komunitas`;

export function SpreadsheetImportView({
  user,
  activeEvent,
  onImportPartners,
  onGoToSponsorshipList,
}: SpreadsheetImportViewProps) {
  const [rawText, setRawText] = useState(SAMPLE_CSV);
  const [parsedRows, setParsedRows] = useState<ParsedSpreadsheetRow[]>(() =>
    parseSpreadsheetRows(SAMPLE_CSV)
  );
  const [importedCount, setImportedCount] = useState<number | null>(null);

  const validRows = parsedRows.filter((r) => r.valid);

  const handleProcess = () => {
    setImportedCount(null);
    setParsedRows(parseSpreadsheetRows(rawText));
  };

  const handleReset = () => {
    setRawText('');
    setParsedRows([]);
    setImportedCount(null);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === 'string' ? reader.result : '';
      setRawText(content);
      setParsedRows(parseSpreadsheetRows(content));
      setImportedCount(null);
    };
    reader.readAsText(file);
  };

  const handleImportValid = () => {
    if (validRows.length === 0) return;
    const nowLabel = getNowWibLabel();
    const newPartners: PartnerRecord[] = validRows.map((row, idx) => ({
      id: `prt-imp-${Date.now()}-${idx}`,
      companyName: row.companyName,
      category: row.category,
      eventId: activeEvent.id,
      picInternal: row.picInternal,
      contactPerson: {
        name: row.cpName,
        position: row.cpPosition,
        contact: row.cpContact,
        isAvailable: true,
        lastUpdated: getTodayIso(),
      },
      currentStep: 1,
      pipelineStatus: 'Follow-Up D+3',
      proposalSentAt: row.proposalSentAt,
      deadlineD3: row.deadlineD3,
      deadlineD7: row.deadlineD7,
      followUpD3Done: false,
      followUpD7Done: false,
      grade: '-',
      sponsorshipValue: 0,
      result: 'Pending',
      meetings: [],
      benefits: [
        {id: `ben-imp-${Date.now()}-${idx}-1`, label: 'Logo di Materi Publikasi', completed: false},
      ],
      mouStatus: 'Belum Dibuat',
      notes: 'Diimpor dari Google Sheets / CSV.',
      history: [
        {
          id: `hist-imp-${Date.now()}-${idx}`,
          title: 'Proposal Diimpor dari Spreadsheet',
          description: `Auto D+3 (${row.deadlineD3}) & D+7 (${row.deadlineD7}) dibuat otomatis.`,
          timestamp: nowLabel,
          actor: `${user.name} (${user.title})`,
        },
      ],
    }));

    onImportPartners(newPartners);
    setImportedCount(newPartners.length);
  };

  return (
    <div className="space-y-5">
      {/* Header Card */}
      <div className="rounded-2xl border border-[#DBEAFE] bg-white p-5 sm:p-6">
        <h1 className="text-lg sm:text-xl font-extrabold text-[#0755B1]">
          Impor Spreadsheet — {activeEvent.name}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#64748B]">
          Impor daftar target company &amp; proposal dari file CSV atau salin langsung dari Google Sheets / Excel. Reminder D+3 &amp; D+7 otomatis dibuat.
        </p>
      </div>

      {/* Input Card */}
      <div className="rounded-2xl border border-[#DBEAFE] bg-white p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-xl bg-[#E6F0FD] px-3.5 py-2 text-xs font-extrabold text-[#0755B1]">
              Paste dari Google Sheets / Excel
            </span>
            <label className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-[#BCD9FC] bg-white px-3 py-1.5 text-xs font-bold text-[#0755B1] hover:bg-[#F3F8FD] cursor-pointer">
              <Upload className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Upload File .CSV</span>
              <input
                type="file"
                accept=".csv,.tsv,.txt"
                onChange={handleFileUpload}
                className="sr-only"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={() => {
              setRawText(SAMPLE_CSV);
              setParsedRows(parseSpreadsheetRows(SAMPLE_CSV));
              setImportedCount(null);
            }}
            className="text-xs font-bold text-[#0755B1] hover:underline cursor-pointer"
          >
            Muat Contoh Data
          </button>
        </div>

        <div>
          <label htmlFor="spreadsheet-paste-input" className="block text-xs sm:text-sm font-bold text-[#1E1E1E]">
            Tempel (Ctrl+V) baris data dari Google Sheets atau CSV di bawah ini:
          </label>
          <textarea
            id="spreadsheet-paste-input"
            rows={5}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Nama Company,Contact Person,Jabatan CP,Kontak CP,Tanggal Kirim,PIC Internal,Kategori"
            className="mt-2 block w-full rounded-xl border border-slate-200 p-3.5 font-mono text-xs leading-relaxed text-[#334155] focus:border-[#0755B1] focus:outline-none focus:ring-2 focus:ring-[#83B1EC]/40"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleProcess}
            className="inline-flex min-h-[40px] items-center justify-center rounded-xl bg-[#0755B1] px-5 py-2 text-xs sm:text-sm font-bold text-white hover:bg-[#105EA9] cursor-pointer"
          >
            Proses &amp; Validasi Baris
          </button>
        </div>
      </div>

      <AnimatePresence>
        {importedCount !== null && (
          <motion.div
            key="import-success-banner"
            variants={alertVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="status"
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4"
          >
            <div className="flex items-center gap-2.5 text-sm font-bold text-emerald-900">
              <CheckCircle2 className="h-5 w-5 text-[#16A34A] shrink-0" aria-hidden="true" />
              <span>
                Berhasil mengimpor {importedCount} proposal baru ke {activeEvent.name} beserta jadwal reminder D+3 &amp; D+7.
              </span>
            </div>
            <button
              type="button"
              onClick={onGoToSponsorshipList}
              className="rounded-xl bg-[#16A34A] px-4 py-2 text-xs font-bold text-white hover:bg-[#15803D] cursor-pointer"
            >
              Lihat Daftar Sponsorship
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Table Card */}
      <div className="rounded-2xl border border-[#DBEAFE] bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-[#1E1E1E]">
              Preview Hasil Validasi ({validRows.length} dari {parsedRows.length} Baris Valid)
            </h2>
            <p className="mt-0.5 text-xs text-[#64748B]">
              Periksa jadwal otomatis D+3 &amp; D+7 sebelum menyimpan ke database
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex min-h-[38px] items-center rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-[#475569] hover:bg-slate-50 cursor-pointer"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleImportValid}
              disabled={validRows.length === 0}
              className="inline-flex min-h-[38px] items-center rounded-xl bg-[#16A34A] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#15803D] disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              Impor {validRows.length} Proposal ke Event Aktif
            </button>
          </div>
        </div>

        {parsedRows.length === 0 ? (
          <p className="mt-5 text-center text-xs font-medium text-[#64748B]">
            Belum ada baris data yang diproses.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-extrabold tracking-wider text-[#64748B] uppercase">
                  <th className="py-2.5 pr-3">Status</th>
                  <th className="py-2.5 pr-3">Nama Company</th>
                  <th className="py-2.5 pr-3">Contact Person</th>
                  <th className="py-2.5 pr-3">Kategori</th>
                  <th className="py-2.5 pr-3">PIC Internal</th>
                  <th className="py-2.5">Auto D+3 / D+7</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {parsedRows.map((row) => (
                  <tr key={row.rowNumber}>
                    <td className="py-3 pr-3">
                      {row.valid ? (
                        <span className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 font-bold text-[#15803D]">
                          Valid
                        </span>
                      ) : (
                        <span className="inline-block rounded-md bg-red-50 px-2 py-0.5 font-bold text-[#DC2626]">
                          {row.error}
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-3 font-bold text-[#1E1E1E]">
                      {row.companyName || '-'}
                    </td>
                    <td className="py-3 pr-3">
                      <p className="font-bold text-[#1E1E1E]">{row.cpName || '-'}</p>
                      <p className="text-[11px] text-[#64748B]">{row.cpContact}</p>
                    </td>
                    <td className="py-3 pr-3 font-bold text-[#0755B1]">{row.category}</td>
                    <td className="py-3 pr-3 text-[#334155]">{row.picInternal || '-'}</td>
                    <td className="py-3 font-mono text-[11px] tabular-nums text-[#334155]">
                      D+3: {formatShortDate(row.deadlineD3)} · D+7: {formatShortDate(row.deadlineD7)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
