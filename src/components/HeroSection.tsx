import {Navbar} from './Navbar';

interface HeroSectionProps {
  onScrollToLogin: () => void;
  onScrollToFeatures: () => void;
  isAuthenticated: boolean;
}

const FEATURE_CARDS = [
  {
    title: 'Auto D+3 & D+7',
    description: 'Reminder merah otomatis jika proposal belum di follow up',
  },
  {
    title: '2 Role Akun',
    description: 'Dashboard khusus Manager dan Staff EEO',
  },
  {
    title: 'Auto MoU',
    description: 'Tarik otomatis nama PT, CP, grade & benefit ke template',
  },
] as const;

export function HeroSection({
  onScrollToLogin,
  onScrollToFeatures,
  isAuthenticated,
}: HeroSectionProps) {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-[#2454AB] text-white"
    >
      {/* Decorative ambient circles matching SVG coordinates */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-16 h-[320px] w-[320px] sm:h-[360px] sm:w-[360px] rounded-full bg-[#1C62B7]/70"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 h-[320px] w-[320px] sm:h-[360px] sm:w-[360px] rounded-full bg-[#1C62B7]/70"
      />

      <Navbar
        onScrollToLogin={onScrollToLogin}
        onScrollToFeatures={onScrollToFeatures}
        isAuthenticated={isAuthenticated}
      />

      <div className="relative z-10 mx-auto max-w-[1440px] px-5 pt-6 pb-20 sm:px-10 sm:pt-10 sm:pb-24 md:px-14 lg:px-[69px] lg:pt-10 lg:pb-32">
        {/* Translucent System Banner */}
        <div className="inline-flex max-w-full items-center rounded-full border border-white/17 bg-[#5587CE]/27 px-5 py-2.5 sm:px-7 sm:py-3 shadow-[0_4px_4px_rgba(0,0,0,0.2)]">
          <p className="text-xs sm:text-[15px] font-medium leading-snug text-white">
            Sistem Tracking Proposal, Reminder D+3/D+7 &amp; MoU Otomatis
          </p>
        </div>

        {/* Hero Headline */}
        <h1 className="mt-8 sm:mt-11 max-w-[1040px] text-[30px] sm:text-[42px] lg:text-[50px] font-extrabold leading-[1.16] tracking-tight text-white [text-wrap:balance]">
          Kelola Pipeline Sponsorship per Event{' '}
          <br className="hidden lg:inline" />
          Tanpa Proposal Terlewat
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-5 sm:mt-6 max-w-[740px] text-[15px] sm:text-[18px] leading-[1.6] text-white/95 font-normal">
          Dirancang khusus untuk alur kerja EEO BNCC: pengingat follow-up otomatis,
          transparansi grade &amp; checklist benefit untuk seluruh anggota, serta kontrol
          penuh hasil pitching &amp; MoU bagi Manager EEO.
        </p>

        {/* Horizontal Divider matching SVG */}
        <hr className="mt-9 sm:mt-11 border-0 border-t border-white/33" />

        {/* 3 Feature Cards */}
        <div
          id="fitur-utama"
          className="mt-8 sm:mt-9 grid grid-cols-1 gap-5 md:grid-cols-3 lg:gap-7"
        >
          {FEATURE_CARDS.map((card) => (
            <div
              key={card.title}
              className="rounded-[25px] border border-white/23 bg-[#2C63AB]/79 px-6 py-6 sm:px-8 sm:py-7"
            >
              <h2 className="text-lg sm:text-[21px] font-bold text-[#FDE68A]">
                {card.title}
              </h2>
              <p className="mt-2.5 text-sm sm:text-[15px] leading-relaxed text-white/95">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Smooth White Organic Wave Transition matching SVG */}
      <div className="relative z-10 -mt-10 sm:-mt-16 w-full overflow-hidden leading-none">
        <svg
          viewBox="0 0 1440 110"
          preserveAspectRatio="none"
          className="block h-[56px] sm:h-[88px] lg:h-[108px] w-full"
          aria-hidden="true"
        >
          <path
            d="M911 26.5C1209.61 27.009 1440 84 1440 84V110H0V10C0 10 187.684 54.293 391 68C594.316 81.707 695.485 26.133 911 26.5Z"
            fill="#FFFFFF"
          />
        </svg>
      </div>
    </section>
  );
}
