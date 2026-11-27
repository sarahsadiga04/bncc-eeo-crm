import {useState, type FormEvent} from 'react';
import {AlertCircle, X} from 'lucide-react';
import type {BnccEvent} from '../../types/database';

interface NewEventModalProps {
  onClose: () => void;
  onCreateEvent: (event: BnccEvent) => void;
}

export function NewEventModal({onClose, onCreateEvent}: NewEventModalProps) {
  const [name, setName] = useState('');
  const [period, setPeriod] = useState('');
  const [targetSponsors, setTargetSponsors] = useState('10');
  const [status, setStatus] = useState<'Aktif' | 'Perencanaan'>('Aktif');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !period.trim()) {
      setError('Nama event dan periode pelaksanaan wajib diisi.');
      return;
    }

    onCreateEvent({
      id: `evt-${Date.now()}`,
      name: name.trim(),
      period: period.trim(),
      targetSponsors: Math.max(1, Number(targetSponsors) || 5),
      status,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-event-title"
    >
      <div className="w-full max-w-[460px] rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-2">
          <h2 id="new-event-title" className="text-lg font-extrabold text-[#0755B1]">
            Tambah Event BNCC Baru
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal tambah event"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div role="alert" className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="evt-name" className="block text-xs font-bold text-[#334155]">
              Nama Event *
            </label>
            <input
              id="evt-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: BNCC Career Day 2027"
              className="mt-1.5 block h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="evt-period" className="block text-xs font-bold text-[#334155]">
                Periode *
              </label>
              <input
                id="evt-period"
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="Maret 2027"
                className="mt-1.5 block h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
              />
            </div>
            <div>
              <label htmlFor="evt-target" className="block text-xs font-bold text-[#334155]">
                Target Sponsor
              </label>
              <input
                id="evt-target"
                type="number"
                min={1}
                value={targetSponsors}
                onChange={(e) => setTargetSponsors(e.target.value)}
                className="mt-1.5 block h-10 w-full rounded-xl border border-slate-200 px-3 font-mono text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="evt-status" className="block text-xs font-bold text-[#334155]">
              Status Event
            </label>
            <select
              id="evt-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'Aktif' | 'Perencanaan')}
              className="mt-1.5 block h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="Aktif">Aktif</option>
              <option value="Perencanaan">Perencanaan</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[40px] rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-[#475569] hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="min-h-[40px] rounded-xl bg-[#0755B1] px-5 py-2 text-xs font-bold text-white hover:bg-[#105EA9] cursor-pointer"
            >
              Simpan Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
