
export default function ContactSection() {
  return (
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
  );
}
