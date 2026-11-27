import type {
  ActivityLogItem,
  PartnerCategory,
  PartnerRecord,
} from '../types/database';

export interface TimelineStepDef {
  step: number;
  label: string;
  shortLabel: string;
}

export const TIMELINE_STEPS: TimelineStepDef[] = [
  {step: 1, label: 'Follow-up Day +3', shortLabel: 'Follow-up Day +3'},
  {step: 2, label: 'Follow-up Day +7', shortLabel: 'Follow-up Day +7'},
  {step: 3, label: 'Company response', shortLabel: 'Company response...'},
  {step: 4, label: 'Get PIC', shortLabel: 'Get PIC'},
  {step: 5, label: 'Schedule meeting', shortLabel: 'Schedule meeting'},
  {step: 6, label: 'Pitching', shortLabel: 'Pitching'},
  {step: 7, label: 'Interest follow-up', shortLabel: 'Interest follow-up'},
  {step: 8, label: 'Grading', shortLabel: 'Grading'},
  {step: 9, label: 'MoU', shortLabel: 'MoU'},
];

export function addDaysIso(isoDate: string, days: number): string {
  const parsed = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
}

export function calculateFollowUpDeadlines(proposalSentAt: string): {
  deadlineD3: string;
  deadlineD7: string;
} {
  return {
    deadlineD3: addDaysIso(proposalSentAt, 3),
    deadlineD7: addDaysIso(proposalSentAt, 7),
  };
}

export function diffDaysBetween(fromIso: string, toIso: string): number {
  const from = new Date(`${fromIso}T00:00:00Z`);
  const to = new Date(`${toIso}T00:00:00Z`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return 0;
  }
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

export function getTodayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getNowWibLabel(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min} WIB`;
}

export interface PartnerUrgencyInfo {
  needsFollowUp: boolean;
  isOverdue: boolean;
  dueDate: string;
  daysElapsed: number;
  daysOverdue: number;
}

export function getPartnerUrgency(
  partner: PartnerRecord,
  referenceDate: string = getTodayIso()
): PartnerUrgencyInfo {
  const daysElapsed = Math.max(0, diffDaysBetween(partner.proposalSentAt, referenceDate));

  if (partner.result !== 'Pending' || (partner.followUpD3Done && partner.followUpD7Done)) {
    return {
      needsFollowUp: false,
      isOverdue: false,
      dueDate: partner.deadlineD7 || partner.proposalSentAt,
      daysElapsed,
      daysOverdue: 0,
    };
  }

  const activeDeadline = !partner.followUpD3Done
    ? partner.deadlineD3
    : partner.deadlineD7;

  const daysOverdue = diffDaysBetween(activeDeadline, referenceDate);
  const isOverdue = daysOverdue >= 0;

  return {
    needsFollowUp: isOverdue,
    isOverdue,
    dueDate: activeDeadline,
    daysElapsed,
    daysOverdue: Math.max(0, daysOverdue),
  };
}

export interface EventKpiSummary {
  pendingCount: number;
  acceptCount: number;
  declineCount: number;
  overdueCount: number;
  totalDealValue: number | null;
}

export function computeEventSummary(
  partners: PartnerRecord[],
  canViewSponsorshipValue: boolean,
  referenceDate: string = getTodayIso()
): EventKpiSummary {
  let pendingCount = 0;
  let acceptCount = 0;
  let declineCount = 0;
  let overdueCount = 0;
  let dealSum = 0;

  for (const p of partners) {
    if (p.result === 'Accept') {
      acceptCount += 1;
      dealSum += Number(p.sponsorshipValue) || 0;
    } else if (p.result === 'Decline') {
      declineCount += 1;
    } else {
      pendingCount += 1;
      if (getPartnerUrgency(p, referenceDate).isOverdue) {
        overdueCount += 1;
      }
    }
  }

  return {
    pendingCount,
    acceptCount,
    declineCount,
    overdueCount,
    totalDealValue: canViewSponsorshipValue ? dealSum : null,
  };
}

export function formatRupiah(value: number): string {
  return `Rp ${Math.max(0, Math.round(value)).toLocaleString('id-ID')}`;
}

export function formatShortDate(isoDate: string): string {
  if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    return isoDate;
  }
  const [y, m, d] = isoDate.split('-');
  return `${Number(d)}/${Number(m)}/${y}`;
}

export function interpolateMouTemplate(
  templateBody: string,
  partner: PartnerRecord,
  eventName: string,
  canViewSponsorshipValue: boolean,
  tanggalIso: string = getTodayIso()
): string {
  const nilaiLabel = canViewSponsorshipValue
    ? `${partner.grade && partner.grade !== '-' ? partner.grade : 'Custom'} — ${formatRupiah(
        partner.sponsorshipValue
      )}`
    : `${
        partner.grade && partner.grade !== '-' ? partner.grade : 'Paket Kerja Sama'
      } (Nominal dirahasiakan — Khusus Manager EEO & Bendahara)`;

  const benefitLines =
    partner.benefits.length > 0
      ? partner.benefits
          .map((b, idx) => `${idx + 1}. ${b.label}${b.completed ? ' [Terpenuhi]' : ''}`)
          .join('\n')
      : '1. Sesuai kesepakatan benefit bersama panitia.';

  return templateBody
    .replaceAll('{{event}}', eventName)
    .replaceAll('{{tanggal}}', tanggalIso)
    .replaceAll('{{nama_company}}', partner.companyName)
    .replaceAll('{{cp}}', partner.contactPerson.name)
    .replaceAll('{{jabatan_cp}}', partner.contactPerson.position || 'PIC Partnership')
    .replaceAll('{{nilai}}', nilaiLabel)
    .replaceAll('{{benefit}}', benefitLines);
}

export interface ParsedSpreadsheetRow {
  rowNumber: number;
  valid: boolean;
  error: string | null;
  companyName: string;
  cpName: string;
  cpPosition: string;
  cpContact: string;
  proposalSentAt: string;
  picInternal: string;
  category: PartnerCategory;
  deadlineD3: string;
  deadlineD7: string;
}

function normalizePartnerCategory(raw: string): PartnerCategory {
  const lower = raw.trim().toLowerCase();
  if (lower.includes('media')) return 'Media Partner';
  if (lower.includes('komunitas') || lower.includes('community')) return 'Komunitas';
  return 'Sponsor';
}

export function parseSpreadsheetRows(
  rawText: string,
  fallbackDate: string = getTodayIso()
): ParsedSpreadsheetRow[] {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [];
  }

  const results: ParsedSpreadsheetRow[] = [];

  lines.forEach((line, index) => {
    const delimiter = line.includes('\t') ? '\t' : ',';
    const cols = line.split(delimiter).map((c) => c.trim());

    // Skip header row if detected
    if (
      index === 0 &&
      cols[0]?.toLowerCase().includes('nama company')
    ) {
      return;
    }

    const [
      companyName = '',
      cpName = '',
      cpPosition = 'PIC Partnership',
      cpContact = '',
      rawSentAt = fallbackDate,
      picInternal = '',
      rawCategory = 'Sponsor',
    ] = cols;

    const sentAt = /^\d{4}-\d{2}-\d{2}$/.test(rawSentAt) ? rawSentAt : fallbackDate;
    const {deadlineD3, deadlineD7} = calculateFollowUpDeadlines(sentAt);

    let error: string | null = null;
    if (!companyName) {
      error = 'Nama Company kosong';
    } else if (!cpName) {
      error = 'Nama Contact Person kosong';
    } else if (!cpContact) {
      error = 'Kontak CP kosong';
    } else if (!picInternal) {
      error = 'PIC Internal kosong';
    }

    results.push({
      rowNumber: index + 1,
      valid: error === null,
      error,
      companyName,
      cpName,
      cpPosition: cpPosition || 'PIC Partnership',
      cpContact,
      proposalSentAt: sentAt,
      picInternal,
      category: normalizePartnerCategory(rawCategory),
      deadlineD3,
      deadlineD7,
    });
  });

  return results;
}

export function redactActivityForRole(
  log: ActivityLogItem,
  canViewSponsorshipValue: boolean
): string {
  if (canViewSponsorshipValue) {
    return log.description;
  }
  if (log.redactedDescription) {
    return log.redactedDescription;
  }
  return log.description.replace(/Rp\s*[\d.,]+/gi, '[Nominal dirahasiakan]');
}
