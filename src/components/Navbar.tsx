import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const navLinks = [
  { label: "HOME",    id: "home" },
  { label: "ABOUT",   id: "about" },
  { label: "MENU",    id: "menu" },
  { label: "PAGES",   id: null, hasDropdown: true },
  { label: "CONTACT", id: "contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [active, setActive]       = useState("HOME");
  const [dropOpen, setDropOpen]   = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scrollTo = (id: string | null, label: string) => {
    if (id) {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
    setActive(label);
    setMenuOpen(false);
    setDropOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-[#F5ECD7] transition-shadow duration-300 ${
        scrolled ? "shadow-md shadow-[#1A2744]/10" : ""
      }`}
    >
      {/* Main bar */}
      <div className="max-w-[1280px] mx-auto flex items-center justify-between h-[72px] px-5 lg:px-10">

        {/* ── Logo ── */}
        <a href="/" className="flex flex-col leading-none no-underline select-none flex-shrink-0">
          <span
            className="font-playfair text-[1.35rem] font-bold tracking-[0.14em] text-[#1A2744]"
            style={{ letterSpacing: "0.14em" }}
          >
            SWEETBAKE
          </span>
          <span className="flex items-center gap-1 mt-[2px]">
            <span className="text-[0.58rem] tracking-[0.22em] text-[#1A2744]/60 uppercase">
              EST.
            </span>
            {/* Small bird / wheat icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1A2744"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3 h-3 opacity-50"
            >
              <path d="M12 3c-1.2 1.6-2 3.6-2 6 0-2.4-.8-4.4-2-6" />
              <path d="M12 9c1.2 1.6 2 3.6 2 6 0-2.4.8-4.4 2-6" />
              <path d="M12 9V21" />
            </svg>
            <span className="text-[0.58rem] tracking-[0.22em] text-[#1A2744]/60 uppercase">
              1984
            </span>
          </span>
        </a>

        {/* ── Centre nav links (desktop) ── */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <div key={link.label} className="relative">
              <button
                onClick={() =>
                  link.hasDropdown
                    ? setDropOpen(!dropOpen)
                    : scrollTo(link.id, link.label)
                }
                className={`
                  text-[0.78rem] font-semibold tracking-[0.13em] uppercase
                  bg-transparent border-none cursor-pointer
                  px-4 py-2.5 flex items-center gap-1
                  transition-colors duration-200
                  ${active === link.label ? "text-[#C9952A]" : "text-[#1A2744]"}
                  hover:text-[#C9952A]
                `}
                style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
              >
                {link.label}
                {link.hasDropdown && (
                  <svg
                    className={`w-3 h-3 transition-transform duration-200 ${dropOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 4.5L6 7.5L9 4.5" />
                  </svg>
                )}
              </button>

              {/* Dropdown for PAGES */}
              {link.hasDropdown && dropOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl shadow-[#1A2744]/15 border border-[#1A2744]/8 py-2 min-w-[160px] z-50">
                  {["Gallery", "Our Team", "FAQ", "Blog"].map((sub) => (
                    <button
                      key={sub}
                      className="w-full text-left px-4 py-2 text-[0.8rem] font-medium text-[#1A2744] hover:bg-[#F5ECD7] hover:text-[#C9952A] bg-transparent border-none cursor-pointer transition-colors"
                      onClick={() => setDropOpen(false)}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* ── Right side: search + CTA (desktop) ── */}
        <div className="hidden lg:flex items-center gap-5 flex-shrink-0">
          {/* Search icon */}
          <button
            className="text-[#1A2744]/60 hover:text-[#1A2744] bg-transparent border-none cursor-pointer p-1 transition-colors"
            aria-label="Search"
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-[#1A2744]/12" />

          {/* Order CTA */}
          <Link
            to="/login"
            className="flex items-center gap-3 no-underline group"
          >
            {/* Phone circle */}
            <span className="w-10 h-10 bg-[#1A2744] rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[#2C3D6B] transition-colors">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1.003 1.003 0 011.01-.24c1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.24.2 2.45.57 3.57.1.31.03.66-.25 1.02l-2.2 2.2z" />
              </svg>
            </span>
            {/* Text */}
            <span className="flex flex-col leading-none">
              <strong className="text-[0.85rem] font-bold text-[#1A2744] tracking-wide">
                Order Now
              </strong>
              <span className="text-[0.7rem] text-[#1A2744]/55 mt-[3px]">
                Call : 191 767 898
              </span>
            </span>
          </Link>
        </div>

        {/* ── Hamburger (mobile) ── */}
        <button
          className="lg:hidden ml-auto flex flex-col gap-[5px] bg-transparent border-none cursor-pointer p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-[2px] bg-[#1A2744] transition-all duration-300 origin-center ${
              menuOpen ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`block w-6 h-[2px] bg-[#1A2744] transition-all duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-[2px] bg-[#1A2744] transition-all duration-300 origin-center ${
              menuOpen ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Thin bottom accent line */}
      <div className="h-[1px] bg-[#1A2744]/8" />

      {/* ── Mobile drawer ── */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white border-t border-[#1A2744]/8 px-6 py-4 flex flex-col gap-1 shadow-lg">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => scrollTo(link.id, link.label)}
              className="text-left text-[#1A2744] font-medium py-3 border-b border-[#1A2744]/8 text-sm bg-transparent border-x-0 border-t-0 cursor-pointer hover:text-[#C9952A] transition-colors"
            >
              {link.label}
            </button>
          ))}
          <Link
            to="/login"
            className="mt-3 self-start flex items-center gap-2 bg-[#1A2744] text-white no-underline px-5 py-2.5 rounded-full text-sm font-semibold"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1.003 1.003 0 011.01-.24c1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.24.2 2.45.57 3.57.1.31.03.66-.25 1.02l-2.2 2.2z" />
            </svg>
            Order Now
          </Link>
        </div>
      </div>
    </header>
  );
}
