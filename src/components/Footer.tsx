import {ArrowUp} from 'lucide-react';
import {motion} from 'motion/react';
import {EASE_OUT_EXPO} from '../utils/motion';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  return (
    <footer className="relative overflow-hidden bg-[#2454AB] text-white">
      {/* Smooth White Organic Wave Transition matching new HomePage SVG */}
      <div className="relative z-10 w-full overflow-hidden leading-none">
        <svg
          viewBox="0 1835 1440 105"
          preserveAspectRatio="none"
          className="block -mt-px h-[58px] sm:h-[90px] lg:h-[110px] w-full"
          aria-hidden="true"
        >
          <path
            d="M954.022 1919.3C1289.74 1918.69 1575.2 1838.71 1575.2 1838.71L1691 1665L-213 1693.06V1939C-213 1939 -1.98677 1886.12 226.601 1869.75C455.188 1853.39 711.718 1919.74 954.022 1919.3Z"
            fill="#FFFFFF"
          />
        </svg>
      </div>

      <motion.div
        initial={{opacity: 0, y: 14}}
        whileInView={{opacity: 1, y: 0}}
        viewport={{once: true, amount: 0.2}}
        transition={{duration: 0.4, ease: EASE_OUT_EXPO}}
        className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-6 px-5 pt-10 pb-14 sm:flex-row sm:px-10 sm:pt-14 sm:pb-20 md:px-14 lg:px-[69px] lg:pt-16 lg:pb-24"
      >
        <div className="text-center sm:text-left">
          <p className="text-xl sm:text-[22px] font-extrabold tracking-tight">Gather.in</p>
          <p className="mt-1.5 text-xs sm:text-sm text-white/85">
            External Event Organizer Bina Nusantara Computer Club
          </p>
        </div>

        <button
          type="button"
          onClick={scrollToTop}
          className="inline-flex min-h-[48px] sm:min-h-[58px] items-center justify-center gap-3 rounded-[10px] border border-white/20 bg-[#2C63AB]/85 px-6 sm:px-7 py-3 text-sm sm:text-[15px] font-semibold text-white transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#2C63AB] active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white cursor-pointer"
        >
          <span>Kembali Ke Atas</span>
          <ArrowUp className="h-4 w-4 stroke-[2]" aria-hidden="true" />
        </button>
      </motion.div>
    </footer>
  );
}
