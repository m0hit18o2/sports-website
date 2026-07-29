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
        <div
          className="absolute -left-40 -top-16 w-[50rem] h-[50rem] rounded-full border pointer-events-none hidden sm:block"
          style={{ borderColor: `${BRAND_ORANGE}70`, borderWidth: 1.5 }}
        />
        {/* Bottom-left paint-smear accent: hand-crafted jagged clip-path,
            bleeding off the left edge. */}
        <div
          className="absolute -left-16 bottom-0 w-[34rem] h-48 pointer-events-none"
          style={{
            backgroundColor: BRAND_ORANGE,
            clipPath:
              "polygon(0% 45%, 6% 30%, 12% 50%, 18% 25%, 25% 48%, 32% 20%, 40% 42%, 48% 15%, 56% 38%, 64% 10%, 72% 32%, 80% 5%, 88% 28%, 100% 0%, 100% 100%, 0% 100%)",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 md:px-10 pt-8 md:pt-16 pb-10 grid md:grid-cols-2 gap-10 items-center">
          <div
            className="h-64 sm:h-80 md:h-[28rem] bg-contain bg-no-repeat bg-center"
            style={{ backgroundImage: "url('/sports-council-logo.jpeg')" }}
          />

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
