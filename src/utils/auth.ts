import type {UserAccount, UserRole} from '../types/database';

export interface LoginValidationResult {
  valid: boolean;
  emailError: string | null;
  passwordError: string | null;
}

export interface AuthAttemptResult {
  ok: boolean;
  user?: UserAccount;
  error?: string;
}

export interface RoleConfig {
  role: UserRole;
  kicker: string;
  label: string;
  buttonLabel: string;
  emailPlaceholder: string;
  demoEmail: string;
  demoPassword: string;
  accessSummary: string;
}

export function getRoleConfig(role: UserRole): RoleConfig {
  if (role === 'admin') {
    return {
      role: 'admin',
      kicker: 'ADMIN',
      label: 'Manager',
      buttonLabel: 'Masuk ke Dashboard Manager EEO',
      emailPlaceholder: 'abcd.manager@bncc.net',
      demoEmail: 'abcd.manager@bncc.net',
      demoPassword: 'eeo2026',
      accessSummary:
        'Akses penuh hasil pitching, nominal sponsorship, persetujuan edit staff, dan template MoU per event.',
    };
  }

  return {
    role: 'member',
    kicker: 'MEMBER',
    label: 'Staff EEO',
    buttonLabel: 'Masuk ke Dashboard Staff EEO',
    emailPlaceholder: 'dhina.staff@bncc.net',
    demoEmail: 'dhina.staff@bncc.net',
    demoPassword: 'eeo2026',
    accessSummary:
      'Akses input cepat partner, pembaruan Contact Person, pipeline status proposal, dan checklist benefit tanpa nominal sponsorship.',
  };
}

export function validateLoginInput(
  rawEmail: string,
  rawPassword: string
): LoginValidationResult {
  const email = rawEmail.trim().toLowerCase();
  const password = rawPassword.trim();

  let emailError: string | null = null;
  let passwordError: string | null = null;

  if (!email) {
    emailError = 'Email pengurus wajib diisi.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    emailError = 'Format email tidak valid.';
  } else if (!email.endsWith('@bncc.net')) {
    emailError = 'Gunakan email resmi pengurus berdomain @bncc.net.';
  }

  if (!password) {
    passwordError = 'Password wajib diisi.';
  } else if (password.length < 4) {
    passwordError = 'Password minimal 4 karakter.';
  }

  return {
    valid: emailError === null && passwordError === null,
    emailError,
    passwordError,
  };
}

export function authenticateUser(
  users: UserAccount[],
  selectedRole: UserRole,
  rawEmail: string,
  rawPassword: string
): AuthAttemptResult {
  const validation = validateLoginInput(rawEmail, rawPassword);
  if (!validation.valid) {
    return {
      ok: false,
      error: validation.emailError ?? validation.passwordError ?? 'Input tidak valid.',
    };
  }

  const email = rawEmail.trim().toLowerCase();
  const password = rawPassword;

  const matchedUser = users.find((u) => u.email.toLowerCase() === email);
  if (!matchedUser) {
    return {
      ok: false,
      error: 'Email pengurus tidak terdaftar pada database prototype.',
    };
  }

  if (matchedUser.password !== password) {
    return {
      ok: false,
      error: 'Password yang dimasukkan salah. Periksa kembali kredensial Anda.',
    };
  }

  if (matchedUser.role !== selectedRole) {
    const expectedLabel = matchedUser.role === 'admin' ? 'ADMIN (Manager)' : 'MEMBER (Staff EEO)';
    return {
      ok: false,
      error: `Akun ini terdaftar sebagai ${expectedLabel}. Silakan pilih role ${expectedLabel} di atas.`,
    };
  }

  return {
    ok: true,
    user: matchedUser,
  };
}
