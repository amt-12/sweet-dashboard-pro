import { useProductActions } from "./home-data";
import donutImage from "../../assets/GE.png";

export default function HeroSection() {
  const { scrollTo } = useProductActions();
  
  return (
    <section id="home" className="relative min-h-screen bg-parchment flex flex-col justify-center overflow-hidden pt-[72px]">
      {/* Watermark */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[52%] font-playfair font-extrabold tracking-widest text-navy/[0.04] whitespace-nowrap select-none pointer-events-none"
        style={{ fontSize: "clamp(8rem, 20vw, 20rem)" }}
      >
        BAKERY
      </div>

      {/* Stamp */}
      <div aria-hidden="true" className="absolute top-[13%] right-[8%] w-28 h-28 animate-spin-slow hidden md:block">
        <svg viewBox="0 0 120 120" className="w-full h-full">
          <defs>
            <path id="sc" d="M 60,60 m -45,0 a 45,45 0 1,1 90,0 a 45,45 0 1,1 -90,0" />
          </defs>
          <text fontSize="11" letterSpacing="3.5" fill="#1A2744" fontFamily="Inter,sans-serif">
            <textPath href="#sc">SWEET BAKE • ARTISAN • EST.1984 •</textPath>
          </text>
          <text x="60" y="57" textAnchor="middle" fill="#1A2744" fontFamily="Playfair Display,serif" fontWeight="700" fontSize="9" letterSpacing="2">SWEET</text>
          <text x="60" y="70" textAnchor="middle" fill="#1A2744" fontFamily="Playfair Display,serif" fontWeight="700" fontSize="9" letterSpacing="2">BAKE</text>
        </svg>
      </div>

      {/* Title row */}
      <div className="relative z-10 w-full max-w-[1300px] mx-auto px-6 md:px-12 py-8">
        <h1 className="flex items-center justify-between w-full gap-4 leading-none m-0">

          {/* Left word */}
          <span
            className="font-playfair font-bold text-navy flex-shrink-0 self-start mt-6 leading-none tracking-tight animate-fade-up"
            style={{ fontSize: "clamp(3.5rem, 9.5vw, 9rem)" }}
          >
            Sweet
          </span>

          {/* Centre images */}
          <div
            className="relative flex-1 flex items-center justify-center"
            style={{ height: "clamp(300px, 44vw, 500px)" }}
            aria-hidden="true"
          >
            {/* Main centre item */}
            <img src={donutImage} alt="Delicious Donuts"
              className="absolute object-contain drop-shadow-2xl animate-float-a z-30 pointer-events-none mix-blend-multiply"
              style={{ width: "clamp(250px,35vw,450px)", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />

            {/* Seed dots */}
            <span className="absolute w-2.5 h-2.5 rounded-full bg-gold/60" style={{ top: "20%", left: "22%" }} />
            <span className="absolute w-1.5 h-1.5 rounded-full bg-gold/60" style={{ top: "65%", left: "15%" }} />
            <span className="absolute w-3   h-3   rounded-full bg-gold/35" style={{ bottom: "25%", right: "28%" }} />
            <span className="absolute w-2   h-2   rounded-full bg-gold/60" style={{ top: "30%", right: "22%" }} />
          </div>

          {/* Right word */}
          <span
            className="font-playfair font-bold text-navy flex-shrink-0 self-end mb-6 leading-none tracking-tight animate-fade-up"
            style={{ fontSize: "clamp(3.5rem, 9.5vw, 9rem)", animationDelay: "0.2s" }}
          >
            Donuts
          </span>
        </h1>
      </div>

      {/* Bottom-left info card */}
      <div className="absolute bottom-[5%] left-[5%] z-20 bg-navy text-white rounded-xl p-4 hidden sm:flex items-center gap-4 max-w-sm shadow-2xl shadow-navy/40 animate-fade-up">
        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
          <img src="/bread.png" alt="Organic bread" className="w-full h-full object-cover brightness-[0.65]" />
          <button
            className="absolute inset-0 flex items-center justify-center bg-white/15 hover:bg-white/28 border-none text-white text-lg cursor-pointer transition-colors"
            aria-label="Play video"
          >▶</button>
        </div>
        <div>
          <h3 className="font-playfair font-bold text-[0.95rem] m-0 mb-1 text-white">Natural Organic Product</h3>
          <p className="text-[0.75rem] text-white/65 m-0 mb-2 leading-relaxed">
            Baked fresh every morning from locally sourced, organic ingredients.
          </p>
          <button
            onClick={() => scrollTo("About")}
            className="bg-transparent border-none text-gold text-[0.7rem] font-bold tracking-widest uppercase cursor-pointer p-0 hover:opacity-75 transition-opacity"
          >
            READ MORE →
          </button>
        </div>
      </div>

      {/* Scroll arrow */}
      <button
        onClick={() => scrollTo("Menu")}
        aria-label="Scroll down"
        className="absolute bottom-[5%] right-[5%] z-20 w-12 h-12 bg-navy text-white rounded-xl text-xl flex items-center justify-center border-none cursor-pointer shadow-xl shadow-navy/30 hover:bg-navy-lt hover:-translate-y-1 transition-all animate-bob"
      >
        ↓
      </button>
    </section>
  );
}
