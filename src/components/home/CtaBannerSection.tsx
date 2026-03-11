
import { useProductActions } from "./home-data";

export default function CtaBannerSection() {
  const { scrollTo } = useProductActions();

  return (
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
  );
}
