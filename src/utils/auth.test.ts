import test from 'node:test';
import assert from 'node:assert/strict';
import {authenticateUser, getRoleConfig, validateLoginInput} from './auth';
import type {UserAccount} from '../types/database';

const SAMPLE_USERS: UserAccount[] = [
  {
    id: 'usr-mgr-02',
    name: 'Pengurus Manager EEO',
    email: 'abcd.manager@bncc.net',
    password: 'eeo2026',
    role: 'admin',
    title: 'Manager EEO',
    division: 'External Event Organizer',
    generation: 'BNCC 2026/2027',
    canViewSponsorshipValue: true,
  },
  {
    id: 'usr-stf-01',
    name: 'Dhina Kusuma',
    email: 'dhina.staff@bncc.net',
    password: 'eeo2026',
    role: 'member',
    title: 'Staff EEO',
    division: 'External Event Organizer',
    generation: 'BNCC 2026/2027',
    canViewSponsorshipValue: false,
  },
];

test('validateLoginInput rejects empty inputs and non-@bncc.net emails', () => {
  const empty = validateLoginInput('', '');
  assert.equal(empty.valid, false);
  assert.ok(empty.emailError);
  assert.ok(empty.passwordError);

  const wrongDomain = validateLoginInput('dhina@gmail.com', 'eeo2026');
  assert.equal(wrongDomain.valid, false);
  assert.match(wrongDomain.emailError ?? '', /@bncc\.net/);

  const valid = validateLoginInput('  dhina.staff@bncc.net ', 'eeo2026');
  assert.equal(valid.valid, true);
  assert.equal(valid.emailError, null);
  assert.equal(valid.passwordError, null);
});

test('authenticateUser succeeds for matching role and credentials', () => {
  const result = authenticateUser(SAMPLE_USERS, 'admin', 'abcd.manager@bncc.net', 'eeo2026');
  assert.equal(result.ok, true);
  assert.equal(result.user?.name, 'Pengurus Manager EEO');
  assert.equal(result.user?.canViewSponsorshipValue, true);
});

test('authenticateUser rejects mismatched role selection', () => {
  const result = authenticateUser(SAMPLE_USERS, 'member', 'abcd.manager@bncc.net', 'eeo2026');
  assert.equal(result.ok, false);
  assert.match(result.error ?? '', /ADMIN \(Manager\)/);
});

test('authenticateUser rejects wrong password or unknown email', () => {
  const badPass = authenticateUser(SAMPLE_USERS, 'member', 'dhina.staff@bncc.net', 'wrong');
  assert.equal(badPass.ok, false);
  assert.match(badPass.error ?? '', /Password/);

  const unknown = authenticateUser(SAMPLE_USERS, 'member', 'nobody@bncc.net', 'eeo2026');
  assert.equal(unknown.ok, false);
  assert.match(unknown.error ?? '', /tidak terdaftar/);
});

test('getRoleConfig returns accurate button labels for admin and member', () => {
  assert.equal(getRoleConfig('admin').buttonLabel, 'Masuk ke Dashboard Manager EEO');
  assert.equal(getRoleConfig('member').buttonLabel, 'Masuk ke Dashboard Staff EEO');
});
