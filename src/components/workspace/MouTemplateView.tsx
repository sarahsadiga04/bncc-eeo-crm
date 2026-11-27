import {useState, type FormEvent} from 'react';
import {Check, Copy, FileText, Plus, X} from 'lucide-react';
import type {
  BnccEvent,
  MouTemplate,
  PartnerRecord,
  UserAccount,
} from '../../types/database';
import {
  formatRupiah,
  getTodayIso,
  interpolateMouTemplate,
} from '../../utils/pipeline';

interface MouTemplateViewProps {
  user: UserAccount;
  activeEvent: BnccEvent;
  templates: MouTemplate[];
  partners: PartnerRecord[];
  onSaveTemplate: (template: MouTemplate) => void;
  onFinalizeMou: (partnerId: string, templateId: string) => void;
}

const DEFAULT_TEMPLATE_BODY = `PERJANJIAN KERJA SAMA {{event}}

Tanggal: {{tanggal}}
Perusahaan: {{nama_company}}
Contact Person: {{cp}} ({{jabatan_cp}})
Paket & Nilai: {{nilai}}

Daftar Benefit:
{{benefit}}`;

export function MouTemplateView({
  user,
  activeEvent,
  templates,
  partners,
  onSaveTemplate,
  onFinalizeMou,
}: MouTemplateViewProps) {
  const isManager = user.role === 'admin';
  const acceptedPartners = partners.filter((p) => p.result === 'Accept');

  // Create / Edit template modal
  const [editingTemplate, setEditingTemplate] = useState<MouTemplate | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [tplTitle, setTplTitle] = useState('');
  const [tplType, setTplType] = useState<'Sponsorship' | 'Media Partner / Komunitas'>('Sponsorship');
  const [tplBody, setTplBody] = useState(DEFAULT_TEMPLATE_BODY);

  // Document generator modal
  const [activePartnerForMou, setActivePartnerForMou] = useState<PartnerRecord | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [copiedDoc, setCopiedDoc] = useState(false);

  const openCreateModal = () => {
    setCreatingNew(true);
    setEditingTemplate(null);
    setTplTitle(`Template MoU Baru — ${activeEvent.name}`);
    setTplType('Sponsorship');
    setTplBody(DEFAULT_TEMPLATE_BODY);
  };

  const openEditModal = (tpl: MouTemplate) => {
    setEditingTemplate(tpl);
    setCreatingNew(false);
    setTplTitle(tpl.title);
    setTplType(tpl.type);
    setTplBody(tpl.body);
  };

  const handleSaveTemplate = (e: FormEvent) => {
    e.preventDefault();
    if (!tplTitle.trim() || !tplBody.trim()) return;
    onSaveTemplate({
      id: editingTemplate ? editingTemplate.id : `mou-tpl-${Date.now()}`,
      eventId: activeEvent.id,
      title: tplTitle.trim(),
      type: tplType,
      updatedAt: getTodayIso(),
      body: tplBody,
    });
    setCreatingNew(false);
    setEditingTemplate(null);
  };

  const openDocumentGenerator = (partner: PartnerRecord) => {
    setActivePartnerForMou(partner);
    const matchingTpl =
      templates.find((t) =>
        partner.category === 'Sponsor'
          ? t.type === 'Sponsorship'
          : t.type === 'Media Partner / Komunitas'
      ) ?? templates[0];
    setSelectedTemplateId(matchingTpl?.id ?? '');
    setCopiedDoc(false);
  };

  const activeTemplateObj =
    templates.find((t) => t.id === selectedTemplateId) ?? templates[0] ?? null;

  const generatedDocText =
    activePartnerForMou && activeTemplateObj
      ? interpolateMouTemplate(
          activeTemplateObj.body,
          activePartnerForMou,
          activeEvent.name,
          user.canViewSponsorshipValue
        )
      : '';

  const handleCopyDoc = () => {
    if (!generatedDocText) return;
    navigator.clipboard?.writeText(generatedDocText).catch(() => {});
    setCopiedDoc(true);
    setTimeout(() => setCopiedDoc(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#DBEAFE] bg-white p-5 sm:p-6">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-[#0755B1]">
            Template MoU Event — {activeEvent.name}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#64748B]">
            Kelola naskah MoU per event dengan placeholder otomatis
          </p>
        </div>
        {isManager && (
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#0755B1] px-4 py-2 text-xs sm:text-sm font-bold text-white hover:bg-[#105EA9] cursor-pointer whitespace-nowrap"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Template MoU Baru</span>
          </button>
        )}
      </div>

      {/* Generate MoU Otomatis (Partner Accepted) */}
      <div className="rounded-2xl border border-[#DBEAFE] bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-[#1E1E1E]">
              Generate MoU Otomatis (Partner Accepted)
            </h2>
            <p className="mt-0.5 text-xs text-[#64748B]">
              Tarik data nama company, CP, grade, dan daftar benefit secara otomatis ke template
            </p>
          </div>
          <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 font-mono text-xs font-bold tabular-nums text-[#15803D]">
            {acceptedPartners.length} Partner Accepted
          </span>
        </div>

        {acceptedPartners.length === 0 ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-[#F8FBFF] px-4 py-4 text-center text-xs sm:text-sm font-semibold text-[#475569]">
            Belum ada perusahaan berstatus Accepted pada event ini.
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {acceptedPartners.map((partner) => (
              <div
                key={partner.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-[#DBEAFE] bg-[#F8FBFF] p-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-[#1E1E1E]">
                    {partner.companyName}
                  </p>
                  <p className="mt-0.5 text-xs text-[#64748B]">
                    CP: <strong className="text-[#1E1E1E]">{partner.contactPerson.name}</strong> · Status MoU:{' '}
                    <span className="font-bold text-[#0755B1]">{partner.mouStatus}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openDocumentGenerator(partner)}
                  disabled={templates.length === 0}
                  className="inline-flex min-h-[38px] shrink-0 items-center justify-center rounded-xl bg-[#16A34A] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#15803D] disabled:opacity-50 cursor-pointer whitespace-nowrap"
                >
                  {partner.mouStatus === 'Selesai' ? 'Lihat MoU' : 'Buat MoU'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#BCD9FC] bg-white p-8 text-center">
          <FileText className="mx-auto h-8 w-8 text-[#0755B1]/50" aria-hidden="true" />
          <p className="mt-2 text-sm font-semibold text-[#475569]">
            Belum ada template MoU untuk event {activeEvent.name}.
          </p>
          {isManager && (
            <button
              type="button"
              onClick={openCreateModal}
              className="mt-3 inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#0755B1] px-4 py-2 text-xs font-bold text-white hover:bg-[#105EA9] cursor-pointer"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Buat Template Pertama</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {templates.map((tpl) => (
            <article
              key={tpl.id}
              className="flex flex-col rounded-2xl border border-[#DBEAFE] bg-white p-5 sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-block rounded-md bg-[#E6F0FD] px-2.5 py-0.5 text-[11px] font-bold text-[#0755B1]">
                    {tpl.type}
                  </span>
                  <h3 className="mt-2 text-base font-extrabold text-[#1E1E1E]">
                    {tpl.title}
                  </h3>
                  <p className="mt-0.5 font-mono text-[11px] text-[#64748B]">
                    Diperbarui: {tpl.updatedAt}
                  </p>
                </div>

                {isManager && (
                  <button
                    type="button"
                    onClick={() => openEditModal(tpl)}
                    className="inline-flex min-h-[36px] shrink-0 items-center rounded-xl border border-[#BCD9FC] bg-white px-3 py-1.5 text-xs font-bold text-[#0755B1] hover:bg-[#F3F8FD] cursor-pointer whitespace-nowrap"
                  >
                    Edit Template
                  </button>
                )}
              </div>

              <pre className="mt-4 flex-1 whitespace-pre-wrap rounded-xl border border-slate-200 bg-[#F8FBFF] p-4 font-sans text-xs leading-relaxed text-[#334155]">
                {tpl.body}
              </pre>
            </article>
          ))}
        </div>
      )}

      {/* Modal: Create / Edit Template MoU (Manager Only) */}
      {(creatingNew || editingTemplate) && isManager && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tpl-modal-title"
        >
          <div className="w-full max-w-[680px] rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <h2 id="tpl-modal-title" className="text-lg sm:text-xl font-extrabold text-[#0755B1]">
                {editingTemplate ? 'Edit Template MoU' : 'Buat Template MoU Baru'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setCreatingNew(false);
                  setEditingTemplate(null);
                }}
                aria-label="Tutup modal template"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label htmlFor="tpl-title" className="block text-xs font-bold text-[#334155]">
                    Judul Template *
                  </label>
                  <input
                    id="tpl-title"
                    type="text"
                    required
                    value={tplTitle}
                    onChange={(e) => setTplTitle(e.target.value)}
                    className="mt-1.5 block h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="tpl-type" className="block text-xs font-bold text-[#334155]">
                    Tipe
                  </label>
                  <select
                    id="tpl-type"
                    value={tplType}
                    onChange={(e) =>
                      setTplType(e.target.value as 'Sponsorship' | 'Media Partner / Komunitas')
                    }
                    className="mt-1.5 block h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium"
                  >
                    <option value="Sponsorship">Sponsorship</option>
                    <option value="Media Partner / Komunitas">Media Partner / Komunitas</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="tpl-body" className="block text-xs font-bold text-[#334155]">
                  Naskah Template (Placeholder: {'{{event}}'}, {'{{tanggal}}'}, {'{{nama_company}}'}, {'{{cp}}'}, {'{{jabatan_cp}}'}, {'{{nilai}}'}, {'{{benefit}}'})
                </label>
                <textarea
                  id="tpl-body"
                  rows={10}
                  required
                  value={tplBody}
                  onChange={(e) => setTplBody(e.target.value)}
                  className="mt-1.5 block w-full rounded-xl border border-slate-200 p-3.5 font-mono text-xs leading-relaxed text-[#1E1E1E]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setCreatingNew(false);
                    setEditingTemplate(null);
                  }}
                  className="min-h-[40px] rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-[#475569] hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-[40px] rounded-xl bg-[#0755B1] px-5 py-2 text-xs font-bold text-white hover:bg-[#105EA9] cursor-pointer"
                >
                  Simpan Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Generated MoU Document Preview */}
      {activePartnerForMou && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="doc-mou-title"
        >
          <div className="my-auto w-full max-w-[820px] rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <h2 id="doc-mou-title" className="text-lg sm:text-xl font-extrabold text-[#1E1E1E]">
                Dokumen MoU — {activePartnerForMou.companyName}
              </h2>
              <button
                type="button"
                onClick={() => setActivePartnerForMou(null)}
                aria-label="Tutup dokumen MoU"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
              {/* Left Info Panel */}
              <div className="rounded-2xl border border-[#DBEAFE] bg-[#F3F8FD] p-4 space-y-4">
                <div>
                  <label htmlFor="select-doc-tpl" className="block text-xs font-extrabold text-[#0755B1]">
                    Pilih Template Event
                  </label>
                  <select
                    id="select-doc-tpl"
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="mt-2 block w-full rounded-xl border border-[#BCD9FC] bg-white px-3 py-2 text-xs font-bold text-[#1E1E1E]"
                  >
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-[#64748B]">Perusahaan</p>
                  <p className="text-sm font-bold text-[#1E1E1E]">{activePartnerForMou.companyName}</p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-[#64748B]">Contact Person</p>
                  <p className="text-sm font-bold text-[#1E1E1E]">{activePartnerForMou.contactPerson.name}</p>
                  <p className="text-xs text-[#64748B]">{activePartnerForMou.contactPerson.position}</p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-[#64748B]">Paket / Nilai</p>
                  <p className="text-xs font-bold text-[#15803D]">
                    {user.canViewSponsorshipValue
                      ? `${activePartnerForMou.grade || '-'} · ${formatRupiah(
                          activePartnerForMou.sponsorshipValue
                        )}`
                      : 'Dirahasiakan (Khusus Manager & Bendahara)'}
                  </p>
                </div>
              </div>

              {/* Right Interpolated Naskah MoU */}
              <div className="md:col-span-2 rounded-2xl border border-[#DBEAFE] bg-[#F8FBFF] p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-extrabold text-[#0755B1]">Naskah MoU</p>
                  <button
                    type="button"
                    onClick={handleCopyDoc}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#BCD9FC] bg-white px-2.5 py-1 text-xs font-bold text-[#0755B1] hover:bg-[#E6F0FD] cursor-pointer"
                  >
                    {copiedDoc ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[#16A34A]" aria-hidden="true" />
                        <span>Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Salin Naskah</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="mt-3 max-h-[340px] overflow-y-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-4 font-sans text-xs leading-relaxed text-[#1E1E1E]">
                  {generatedDocText}
                </pre>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setActivePartnerForMou(null)}
                className="min-h-[40px] rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-[#475569] hover:bg-slate-50 cursor-pointer"
              >
                Tutup
              </button>

              {isManager && activeTemplateObj && (
                <button
                  type="button"
                  onClick={() => {
                    onFinalizeMou(activePartnerForMou.id, activeTemplateObj.id);
                    setActivePartnerForMou(null);
                  }}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#16A34A] px-5 py-2 text-xs font-bold text-white hover:bg-[#15803D] cursor-pointer"
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                  <span>Tandai MoU Selesai</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
