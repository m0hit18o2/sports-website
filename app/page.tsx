"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const PHOTOS = [
  "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80",
  "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80",
  "https://images.unsplash.com/photo-1599474924187-334a4ae5149f?w=800&q=80",
  "https://images.unsplash.com/photo-1617083934555-ac7e4f8b0f87?w=800&q=80",
  "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80",
];

export default function LandingPage() {
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % PHOTOS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col" style={{ fontFamily: "'Georgia', serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Montserrat:wght@300;400;500&display=swap');

        .hero-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 300;
          letter-spacing: 0.08em;
        }
        .nav-label {
          font-family: 'Montserrat', sans-serif;
          font-weight: 300;
          letter-spacing: 0.2em;
          font-size: 14px;
        }
        .fade-in {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.9s ease, transform 0.9s ease;
        }
        .fade-in.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .fade-in.delay-1 { transition-delay: 0.15s; }
        .fade-in.delay-2 { transition-delay: 0.3s; }
        .fade-in.delay-3 { transition-delay: 0.45s; }
        .fade-in.delay-4 { transition-delay: 0.6s; }

        .google-btn {
          font-family: 'Montserrat', sans-serif;
          font-weight: 400;
          letter-spacing: 0.15em;
          font-size: 12px;
          border: 1px solid rgba(255,255,255,0.25);
          background: transparent;
          color: white;
          padding: 14px 40px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .google-btn:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.6);
        }

        .photo-slide {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          opacity: 0;
          transition: opacity 1.2s ease;
        }
        .photo-slide.active {
          opacity: 1;
        }

        .dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(255,255,255,0.3);
          cursor: pointer;
          transition: background 0.3s;
        }
        .dot.active {
          background: white;
        }

        .divider {
          width: 1px;
          height: 48px;
          background: rgba(255,255,255,0.2);
          margin: 0 auto;
        }
      `}</style>

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6">
        <span className="nav-label tracking-widest text-white/60">SPORTS VENUE</span>
        <div className="flex gap-8">
          <Link href="/scores" className="nav-label text-white/50 hover:text-white transition-colors">
            SCORES
          </Link>
          <Link href="/booking" className="nav-label text-white/50 hover:text-white transition-colors">
            BOOK
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">

        <div className={`fade-in ${loaded ? "visible" : ""}`}>
          <p className="nav-label text-white/40 mb-6 tracking-[0.3em]">WELCOME TO</p>
        </div>

        <div className={`fade-in delay-1 ${loaded ? "visible" : ""}`}>
          <h1 className="hero-title text-5xl md:text-7xl text-white mb-2">
            IIMC Sports
          </h1>
        </div>

        <div className={`fade-in delay-2 ${loaded ? "visible" : ""}`}>
          <p className="nav-label text-white/40 mt-4 mb-6 tracking-widest">
            BOOK · PLAY · COMPETE
          </p>
        </div>

        <div className={`fade-in delay-3 ${loaded ? "visible" : ""}`}>
          <button className="google-btn mx-auto mb-8">
            <svg width="16" height="14" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            CONTINUE WITH GOOGLE
          </button>
        </div>
      </main>

      {/* Photo Gallery */}
      <div className={`fade-in delay-4 ${loaded ? "visible" : ""}`}>
        <div className="mt-1 mb-3 text-center">
          <p className="nav-label text-white/40 tracking-[0.5em]">GALLERY</p>
        </div>
        <div className="relative h-56 md:h-72 overflow-hidden">
          {PHOTOS.map((photo, i) => (
            <div
              key={i}
              className={`photo-slide ${i === current ? "active" : ""}`}
              style={{ backgroundImage: `url(${photo})` }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-3 py-4 bg-black">
          {PHOTOS.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === current ? "active" : ""}`}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-5 bg-black">
        <p className="nav-label text-white/25">
          Made with ❤️ by Janani & Team
        </p>
      </footer>

    </div>
  );
}