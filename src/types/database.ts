export type UserRole = 'admin' | 'member';

export type PartnerCategory = 'Sponsor' | 'Media Partner' | 'Komunitas';

export type DealResult = 'Pending' | 'Accept' | 'Decline';

export type MouStatus = 'Belum Dibuat' | 'Siap Dibuat' | 'Draft' | 'Review Manager' | 'Selesai';

export type ActivityCategory =
  | 'Proposal & Pipeline'
  | 'Contact Person'
  | 'Pitching & MoU'
  | 'Impor & Handover';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  title: string;
  division: string;
  generation: string;
  canViewSponsorshipValue: boolean;
}

export interface BnccEvent {
  id: string;
  name: string;
  period: string;
  targetSponsors: number;
  status: 'Aktif' | 'Perencanaan' | 'Selesai';
}

export interface ContactPersonInfo {
  name: string;
  position: string;
  contact: string;
  isAvailable: boolean;
  lastUpdated: string;
  notes?: string;
}

export interface MeetingScheduleItem {
  id: string;
  date: string;
  time: string;
  method: 'Online' | 'Offline';
  address: string;
  participants: string;
  createdBy: string;
}

export interface BenefitChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface PartnerHistoryItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
}

export interface PartnerRecord {
  id: string;
  companyName: string;
  category: PartnerCategory;
  eventId: string;
  picInternal: string;
  contactPerson: ContactPersonInfo;
  currentStep: number; // 1..9
  pipelineStatus: string;
  proposalSentAt: string;
  deadlineD3: string;
  deadlineD7: string;
  followUpD3Done: boolean;
  followUpD7Done: boolean;
  grade: string;
  sponsorshipValue: number;
  result: DealResult;
  rejectionReason?: string;
  meetingSummary?: string;
  meetings: MeetingScheduleItem[];
  benefits: BenefitChecklistItem[];
  mouStatus: MouStatus;
  mouTemplateId?: string;
  mouGeneratedAt?: string;
  notes: string;
  history: PartnerHistoryItem[];
}

export interface MouTemplate {
  id: string;
  eventId: string;
  title: string;
  type: 'Sponsorship' | 'Media Partner / Komunitas';
  updatedAt: string;
  body: string;
}

export interface CpEditRequest {
  id: string;
  eventId: string;
  partnerId: string;
  companyName: string;
  requestTitle: string;
  requestedBy: string;
  requestedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  rejectionReason?: string;
  decidedBy?: string;
  decidedAt?: string;
  oldCp: ContactPersonInfo;
  newCp: ContactPersonInfo;
}

export interface ActivityLogItem {
  id: string;
  eventId: string;
  category: ActivityCategory;
  title: string;
  description: string;
  redactedDescription?: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  companyName?: string;
}

export interface PrototypeWorkspaceData {
  users: UserAccount[];
  events: BnccEvent[];
  partners: PartnerRecord[];
  mouTemplates: MouTemplate[];
  editRequests: CpEditRequest[];
  activityLogs: ActivityLogItem[];
}
