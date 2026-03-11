
import { Link } from "react-router-dom";
import { navLinks, useProductActions } from "./home-data";

export default function FooterSection() {
  const { scrollTo } = useProductActions();

  return (
    <footer className="bg-bread-dark text-white/70 pt-16 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
        <div className="md:col-span-1 flex flex-col gap-3">
          <div>
            <div className="font-playfair text-xl font-bold tracking-widest text-white">SWEETBAKE</div>
            <div className="text-[0.6rem] tracking-widest text-gold uppercase">EST. ✦ 1984</div>
          </div>
          <p className="text-sm text-white/50 leading-relaxed max-w-[220px]">Handcrafted with love since 1984.</p>
        </div>
        {[
          { title: "Quick Links", items: navLinks, isBtn: true },
          { title: "Categories", items: ["Breads", "Pastries", "Cakes", "Cookies", "Seasonal"], isBtn: false },
          { title: "Follow Us", items: ["Instagram", "Facebook", "Pinterest", "YouTube"], isBtn: false },
        ].map((col) => (
          <div key={col.title} className="flex flex-col gap-2">
            <h4 className="text-[0.85rem] font-bold tracking-widest uppercase text-white/90 mb-1">{col.title}</h4>
            {col.items.map((i) =>
              col.isBtn ? (
                <button key={i} onClick={() => scrollTo(i)}
                  className="text-[0.875rem] text-white/55 bg-transparent border-none cursor-pointer text-left p-0 hover:text-white/90 transition-colors font-normal">
                  {i}
                </button>
              ) : (
                <span key={i} className="text-[0.875rem] text-white/55 hover:text-white/90 transition-colors cursor-pointer">{i}</span>
              )
            )}
          </div>
        ))}
      </div>
      <div className="max-w-6xl mx-auto py-5 flex items-center justify-between text-[0.82rem] text-white/35">
        <p className="m-0">© 2024 SweetBake. All rights reserved.</p>
        <Link to="/login" className="text-white/35 no-underline hover:text-gold transition-colors text-[0.8rem]">Admin Panel</Link>
      </div>
    </footer>
  );
}
