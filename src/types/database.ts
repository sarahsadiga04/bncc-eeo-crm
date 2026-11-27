export type UserRole = 'admin' | 'member';

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
  status: string;
}

export interface PartnerRecord {
  id: string;
  companyName: string;
  category: 'Sponsor' | 'Media Partner' | 'Komunitas';
  eventId: string;
  contactPerson: {
    name: string;
    contact: string;
    isAvailable: boolean;
    lastUpdated: string;
  };
  pipelineStatus: string;
  proposalSentAt: string;
  grade: string;
  sponsorshipValue: number;
  mouStatus: string;
  notes: string;
}
