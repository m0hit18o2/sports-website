"use client";
import { useState, useEffect } from "react";

const montserrat = { fontFamily: "'Montserrat', sans-serif" };
const cormorant = { fontFamily: "'Cormorant Garamond', Georgia, serif" };

export default function LandingClient({ photos }: { photos: string[] }) {
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
    if (photos.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % photos.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [photos]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col pt-16">
      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className={`transition-all duration-[900ms] ease-in-out ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <p className="text-[11px] font-light tracking-[0.3em] text-white/40 mb-6" style={montserrat}>WELCOME TO</p>
        </div>
        <div className={`transition-all duration-[900ms] delay-[150ms] ease-in-out ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h1 className="font-light tracking-[0.08em] text-5xl md:text-7xl text-white mb-2" style={cormorant}>IIMC Sports</h1>
        </div>
        <div className={`transition-all duration-[900ms] delay-[300ms] ease-in-out ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <p className="text-[11px] font-light tracking-widest text-white/40 mt-4" style={montserrat}>Home of Joka Tribe</p>
        </div>
      </main>

      {/* Gallery strip */}
      {photos.length > 0 && (
        <div>
          <div className="mt-4 mb-3 text-center">
            <p className="text-[11px] font-light tracking-[0.3em] text-white/40" style={montserrat}>GALLERY</p>
          </div>
          <div className="relative h-56 md:h-96 overflow-hidden">
            {photos.map((photo, i) => (
              <div
                key={i}
                className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[1200ms] ${i === current ? "opacity-100" : "opacity-0"}`}
                style={{ backgroundImage: `url(${photo})` }}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />
          </div>
          <div className="flex justify-center gap-3 py-4 bg-black">
            {photos.map((_, i) => (
              <button
                key={i}
                className={`w-1 h-1 rounded-full cursor-pointer transition-colors duration-300 ${i === current ? "bg-white" : "bg-white/30"}`}
                onClick={() => setCurrent(i)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      {/* <footer className="text-center py-5 bg-black">
        <p className="text-[11px] font-light tracking-[0.2em] text-white/25" style={montserrat}>DEVELOPED BY MOHIT</p>
      </footer> */}
    </div>
  );
}
