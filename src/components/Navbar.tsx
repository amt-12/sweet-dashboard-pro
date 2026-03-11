import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Hook for correct navigation
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { ShoppingBag, ChevronDown } from "lucide-react";
import CartSheet from "./CartSheet"; // Assuming CartSheet is in the same folder

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
  const navigate = useNavigate();
  const location = useLocation();
  
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scrollTo = (id: string | null, label: string) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        if (id) {
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      if (id) {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }
    }
    setActive(label);
    setMenuOpen(false);
    setDropOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-[#F5ECD7] border-b border-[#D4A373]/30 transition-shadow  duration-300 font-hepta ${
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
            <span className="h-[1px] w-8 bg-[#D4A373]"></span>
            <span className="text-[0.65rem] tracking-[0.2em] text-[#8D6E63] font-medium uppercase">Est. 1984</span>
            <span className="h-[1px] w-8 bg-[#D4A373]"></span>
          </span>
        </a>

        {/* ── Desktop Menu ── */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => {
            if (link.hasDropdown) {
              return (
                <div 
                  key={link.label}
                  className="relative group"
                  onMouseEnter={() => setDropOpen(true)}
                  onMouseLeave={() => setDropOpen(false)}
                >
                  <button 
                    className={`flex items-center gap-1 text-[0.8rem] font-bold tracking-[0.15em] transition-colors duration-300 ${
                      active === link.label ? "text-[#D4A373]" : "text-[#1A2744] hover:text-[#D4A373]"
                    }`}
                  >
                    {link.label} <ChevronDown size={14} />
                  </button>
                  
                  {/* Dropdown */}
                  <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-4 transition-all duration-300 ${
                    dropOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
                  }`}>
                    <div className="bg-white shadow-xl rounded-lg overflow-hidden min-w-[160px] py-2 border border-[#8D6E63]/10">
                      {["Our Story", "Team", "Blog", "Gallery"].map(item => (
                        <a 
                          key={item} 
                          href="#" 
                          className="block px-4 py-2 text-sm text-[#5D4037] hover:bg-[#F5ECD7] hover:text-[#3E2723] transition-colors"
                        >
                          {item}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <button
                key={link.label}
                onClick={() => scrollTo(link.id, link.label)}
                className={`text-[0.8rem] font-bold tracking-[0.15em] transition-colors duration-300 relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#D4A373] after:transition-all after:duration-300 hover:after:w-full ${
                  active === link.label ? "text-[#D4A373] after:w-full" : "text-[#1A2744] hover:text-[#D4A373]"
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* ── Actions (Cart & Button) ── */}
        <div className="hidden lg:flex items-center gap-6">
          <CartSheet />
          
          <Link to="/customize-order" className="bg-[#3E2723] text-[#F5ECD7] border-none px-6 py-2.5 rounded-full text-xs font-bold tracking-widest hover:bg-[#5D4037] transition-all transform hover:-translate-y-0.5 shadow-lg shadow-[#3E2723]/20 no-underline">
            CUSTOMIZE ORDER
          </Link>
        </div>

        {/* ── Mobile Trigger ── */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden flex flex-col gap-[6px] w-8 h-8 justify-center z-50 focus:outline-none"
        >
          <span className={`w-full h-[2px] bg-[#1A2744] transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`w-3/4 h-[2px] bg-[#1A2744] ml-auto transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`w-full h-[2px] bg-[#1A2744] transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* ── Mobile Menu Overlay ── */}
      <div className={`fixed inset-0 bg-[#F5ECD7] z-40 flex flex-col items-center justify-center transition-all duration-500 ${
        menuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
      }`}>
        <nav className="flex flex-col items-center gap-8 text-center">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => scrollTo(link.id, link.label)}
              className="font-playfair text-3xl font-bold text-[#3E2723] hover:text-[#D4A373] transition-colors"
            >
              {link.label}
            </button>
          ))}
          <div className="mt-8 flex flex-col items-center gap-6">
             <div className="relative">
                <ShoppingBag size={32} className="text-[#3E2723]" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#D4A373] text-white text-xs w-6 h-6 flex items-center justify-center rounded-full font-bold shadow-sm border-2 border-[#F5ECD7]">
                    {cartItemCount}
                  </span>
                )}
             </div>
             <Link to="/customize-order" onClick={() => setMenuOpen(false)} className="bg-[#3E2723] text-[#F5ECD7] px-8 py-3 rounded-full text-sm font-bold tracking-widest no-underline">
                CUSTOMIZE ORDER
             </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
