import HomeNav, { BRAND_ORANGE } from "./HomeNav";

const anton = { fontFamily: "'Anton', sans-serif" };
const montserrat = { fontFamily: "'Montserrat', sans-serif" };

// Headline copy is a placeholder — expected to change. Edit these two lines
// (line 2 renders in brand orange) rather than hunting through the JSX below.
const HEADLINE_LINE_1 = "ONE SPIRIT.";
const HEADLINE_LINE_2 = "ALL SECTIONS.";

const ANNOUNCEMENTS = [
  { day: "24", month: "JUL", title: "Opening Ceremony", body: "Join us for the grand opening ceremony at Multicourt from 5:30 PM onwards." },
  { day: "24-26", month: "JUL", title: "Section Wars", body: "The battlefield is set! Let the games begin. May the best section win." },
  { day: "26", month: "JUL", title: "Final Day", body: "Finals, closing ceremony and much more. Don't miss out!" },
];

export default function LandingClient() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <HomeNav />

      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Ring: real photographed arc (top-right quarter, from ring-arc.png)
            paired with an SVG-drawn arc in the same orange for the rest of
            the circle, since the source image only contained one segment. */}
        {/* <div className="absolute -left-32 -top-10 w-[42rem] h-[42rem] hidden sm:block pointer-events-none">
          <div
            className="absolute inset-0 bg-contain bg-no-repeat bg-right-top"
            style={{ backgroundImage: "url('/ring-arc.png')" }}
          />
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400" fill="none"> */}
            {/* Left half of the same circle (cx=200 cy=200 r=190), plain
                stroke in BRAND_ORANGE to match the image's line color. */}
            {/* <path d="M 200 10 A 190 190 0 0 0 200 390" stroke={BRAND_ORANGE} strokeWidth="1.5" />
          </svg>
        </div> */}

        {/* Bottom-left paint-smear accent: real brush-stroke image (cropped
            from the same source as ring-arc.png), bleeding off the left edge. */}
        <div
          className="absolute right-223 top-66 w-[42rem] h-[25rem] bg-contain bg-no-repeat bg-left-bottom pointer-events-none"
          style={{ backgroundImage: "url('/proper_accent_transparent.png')" }}
        />

        {/* Tiger logo: bleeds off the true left edge of the page, sized and
            positioned independently of the centered text column below so
            its visual center lands roughly under the navbar logo. */}
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span aria-hidden style={{ color: BRAND_ORANGE }}>📣</span>
                  <h2 className="text-sm font-bold tracking-[0.15em]" style={montserrat}>ANNOUNCEMENTS</h2>
                </div>
                <span className="text-[11px] font-semibold tracking-wider" style={{ ...montserrat, color: BRAND_ORANGE }}>
                  VIEW ALL ›
                </span>
              </div>
              <div className="flex flex-col divide-y divide-white/10">
                {ANNOUNCEMENTS.map((a, i) => (
                  <div key={i} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="shrink-0 w-14 text-center border border-white/15 rounded-lg py-1.5">
                      <p className="text-lg font-bold leading-none">{a.day}</p>
                      <p className="text-[10px] font-semibold tracking-wider mt-1" style={{ color: BRAND_ORANGE }}>{a.month}</p>
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
