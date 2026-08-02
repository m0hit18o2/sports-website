import { BRAND_ORANGE } from "./HomeNav";

const anton = { fontFamily: "'Anton', sans-serif" };
const montserrat = { fontFamily: "'Montserrat', sans-serif" };

// Headline copy is a placeholder — expected to change. Edit these two lines
// (line 2 renders in brand orange) rather than hunting through the JSX below.
const HEADLINE_LINE_1 = "JOKA LEAVES";
const HEADLINE_LINE_2 = "NO ONE BEHIND";

type Announcement = {
  id: number;
  day_label: string;
  month_label: string;
  title: string;
  body: string;
};

export default function LandingClient({ announcements }: { announcements: Announcement[] }) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Hero */}
      <div className="relative overflow-hidden">

        <div
          className="absolute right-223 top-66 w-[42rem] h-[25rem] bg-contain bg-no-repeat bg-left-bottom pointer-events-none"
          style={{ backgroundImage: "url('/proper_accent_transparent.png')" }}
        />


        <div
          className="hidden md:block absolute -left-17 top-0 w-[48rem] h-[36rem] bg-contain bg-no-repeat bg-left pointer-events-none"
          style={{ backgroundImage: "url('/tiger-transparent.png')" }}
        />

        <div className="relative max-w-7xl mx-auto px-6 md:px-10 pt-8 md:pt-16 pb-10 grid md:grid-cols-2 gap-10 items-center">
          {/* Mobile/tablet: logo shown inline (contained, not bled) since the
              full-bleed absolute version above is desktop-only. */}
          <div
            className="md:hidden h-64 sm:h-80 bg-contain bg-no-repeat bg-center"
            style={{ backgroundImage: "url('/tiger-transparent.png')" }}
          />
          {/* Desktop spacer: reserves the left column so text doesn't
              overlap the absolutely-positioned bled logo. */}
          <div className="hidden md:block" aria-hidden />

          <div>
            <p className="text-[11px] font-semibold tracking-[0.3em] mb-4" style={{ ...montserrat, color: BRAND_ORANGE }}>
              IIM CALCUTTA SPORTS
            </p>
            <h1 className="text-5xl md:text-7xl leading-[0.95] mb-8" style={anton}>
              <span className="block text-white">{HEADLINE_LINE_1}</span>
              <span className="block" style={{ color: BRAND_ORANGE }}>{HEADLINE_LINE_2}</span>
            </h1>

            {/* Announcements */}
            <div className="bg-zinc-950 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span aria-hidden style={{ color: BRAND_ORANGE }}>📣</span>
                <h2 className="text-sm font-bold tracking-[0.15em]" style={montserrat}>ANNOUNCEMENTS</h2>
              </div>
              <div className="flex flex-col divide-y divide-white/10">
                {announcements.map((a) => (
                  <div key={a.id} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="shrink-0 w-14 text-center border border-white/15 rounded-lg py-1.5">
                      <p className="text-lg font-bold leading-none">{a.day_label}</p>
                      <p className="text-[10px] font-semibold tracking-wider mt-1" style={{ color: BRAND_ORANGE }}>{a.month_label}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: BRAND_ORANGE }} />
                        {a.title}
                      </p>
                      <p className="text-xs text-white/50 mt-1">{a.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-10" style={{ backgroundColor: `${BRAND_ORANGE}55` }} />
          <span aria-hidden style={{ color: BRAND_ORANGE }}>🏆</span>
          <p className="text-[11px] font-light tracking-[0.3em] text-white/60" style={montserrat}>
            {HEADLINE_LINE_1} <span style={{ color: BRAND_ORANGE }}>{HEADLINE_LINE_2}</span>
          </p>
          <span className="h-px w-10" style={{ backgroundColor: `${BRAND_ORANGE}55` }} />
        </div>
      </footer>
    </div>
  );
}
