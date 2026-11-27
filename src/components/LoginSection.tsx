import {useState, type FormEvent} from 'react';
import {AlertCircle, CheckCircle2, Database, Eye, EyeOff, Lock, LogOut, ShieldCheck} from 'lucide-react';
import type {UserAccount, UserRole} from '../types/database';
import type {PrototypeDatabaseSnapshot} from '../services/jsonDb';
import {authenticateUser, getRoleConfig, validateLoginInput} from '../utils/auth';

interface LoginSectionProps {
  selectedRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  currentUser: UserAccount | null;
  dbSnapshot: PrototypeDatabaseSnapshot | null;
  dbError: string | null;
  isLoadingDb: boolean;
  onLoginSuccess: (user: UserAccount) => void;
  onLogout: () => void;
}

export function LoginSection({
  selectedRole,
  onSelectRole,
  currentUser,
  dbSnapshot,
  dbError,
  isLoadingDb,
  onLoginSuccess,
  onLogout,
}: LoginSectionProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [emailFieldError, setEmailFieldError] = useState<string | null>(null);
  const [passwordFieldError, setPasswordFieldError] = useState<string | null>(null);

  const roleConfig = getRoleConfig(selectedRole);

  const handleRoleSwitch = (role: UserRole) => {
    onSelectRole(role);
    setFormError(null);
  };

  const handleFillDemoAccount = (role: UserRole) => {
    const cfg = getRoleConfig(role);
    onSelectRole(role);
    setEmail(cfg.demoEmail);
    setPassword(cfg.demoPassword);
    setFormError(null);
    setEmailFieldError(null);
    setPasswordFieldError(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const validation = validateLoginInput(email, password);
    setEmailFieldError(validation.emailError);
    setPasswordFieldError(validation.passwordError);

    if (!validation.valid) {
      return;
    }

    if (!dbSnapshot) {
      setFormError(
        dbError ?? 'Database prototype belum selesai dimuat. Silakan coba sesaat lagi.'
      );
      return;
    }

    const result = authenticateUser(dbSnapshot.users, selectedRole, email, password);
    if (!result.ok || !result.user) {
      setFormError(result.error ?? 'Gagal masuk.');
      return;
    }

    onLoginSuccess(result.user);
  };

  return (
    <section
      id="login-section"
      aria-labelledby="login-heading"
      className="bg-white py-14 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-[733px] px-5 sm:px-6">
        {currentUser ? (
          <div
            data-testid="authenticated-session-panel"
            className="rounded-[20px] border-2 border-[#83B1EC]/70 bg-white p-6 sm:p-9 shadow-[0_6px_20px_rgba(36,84,171,0.08)]"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2454AB] text-white">
                  <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#2454AB]">
                    {currentUser.role === 'admin' ? 'ADMIN · MANAGER EEO' : 'MEMBER · STAFF EEO'}
                  </p>
                  <h2 className="mt-0.5 text-2xl font-extrabold text-[#1E1E1E]">
                    Selamat datang, {currentUser.name}
                  </h2>
                  <p className="mt-1 text-sm text-[#434242]">
                    {currentUser.email} · {currentUser.division} ({currentUser.generation})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-[#2454AB]/30 bg-[#E6F0FD]/50 px-4 py-2 text-sm font-bold text-[#2454AB] transition-colors hover:bg-[#BCD9FC]/50 cursor-pointer shrink-0"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span>Keluar</span>
              </button>
            </div>

            <div className="mt-6 border-t border-[#E6F0FD] pt-6">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#2454AB]" aria-hidden="true" />
                <div>
                  <h3 className="text-sm font-bold text-[#1E1E1E]">
                    Hak Akses Role Aktif ({currentUser.title})
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#434242]">
                    {getRoleConfig(currentUser.role).accessSummary}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-[#2454AB]">
                    Visibilitas Nilai Sponsorship:{' '}
                    {currentUser.canViewSponsorshipValue
                      ? 'Diizinkan (Manager EEO / Bendahara)'
                      : 'Disembunyikan (Khusus Manager EEO & Bendahara)'}
                  </p>
                </div>
              </div>
            </div>

            {dbSnapshot && (
              <div className="mt-6 border-t border-[#E6F0FD] pt-6">
                <div className="flex items-center gap-2 text-sm font-bold text-[#1E1E1E]">
                  <Database className="h-4 w-4 text-[#2454AB]" aria-hidden="true" />
                  <span>Database Prototype Terhubung (GitHub Static JSON)</span>
                </div>
                <div className="mt-4 grid grid-cols-3 divide-x divide-[#E6F0FD] rounded-xl bg-[#E6F0FD]/45 py-3 text-center">
                  <div className="px-2">
                    <p className="font-mono text-xl font-bold tabular-nums text-[#2454AB]">
                      {dbSnapshot.users.length}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-[#434242]">Akun Pengurus</p>
                  </div>
                  <div className="px-2">
                    <p className="font-mono text-xl font-bold tabular-nums text-[#2454AB]">
                      {dbSnapshot.events.length}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-[#434242]">Event BNCC</p>
                  </div>
                  <div className="px-2">
                    <p className="font-mono text-xl font-bold tabular-nums text-[#2454AB]">
                      {dbSnapshot.partners.length}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-[#434242]">Partner Seed</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-[#878787]">
                  Tampilan dashboard lanjutan untuk {currentUser.title} siap dikembangkan pada tahap berikutnya.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Section Title & Subtitle matching SVG */}
            <div className="text-center">
              <h2
                id="login-heading"
                className="text-[28px] sm:text-[36px] lg:text-[40px] font-extrabold tracking-tight text-[#1E1E1E]"
              >
                Pilih Akun Role &amp; Masuk
              </h2>
              <p className="mt-2.5 text-sm sm:text-base font-medium text-[#878787]">
                Tampilan dashboard menyesuaikan role yang kamu pilih
              </p>
            </div>

            {/* 2 Role Cards matching SVG */}
            <div
              role="radiogroup"
              aria-label="Pilih Role Akun"
              className="mt-9 sm:mt-11 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-9"
            >
              {(['admin', 'member'] as const).map((role) => {
                const cfg = getRoleConfig(role);
                const isSelected = selectedRole === role;

                return (
                  <button
                    key={role}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleRoleSwitch(role)}
                    className={`relative flex min-h-[88px] flex-col items-start justify-center rounded-[15px] px-7 py-5 text-left transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2454AB] ${
                      isSelected
                        ? 'border-2 border-[#2454AB]/81 bg-[#BCD9FC]/51 shadow-[0_4px_10px_rgba(0,0,0,0.16)]'
                        : 'border-2 border-[#83B1EC]/60 bg-white shadow-[0_4px_10px_rgba(0,0,0,0.1)] hover:border-[#5587CE]'
                    }`}
                  >
                    <span className="text-xs sm:text-[13px] font-extrabold tracking-wider text-[#2454AB]">
                      {cfg.kicker}
                    </span>
                    <span className="mt-1 text-base sm:text-lg font-medium text-[#1E1E1E]">
                      {cfg.label}
                    </span>

                    {isSelected && (
                      <span
                        aria-hidden="true"
                        className="absolute top-5 right-5 h-3.5 w-3.5 rounded-full bg-[#2454AB]"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Login Form matching SVG */}
            <form onSubmit={handleSubmit} noValidate className="mt-9 sm:mt-10 space-y-6">
              {dbError && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{dbError}</span>
                </div>
              )}

              {formError && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-sm font-semibold text-[#434242]"
                >
                  Email Akun Pengurus (@bncc.net)
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailFieldError) setEmailFieldError(null);
                    if (formError) setFormError(null);
                  }}
                  placeholder={roleConfig.emailPlaceholder}
                  aria-invalid={Boolean(emailFieldError)}
                  aria-describedby={emailFieldError ? 'email-error' : undefined}
                  className={`mt-2.5 block h-[55px] w-full rounded-[10px] border bg-white px-4 text-base text-[#1E1E1E] placeholder:text-[#878787] shadow-[0_4px_8px_rgba(0,0,0,0.08)] transition-colors focus:outline-none focus:ring-2 ${
                    emailFieldError
                      ? 'border-red-500 focus:border-red-600 focus:ring-red-200'
                      : 'border-[#5587CE]/29 focus:border-[#2454AB] focus:ring-[#83B1EC]/40'
                  }`}
                />
                {emailFieldError && (
                  <p id="email-error" className="mt-1.5 text-xs font-medium text-red-600">
                    {emailFieldError}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between gap-4">
                  <label
                    htmlFor="login-password"
                    className="block text-sm font-semibold text-[#434242]"
                  >
                    Password
                  </label>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#2454AB]">
                    <Lock className="h-3 w-3" aria-hidden="true" />
                    SSO Internal BNCC
                  </span>
                </div>
                <div className="relative mt-2.5">
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordFieldError) setPasswordFieldError(null);
                      if (formError) setFormError(null);
                    }}
                    placeholder="••••••••••••"
                    aria-invalid={Boolean(passwordFieldError)}
                    aria-describedby={passwordFieldError ? 'password-error' : undefined}
                    className={`block h-[55px] w-full rounded-[10px] border bg-white pr-12 pl-4 text-base text-[#1E1E1E] placeholder:text-[#434242] shadow-[0_4px_8px_rgba(0,0,0,0.08)] transition-colors focus:outline-none focus:ring-2 ${
                      passwordFieldError
                        ? 'border-red-500 focus:border-red-600 focus:ring-red-200'
                        : 'border-[#5587CE]/29 focus:border-[#2454AB] focus:ring-[#83B1EC]/40'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    className="absolute inset-y-0 right-1 flex w-11 items-center justify-center rounded-lg text-[#878787] hover:text-[#2454AB] cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {passwordFieldError && (
                  <p id="password-error" className="mt-1.5 text-xs font-medium text-red-600">
                    {passwordFieldError}
                  </p>
                )}
              </div>

              {/* Submit Button matching SVG */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoadingDb}
                  className="flex h-[64px] w-full items-center justify-center rounded-[15px] bg-[#2454AB] px-6 text-base sm:text-[17px] font-bold text-white shadow-[0_4px_10px_rgba(0,0,0,0.2)] transition-all duration-150 hover:bg-[#1C4796] active:scale-[0.995] disabled:opacity-60 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2454AB]"
                >
                  {isLoadingDb ? 'Memuat Data Pengurus...' : roleConfig.buttonLabel}
                </button>
              </div>

              {/* Clean unboxed prototype quick-fill helper */}
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 pt-1 text-xs text-[#878787]">
                <span>Akun uji prototype:</span>
                <button
                  type="button"
                  onClick={() => handleFillDemoAccount('admin')}
                  className="font-semibold text-[#2454AB] underline-offset-4 hover:underline cursor-pointer"
                >
                  Isi Demo Manager
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => handleFillDemoAccount('member')}
                  className="font-semibold text-[#2454AB] underline-offset-4 hover:underline cursor-pointer"
                >
                  Isi Demo Staff EEO
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
