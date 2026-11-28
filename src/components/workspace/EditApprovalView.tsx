import {useState, type FormEvent} from 'react';
import {AlertCircle, X} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';
import type {BnccEvent, CpEditRequest} from '../../types/database';
import {
  alertVariants,
  EASE_OUT_EXPO,
  modalBackdropVariants,
  modalPanelVariants,
} from '../../utils/motion';

interface EditApprovalViewProps {
  activeEvent: BnccEvent;
  requests: CpEditRequest[];
  onApproveRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string, reason: string) => void;
}

export function EditApprovalView({
  activeEvent,
  requests,
  onApproveRequest,
  onRejectRequest,
}: EditApprovalViewProps) {
  const [rejectingRequest, setRejectingRequest] = useState<CpEditRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);

  const pendingRequests = requests.filter((r) => r.status === 'Pending');
  const historyRequests = requests.filter((r) => r.status !== 'Pending');

  const handleRejectSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!rejectingRequest) return;
    if (!rejectionReason.trim()) {
      setRejectError('Alasan penolakan wajib diisi agar Staff EEO mengetahui perbaikannya.');
      return;
    }
    onRejectRequest(rejectingRequest.id, rejectionReason.trim());
    setRejectingRequest(null);
    setRejectionReason('');
    setRejectError(null);
  };

  return (
    <div className="space-y-5">
      {/* Header Card */}
      <div className="rounded-2xl border border-[#DBEAFE] bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg sm:text-xl font-extrabold text-[#0755B1]">
            Persetujuan Edit Data Staff
          </h1>
          <span className="rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-0.5 font-mono text-xs font-bold tabular-nums text-[#B45309]">
            {pendingRequests.length} Menunggu
          </span>
        </div>
        <p className="mt-1 text-xs sm:text-sm text-[#64748B]">
          Bandingkan perubahan data Contact Person yang diajukan Staff untuk {activeEvent.name} sebelum diterapkan ke database utama
        </p>
      </div>

      {/* Pending Requests List */}
      {pendingRequests.length === 0 ? (
        <div className="rounded-2xl border border-[#DBEAFE] bg-white px-5 py-8 text-center text-sm font-medium text-[#64748B]">
          Tidak ada permintaan edit yang menunggu persetujuan pada event ini.
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {pendingRequests.map((req, index) => (
              <motion.article
                key={req.id}
                initial={{opacity: 0, y: 12}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, x: 20}}
                transition={{
                  duration: 0.24,
                  delay: Math.min(index * 0.05, 0.25),
                  ease: EASE_OUT_EXPO,
                }}
                data-testid={`pending-edit-card-${req.id}`}
                className="rounded-2xl border border-amber-200 bg-white p-5 sm:p-6 shadow-sm"
              >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-[#B45309]">
                      Pending
                    </span>
                    <span className="font-mono text-xs text-[#64748B]">
                      {req.requestedAt}
                    </span>
                  </div>
                  <h2 className="mt-1.5 text-base font-extrabold text-[#1E1E1E]">
                    {req.companyName} —{' '}
                    <span className="text-[#0755B1]">{req.requestTitle}</span>
                  </h2>
                  <p className="mt-0.5 text-xs text-[#64748B]">
                    Diajukan oleh: <strong className="text-[#1E1E1E]">{req.requestedBy}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setRejectingRequest(req);
                      setRejectionReason('');
                      setRejectError(null);
                    }}
                    className="inline-flex min-h-[38px] items-center justify-center rounded-xl border border-red-300 bg-white px-4 py-1.5 text-xs font-bold text-[#DC2626] hover:bg-red-50 cursor-pointer"
                  >
                    Tolak
                  </button>
                  <button
                    type="button"
                    onClick={() => onApproveRequest(req.id)}
                    className="inline-flex min-h-[38px] items-center justify-center rounded-xl bg-[#16A34A] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#15803D] cursor-pointer whitespace-nowrap"
                  >
                    Setujui &amp; Terapkan
                  </button>
                </div>
              </div>

              {/* Old vs New Side-by-Side Comparison */}
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-red-200 bg-red-50/45 p-4">
                  <p className="text-[11px] font-extrabold tracking-wider text-[#DC2626] uppercase">
                    Nilai Lama (Saat Ini)
                  </p>
                  <dl className="mt-2.5 space-y-1 text-xs text-[#334155]">
                    <div><dt className="inline font-bold">Nama CP:</dt> <dd className="inline">{req.oldCp.name}</dd></div>
                    <div><dt className="inline font-bold">Jabatan:</dt> <dd className="inline">{req.oldCp.position}</dd></div>
                    <div><dt className="inline font-bold">Kontak:</dt> <dd className="inline">{req.oldCp.contact}</dd></div>
                    <div>
                      <dt className="inline font-bold">Status:</dt>{' '}
                      <dd className="inline font-semibold">
                        {req.oldCp.isAvailable ? 'Available' : 'Sudah Tidak Aktif'}
                      </dd>
                    </div>
                    {req.oldCp.notes && (
                      <div><dt className="inline font-bold">Catatan:</dt> <dd className="inline">{req.oldCp.notes}</dd></div>
                    )}
                  </dl>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/45 p-4">
                  <p className="text-[11px] font-extrabold tracking-wider text-[#15803D] uppercase">
                    Nilai Baru (Diajukan Staff)
                  </p>
                  <dl className="mt-2.5 space-y-1 text-xs text-[#334155]">
                    <div><dt className="inline font-bold">Nama CP:</dt> <dd className="inline">{req.newCp.name}</dd></div>
                    <div><dt className="inline font-bold">Jabatan:</dt> <dd className="inline">{req.newCp.position}</dd></div>
                    <div><dt className="inline font-bold">Kontak:</dt> <dd className="inline">{req.newCp.contact}</dd></div>
                    <div>
                      <dt className="inline font-bold">Status:</dt>{' '}
                      <dd className="inline font-semibold text-[#15803D]">
                        {req.newCp.isAvailable ? 'Available' : 'Sudah Tidak Aktif'}
                      </dd>
                    </div>
                    {req.newCp.notes && (
                      <div><dt className="inline font-bold">Catatan:</dt> <dd className="inline">{req.newCp.notes}</dd></div>
                    )}
                  </dl>
                </div>
              </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Manager Decision History */}
      <div className="rounded-2xl border border-[#DBEAFE] bg-white p-5 sm:p-6">
        <h2 className="text-xs font-extrabold tracking-wider text-[#64748B] uppercase">
          Riwayat Keputusan Manager
        </h2>
        {historyRequests.length === 0 ? (
          <p className="mt-3 text-xs text-[#64748B]">Belum ada riwayat keputusan pada event ini.</p>
        ) : (
          <div className="mt-3 space-y-2.5">
            {historyRequests.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-[#F8FBFF] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-[#1E1E1E]">
                    {item.companyName} —{' '}
                    <span className="font-semibold text-[#334155]">{item.requestTitle}</span>{' '}
                    <span className="font-normal text-[#64748B]">({item.requestedBy})</span>
                  </p>
                  {item.status === 'Rejected' && item.rejectionReason && (
                    <p className="mt-1 text-xs font-medium text-[#DC2626]">
                      Alasan ditolak: {item.rejectionReason}
                    </p>
                  )}
                </div>

                <span
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase shrink-0 ${
                    item.status === 'Approved'
                      ? 'bg-emerald-50 text-[#15803D]'
                      : 'bg-red-50 text-[#DC2626]'
                  }`}
                >
                  {item.status === 'Approved' ? 'Disetujui' : 'Ditolak'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Reason Modal */}
      <AnimatePresence>
        {rejectingRequest && (
          <motion.div
            key="reject-reason-modal"
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reject-modal-title"
          >
            <motion.div
              variants={modalPanelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full max-w-[480px] rounded-2xl bg-white p-6 shadow-2xl"
            >
            <div className="flex items-center justify-between gap-2">
              <h2 id="reject-modal-title" className="text-lg font-extrabold text-[#DC2626]">
                Tolak Permintaan Edit
              </h2>
              <button
                type="button"
                onClick={() => setRejectingRequest(null)}
                aria-label="Tutup modal penolakan"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-1.5 text-xs sm:text-sm text-[#64748B]">
              Alasan penolakan untuk <strong className="text-[#1E1E1E]">{rejectingRequest.companyName}</strong> akan dikirim ke Staff EEO.
            </p>

            <form onSubmit={handleRejectSubmit} className="mt-4 space-y-4">
              <AnimatePresence>
                {rejectError && (
                  <motion.div
                    key="reject-error"
                    variants={alertVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    role="alert"
                    className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{rejectError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label htmlFor="reject-reason-input" className="sr-only">
                  Alasan penolakan
                </label>
                <textarea
                  id="reject-reason-input"
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Tuliskan alasan penolakan..."
                  className="block w-full rounded-xl border border-slate-200 p-3 text-sm text-[#1E1E1E] focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingRequest(null)}
                  className="min-h-[38px] rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-[#475569] hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-[38px] rounded-xl bg-[#DC2626] px-4 py-1.5 text-xs font-bold text-white hover:bg-red-700 cursor-pointer"
                >
                  Tolak Permintaan
                </button>
              </div>
            </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
