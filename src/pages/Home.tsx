import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

/* ── data ── */
const products = [
  { id: 1, name: "Classic Croissant", category: "Pastries", price: "$3.50", img: "/croissant.png", badge: "Bestseller" },
  { id: 2, name: "Strawberry Dream Cake", category: "Cakes", price: "$28.00", img: "/cake.png", badge: "New" },
  { id: 3, name: "Rustic Sourdough", category: "Breads", price: "$9.00", img: "/bread.png", badge: "Artisan" },
];

const testimonials = [
  { name: "Aisha Patel", role: "Regular Customer", text: "Every morning starts with their croissants. Perfectly flaky, buttery, absolutely divine. Nothing else comes close!", stars: 5 },
  { name: "Marco Rossi", role: "Event Planner", text: "Ordered a custom cake for our corporate event. The team was professional, the cake was spectacular. 10/10.", stars: 5 },
  { name: "Sarah Thompson", role: "Food Blogger", text: "The sourdough here is the real deal — tangy, crusty crust, airy crumb. The best artisan bread in the city.", stars: 5 },
];

const navLinks = ["Home", "Menu", "About", "Testimonials", "Contact"];

export default function Home() {
  const scrollTo = (id: string) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="font-inter text-navy overflow-x-hidden">

      {/* ── Navbar ── */}
      <Navbar />

      {/* ════════════════════════════════════════
          HERO  – Panbread style
      ════════════════════════════════════════ */}
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
              className="font-playfair font-bold text-navy flex-shrink-0 self-start mt-6 leading-none tracking-tight"
              style={{ fontSize: "clamp(3.5rem, 9.5vw, 9rem)" }}
            >
              Special
            </span>

            {/* Centre images */}
            <div
              className="relative flex-1 flex items-center justify-center"
              style={{ height: "clamp(300px, 44vw, 500px)" }}
              aria-hidden="true"
            >
              {/* Main centre item */}
              <img src="/croissant.png" alt=""
                className="absolute object-contain drop-shadow-2xl animate-float-a z-30 pointer-events-none"
                style={{ width: "clamp(170px,25vw,270px)", top: "50%", left: "50%" }} />
              {/* Top-left small item */}
              <img src="/bread.png" alt=""
                className="absolute object-contain drop-shadow-xl animate-float-b z-20 pointer-events-none"
                style={{ width: "clamp(95px,14vw,155px)", top: "8%", left: "8%" }} />
              {/* Bottom-right small item */}
              <img src="/cake.png" alt=""
                className="absolute object-contain drop-shadow-xl animate-float-c z-20 pointer-events-none"
                style={{ width: "clamp(85px,11vw,135px)", bottom: "8%", right: "6%" }} />

              {/* Seed dots */}
              <span className="absolute w-2.5 h-2.5 rounded-full bg-gold/60" style={{ top: "20%", left: "22%" }} />
              <span className="absolute w-1.5 h-1.5 rounded-full bg-gold/60" style={{ top: "65%", left: "15%" }} />
              <span className="absolute w-3   h-3   rounded-full bg-gold/35" style={{ bottom: "25%", right: "28%" }} />
              <span className="absolute w-2   h-2   rounded-full bg-gold/60" style={{ top: "30%", right: "22%" }} />
            </div>

            {/* Right word */}
            <span
              className="font-playfair font-bold text-navy flex-shrink-0 self-end mb-6 leading-none tracking-tight"
              style={{ fontSize: "clamp(3.5rem, 9.5vw, 9rem)" }}
            >
              Bread
            </span>
          </h1>
        </div>

        {/* Bottom-left info card */}
        <div className="absolute bottom-[5%] left-[5%] z-20 bg-navy text-white rounded-xl p-4 flex items-center gap-4 max-w-sm shadow-2xl shadow-navy/40 animate-fade-up md:flex hidden sm:flex">
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

      {/* ════════════════════════════════════════
          FEATURE STRIP
      ════════════════════════════════════════ */}
      <section className="grid grid-cols-2 md:grid-cols-4 bg-bread-dark">
        {[
          { icon: "🌾", title: "100% Natural", desc: "No preservatives, no shortcuts." },
          { icon: "🔥", title: "Baked Fresh Daily", desc: "Out of the oven every morning at 5 AM." },
          { icon: "🚚", title: "Same-Day Delivery", desc: "Order by noon, enjoy by evening." },
          { icon: "🎂", title: "Custom Orders", desc: "Bespoke cakes for every occasion." },
        ].map((f) => (
          <div key={f.title}
            className="p-8 text-center border-r border-white/10 last:border-r-0 hover:bg-white/[0.04] transition-colors">
            <span className="text-4xl block mb-3">{f.icon}</span>
            <h3 className="font-playfair text-[#FDF6EC] text-base mb-2">{f.title}</h3>
            <p className="text-[0.875rem] text-white/55 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* ════════════════════════════════════════
          MENU / PRODUCTS
      ════════════════════════════════════════ */}
      <section id="menu" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[0.8rem] font-bold tracking-[0.2em] uppercase text-gold mb-3">Our Menu</p>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-bread-dark mb-4">Made to Delight</h2>
            <p className="text-[#7A5C4F] max-w-xl mx-auto text-base leading-relaxed">
              From flaky morning croissants to celebration cakes — something for every craving.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((p) => (
              <article key={p.id}
                className="bg-white rounded-2xl overflow-hidden shadow-md border border-bread-brown/10 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group">
                <div className="relative h-60 overflow-hidden">
                  <img src={p.img} alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  {p.badge && (
                    <span className="absolute top-4 left-4 bg-gold text-white text-[0.72rem] font-bold tracking-wider uppercase px-3 py-1 rounded-full">
                      {p.badge}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-bread-dark/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="bg-bread-brown text-white border-none px-4 py-2 rounded-full text-sm font-semibold cursor-pointer hover:bg-bread-dark transition-colors">
                      Add to Cart
                    </button>
                  </div>
                </div>
                <div className="p-5">
                  <span className="text-[0.75rem] font-bold tracking-widest uppercase text-gold">{p.category}</span>
                  <h3 className="font-playfair text-xl font-semibold text-bread-dark my-2">{p.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-bread-brown">{p.price}</span>
                    <span className="text-gold text-sm tracking-tighter">{"★★★★★"}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => scrollTo("Contact")}
              className="border-2 border-bread-brown text-bread-brown bg-transparent px-8 py-3.5 rounded-full font-semibold hover:bg-bread-brown hover:text-white transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              See Full Menu
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          ABOUT
      ════════════════════════════════════════ */}
      <section id="about" className="max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <img src="/about-baker.png" alt="Our baker at work"
            className="w-full h-[500px] object-cover rounded-2xl shadow-2xl" />
          <div className="absolute -bottom-5 -right-5 w-28 h-28 bg-gold text-white rounded-full flex flex-col items-center justify-center shadow-xl shadow-gold/40 text-center">
            <span className="font-playfair text-3xl font-bold leading-none">40</span>
            <span className="text-[0.65rem] font-semibold leading-tight mt-1">Years of<br />Passion</span>
          </div>
        </div>

        <div>
          <p className="text-[0.8rem] font-bold tracking-[0.2em] uppercase text-gold mb-3">Our Story</p>
          <h2 className="font-playfair text-4xl font-bold text-bread-dark mb-5 leading-tight">
            Baked with Heart,<br />Served with Soul
          </h2>
          <p className="text-[#7A5C4F] leading-[1.8] mb-4">
            What started as a tiny kitchen experiment in 1984 has grown into a beloved neighbourhood institution. We believe great baking is a conversation between tradition and creativity.
          </p>
          <p className="text-[#7A5C4F] leading-[1.8] mb-6">
            Every loaf, pastry and cake that leaves our ovens carries the care of our entire team. We never compromise on quality, and we never will.
          </p>
          <ul className="list-none p-0 mb-8 flex flex-col gap-2.5">
            {["Locally sourced flour & dairy", "No artificial flavours or colours", "Hand-shaped, slow-fermented doughs", "Family recipes passed down for generations"].map((i) => (
              <li key={i} className="flex gap-3 items-center text-[0.95rem] text-navy">
                <span className="text-gold font-bold text-base">✓</span> {i}
              </li>
            ))}
          </ul>
          <button
            onClick={() => scrollTo("Contact")}
            className="bg-bread-brown text-white border-none px-8 py-3.5 rounded-full font-semibold cursor-pointer hover:bg-bread-dark hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
          >
            Contact Us
          </button>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════ */}
      <section id="testimonials" className="py-24 px-6 bg-[#FDF6EC]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[0.8rem] font-bold tracking-[0.2em] uppercase text-gold mb-3">Testimonials</p>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-bread-dark">What Our Customers Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {testimonials.map((t) => (
              <blockquote key={t.name}
                className="bg-white rounded-2xl p-8 shadow-md border border-bread-brown/10 m-0 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                <div className="text-gold text-base tracking-wide mb-4">{"★".repeat(t.stars)}</div>
                <p className="text-[#7A5C4F] italic leading-[1.75] mb-6 text-[0.975rem]">"{t.text}"</p>
                <footer className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-bread-brown to-gold text-white font-bold text-lg flex items-center justify-center flex-shrink-0">
                    {t.name[0]}
                  </div>
                  <div>
                    <strong className="block text-[0.925rem] font-bold text-bread-dark">{t.name}</strong>
                    <span className="block text-[0.78rem] text-[#7A5C4F] mt-0.5">{t.role}</span>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════════ */}
      <section className="bg-gradient-to-br from-bread-dark to-bread-brown py-20 px-6 text-center relative overflow-hidden">
        <div aria-hidden="true" className="absolute -top-8 right-[5%] text-[12rem] opacity-[0.04] pointer-events-none">🧁</div>
        <div className="max-w-2xl mx-auto relative">
          <h2 className="font-playfair text-3xl md:text-5xl text-white font-bold mb-4 leading-tight">
            Ready to Order Something Delicious?
          </h2>
          <p className="text-white/70 text-lg mb-8">Visit us in-store or call ahead. Custom orders welcome!</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => scrollTo("Contact")}
              className="bg-white text-bread-dark border-2 border-white px-8 py-3.5 rounded-full font-semibold hover:bg-[#FDF6EC] hover:-translate-y-0.5 hover:shadow-lg transition-all cursor-pointer">
              Get in Touch
            </button>
            <button onClick={() => scrollTo("Menu")}
              className="bg-transparent text-white border-2 border-white/50 px-8 py-3.5 rounded-full font-semibold hover:bg-white/15 hover:-translate-y-0.5 transition-all cursor-pointer">
              View Menu
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CONTACT
      ════════════════════════════════════════ */}
      <section id="contact" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[0.8rem] font-bold tracking-[0.2em] uppercase text-gold mb-3">Contact Us</p>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-bread-dark">We'd Love to Hear from You</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 items-start">
            {/* Info */}
            <div className="md:col-span-2 flex flex-col gap-7">
              {[
                { icon: "📍", label: "Address", val: "12 Baker Street, Mumbai, MH 400001" },
                { icon: "📞", label: "Phone", val: "+91 98765 43210" },
                { icon: "✉️", label: "Email", val: "hello@sweetbake.in" },
                { icon: "🕐", label: "Hours", val: "Mon – Sat: 7 AM – 8 PM\nSun: 8 AM – 5 PM" },
              ].map((c) => (
                <div key={c.label} className="flex gap-4 items-start">
                  <span className="w-11 h-11 bg-[#FDF6EC] rounded-xl flex items-center justify-center text-xl flex-shrink-0">{c.icon}</span>
                  <div>
                    <strong className="block text-[0.78rem] font-bold tracking-widest uppercase text-gold mb-1">{c.label}</strong>
                    <p className="text-navy text-[0.95rem] m-0 leading-relaxed whitespace-pre-line">{c.val}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Form */}
            <form
              className="md:col-span-3 bg-[#FDF6EC] rounded-2xl p-8 flex flex-col gap-5"
              onSubmit={(e) => { e.preventDefault(); alert("Message sent! We'll get back to you soon. 🧁"); }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="cf-name" className="text-[0.85rem] font-semibold text-bread-dark">Your Name</label>
                  <input id="cf-name" type="text" placeholder="Jane Doe" required
                    className="border border-bread-brown/15 rounded-xl px-4 py-3 text-[0.95rem] bg-white text-navy outline-none focus:border-bread-brown focus:ring-2 focus:ring-bread-brown/10 transition-all" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="cf-email" className="text-[0.85rem] font-semibold text-bread-dark">Email Address</label>
                  <input id="cf-email" type="email" placeholder="jane@example.com" required
                    className="border border-bread-brown/15 rounded-xl px-4 py-3 text-[0.95rem] bg-white text-navy outline-none focus:border-bread-brown focus:ring-2 focus:ring-bread-brown/10 transition-all" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="cf-subject" className="text-[0.85rem] font-semibold text-bread-dark">Subject</label>
                <input id="cf-subject" type="text" placeholder="Custom cake order…"
                  className="border border-bread-brown/15 rounded-xl px-4 py-3 text-[0.95rem] bg-white text-navy outline-none focus:border-bread-brown focus:ring-2 focus:ring-bread-brown/10 transition-all" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="cf-message" className="text-[0.85rem] font-semibold text-bread-dark">Message</label>
                <textarea id="cf-message" rows={5} placeholder="Tell us what you need…" required
                  className="border border-bread-brown/15 rounded-xl px-4 py-3 text-[0.95rem] bg-white text-navy outline-none focus:border-bread-brown focus:ring-2 focus:ring-bread-brown/10 transition-all resize-y" />
              </div>
              <button type="submit"
                className="w-full bg-bread-brown text-white border-none py-4 rounded-full font-semibold text-base cursor-pointer hover:bg-bread-dark hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
                Send Message 🧁
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════ */}
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
    </div>
  );
}
