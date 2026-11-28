import {useState} from 'react';
import {ChevronRight, Menu, X} from 'lucide-react';

interface NavbarProps {
  onScrollToLogin: () => void;
  onScrollToFeatures: () => void;
  isAuthenticated: boolean;
}

export function Navbar({
  onScrollToLogin,
  onScrollToFeatures,
  isAuthenticated,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileAction = (action: () => void) => {
    setMobileMenuOpen(false);
    action();
  };

  return (
    <header className="relative z-30 w-full">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-6 sm:px-10 md:px-14 lg:px-[69px] lg:pt-12">
        {/* Brand Lockup matching HomePage SVG */}
        <div className="flex items-center gap-3 sm:gap-5 min-w-0">
          <a
            href="#top"
            className="text-2xl sm:text-[32px] font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white rounded"
          >
            Gather.in
          </a>
          <span className="inline-flex items-center justify-center rounded-[9px] border-2 border-white px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-bold tracking-wide text-white whitespace-nowrap shrink-0">
            BNCC EEO
          </span>
        </div>

        {/* Desktop Split CTA Button matching new HomePage SVG */}
        <div className="hidden md:flex items-center shrink-0">
          <button
            type="button"
            onClick={onScrollToLogin}
            className="group inline-flex min-h-[58px] items-stretch gap-[3px] rounded-[10px] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white cursor-pointer"
            aria-label={isAuthenticated ? 'Buka status sesi akun' : 'Mulai dari sini menuju halaman login'}
          >
            <span className="flex items-center justify-center rounded-l-[10px] border border-white/20 bg-[#2C63AB]/85 px-6 py-3.5 text-xl font-extrabold tracking-tight text-white transition-colors group-hover:bg-[#2C63AB]">
              G.In
            </span>
            <span className="flex items-center gap-2.5 rounded-r-[10px] border border-white/20 bg-[#2C63AB]/85 px-6 py-3.5 text-sm font-semibold tracking-normal text-white whitespace-nowrap transition-colors group-hover:bg-[#2C63AB]">
              {isAuthenticated ? 'Status Akun' : 'Mulai Dari Sini'}
              <ChevronRight
                className="h-4 w-4 stroke-[2] transition-transform duration-150 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </button>
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center gap-2 md:hidden shrink-0">
          <button
            type="button"
            onClick={onScrollToLogin}
            className="inline-flex min-h-[44px] items-center gap-1 rounded-[8px] border border-white/20 bg-[#2C63AB]/85 px-3.5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#2C63AB] whitespace-nowrap"
          >
            <span>{isAuthenticated ? 'Akun' : 'Mulai'}</span>
            <ChevronRight className="h-3.5 w-3.5 stroke-[2]" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-[8px] border border-white/30 bg-[#2C63AB]/70 text-white transition-colors hover:bg-[#2C63AB]"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          id="mobile-nav-drawer"
          aria-label="Navigasi Mobile"
          className="mx-5 mb-4 rounded-2xl border border-white/25 bg-[#1C4D9C]/95 p-3 shadow-xl backdrop-blur-sm md:hidden"
        >
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => handleMobileAction(onScrollToFeatures)}
              className="flex min-h-[44px] w-full items-center justify-between rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-white hover:bg-white/10"
            >
              <span>Fitur Utama EEO</span>
              <ChevronRight className="h-4 w-4 text-[#BCD9FC]" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => handleMobileAction(onScrollToLogin)}
              className="flex min-h-[44px] w-full items-center justify-between rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-white hover:bg-white/10"
            >
              <span>{isAuthenticated ? 'Panel Sesi Login' : 'Pilih Role & Login'}</span>
              <ChevronRight className="h-4 w-4 text-[#BCD9FC]" aria-hidden="true" />
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
