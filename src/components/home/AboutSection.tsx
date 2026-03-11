
import { useProductActions } from "./home-data";

export default function AboutSection() {
  const { scrollTo } = useProductActions();

  return (
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
  );
}
