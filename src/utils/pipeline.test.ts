import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateFollowUpDeadlines,
  computeEventSummary,
  getPartnerUrgency,
  interpolateMouTemplate,
  parseSpreadsheetRows,
  redactActivityForRole,
} from './pipeline';
import type {ActivityLogItem, PartnerRecord} from '../types/database';

const BASE_PARTNER: PartnerRecord = {
  id: 'prt-test-1',
  companyName: 'PT Bank Central Asia Tbk',
  category: 'Sponsor',
  eventId: 'evt-techspire-2026',
  picInternal: 'Prabwi Sumiati',
  contactPerson: {
    name: 'Dita Danika',
    position: 'Corporate Partnership',
    contact: '0821-3344-5566',
    isAvailable: true,
    lastUpdated: '2026-11-20',
  },
  currentStep: 1,
  pipelineStatus: 'Follow-Up D+3',
  proposalSentAt: '2026-11-18',
  deadlineD3: '2026-11-21',
  deadlineD7: '2026-11-25',
  followUpD3Done: false,
  followUpD7Done: false,
  grade: 'Gold',
  sponsorshipValue: 15000000,
  result: 'Pending',
  meetings: [],
  benefits: [
    {id: 'b1', label: 'Logo Main Stage', completed: true},
    {id: 'b2', label: 'Booth 3x3m', completed: false},
  ],
  mouStatus: 'Siap Dibuat',
  notes: '',
  history: [],
};

test('calculateFollowUpDeadlines adds +3 and +7 days accurately', () => {
  const res = calculateFollowUpDeadlines('2026-11-26');
  assert.equal(res.deadlineD3, '2026-11-29');
  assert.equal(res.deadlineD7, '2026-12-03');
});

test('getPartnerUrgency detects overdue follow-up for Pending partners', () => {
  const overdue = getPartnerUrgency(BASE_PARTNER, '2026-11-26');
  assert.equal(overdue.isOverdue, true);
  assert.equal(overdue.dueDate, '2026-11-21');
  assert.equal(overdue.daysOverdue, 5);

  const notYetDue = getPartnerUrgency(BASE_PARTNER, '2026-11-20');
  assert.equal(notYetDue.isOverdue, false);

  const completedFollowUps = getPartnerUrgency(
    {...BASE_PARTNER, followUpD3Done: true, followUpD7Done: true},
    '2026-11-26'
  );
  assert.equal(completedFollowUps.isOverdue, false);
});

test('computeEventSummary masks totalDealValue for Staff and sums for Manager', () => {
  const partners: PartnerRecord[] = [
    BASE_PARTNER,
    {...BASE_PARTNER, id: 'p2', result: 'Accept', sponsorshipValue: 10000000},
    {...BASE_PARTNER, id: 'p3', result: 'Decline', sponsorshipValue: 5000000},
  ];

  const managerSummary = computeEventSummary(partners, true, '2026-11-26');
  assert.equal(managerSummary.pendingCount, 1);
  assert.equal(managerSummary.acceptCount, 1);
  assert.equal(managerSummary.declineCount, 1);
  assert.equal(managerSummary.overdueCount, 1);
  assert.equal(managerSummary.totalDealValue, 10000000);

  const staffSummary = computeEventSummary(partners, false, '2026-11-26');
  assert.equal(staffSummary.totalDealValue, null);
});

test('interpolateMouTemplate hides monetary sponsorship value from Staff', () => {
  const template = 'Acara {{event}} | PT: {{nama_company}} | CP: {{cp}} ({{jabatan_cp}}) | Paket: {{nilai}}\n{{benefit}}';
  const mgrDoc = interpolateMouTemplate(template, BASE_PARTNER, 'BNCC TechSpire 2026', true, '2026-11-27');
  assert.match(mgrDoc, /Gold — Rp 15\.000\.000/);
  assert.match(mgrDoc, /1\. Logo Main Stage \[Terpenuhi\]/);

  const staffDoc = interpolateMouTemplate(template, BASE_PARTNER, 'BNCC TechSpire 2026', false, '2026-11-27');
  assert.doesNotMatch(staffDoc, /15\.000\.000/);
  assert.match(staffDoc, /dirahasiakan/);
});

test('parseSpreadsheetRows parses CSV & Google Sheets TSV with header skip and validation', () => {
  const csv = [
    'Nama Company,Contact Person,Jabatan CP,Kontak CP,Tanggal Kirim,PIC Internal,Kategori',
    'PT Bukalapak.com,Rendy Wijaya,Partnership Lead,0812-9000-1122,2026-11-26,Nadia Putri,Sponsor',
    'Tech in Asia\tSinta Dewi\tMedia Lead\t0813-7788-9900\t2026-11-26\tAlya Rahma\tMedia Partner',
    'Invalid Row,,,,2026-11-26,Rizky,Komunitas',
  ].join('\n');

  const rows = parseSpreadsheetRows(csv, '2026-11-26');
  assert.equal(rows.length, 3);
  assert.equal(rows[0].valid, true);
  assert.equal(rows[0].deadlineD3, '2026-11-29');
  assert.equal(rows[0].deadlineD7, '2026-12-03');
  assert.equal(rows[1].valid, true);
  assert.equal(rows[1].category, 'Media Partner');
  assert.equal(rows[2].valid, false);
});

test('redactActivityForRole strips nominal Rp figures for non-manager roles', () => {
  const log: ActivityLogItem = {
    id: 'l1',
    eventId: 'evt-1',
    category: 'Pitching & MoU',
    title: 'Grading',
    description: 'Deal Platinum senilai Rp 30.000.000 disetujui.',
    timestamp: '2026-11-26 10:00 WIB',
    actorName: 'Nathan',
    actorRole: 'Manager EEO',
  };

  assert.match(redactActivityForRole(log, true), /Rp 30\.000\.000/);
  assert.doesNotMatch(redactActivityForRole(log, false), /30\.000\.000/);
});
