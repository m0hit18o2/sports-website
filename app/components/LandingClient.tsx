"use client";
import { useState, useEffect } from "react";

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Montserrat:wght@300;400;500&display=swap');
        .hero-title { font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 300; letter-spacing: 0.08em; }
        .nav-label { font-family: 'Montserrat', sans-serif; font-weight: 300; letter-spacing: 0.2em; font-size: 11px; }
        .fade-in { opacity: 0; transform: translateY(24px); transition: opacity 0.9s ease, transform 0.9s ease; }
        .fade-in.visible { opacity: 1; transform: translateY(0); }
        .fade-in.delay-1 { transition-delay: 0.15s; }
        .fade-in.delay-2 { transition-delay: 0.3s; }
        .photo-slide { position: absolute; inset: 0; background-size: cover; background-position: center; opacity: 0; transition: opacity 1.2s ease; }
        .photo-slide.active { opacity: 1; }
        .dot { width: 4px; height: 4px; border-radius: 50%; background: rgba(255,255,255,0.3); cursor: pointer; transition: background 0.3s; }
        .dot.active { background: white; }
      `}</style>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className={`fade-in ${loaded ? "visible" : ""}`}>
          <p className="nav-label text-white/40 mb-6 tracking-[0.3em]">WELCOME TO</p>
        </div>
        <div className={`fade-in delay-1 ${loaded ? "visible" : ""}`}>
          <h1 className="hero-title text-5xl md:text-7xl text-white mb-2">IIMC Sports</h1>
        </div>
        <div className={`fade-in delay-2 ${loaded ? "visible" : ""}`}>
          <p className="nav-label text-white/40 mt-4 tracking-widest">Home of Joka Tribe</p>
        </div>
      </main>

      {/* Gallery strip */}
      {photos.length > 0 && (
        <div>
          <div className="mt-4 mb-3 text-center">
            <p className="nav-label text-white/40 tracking-[0.3em]">GALLERY</p>
          </div>
          <div className="relative h-56 md:h-96 overflow-hidden">
            {photos.map((photo, i) => (
              <div
                key={i}
                className={`photo-slide ${i === current ? "active" : ""}`}
                style={{ backgroundImage: `url(${photo})` }}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />
          </div>
          <div className="flex justify-center gap-3 py-4 bg-black">
            {photos.map((_, i) => (
              <button key={i} className={`dot ${i === current ? "active" : ""}`} onClick={() => setCurrent(i)} />
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center py-5 bg-black">
        <p className="nav-label text-white/25">MADE & MAINTINED WITH ❤️ BY Janani & Team</p>
      </footer>
    </div>
  );
}