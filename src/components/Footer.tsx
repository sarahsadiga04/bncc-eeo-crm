import {ArrowUp} from 'lucide-react';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  return (
    <footer className="bg-[#2454AB] text-white">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-5 py-16 sm:flex-row sm:px-10 sm:py-20 md:px-14 lg:px-[69px]">
        <div className="text-center sm:text-left">
          <p className="text-lg font-extrabold tracking-tight">Gather.in</p>
          <p className="mt-1 text-xs sm:text-sm text-white/80">
            External Event Organizer · Bina Nusantara Computer Club
          </p>
        </div>

        <button
          type="button"
          onClick={scrollToTop}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-[10px] border border-white/25 bg-[#2C63AB]/70 px-4 py-2 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-[#2C63AB] cursor-pointer"
        >
          <span>Kembali ke Atas</span>
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </footer>
  );
}
