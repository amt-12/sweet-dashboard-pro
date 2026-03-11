import { products, useProductActions } from "./home-data";
import { Star } from "lucide-react";

export default function MenuSection() {
  const { handleAddToCart, scrollTo } = useProductActions();

  return (
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
          {products.slice(0, 6).map((p) => (
            <article key={p.id}
              className="group relative h-[450px] rounded-3xl overflow-hidden shadow-xl"
            >
              {/* Full Background Image */}
              <div className="absolute inset-0 w-full h-full">
                <img src={p.img} alt={p.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
              
              {/* Gradient Overlay: Dark Bottom to Transparent Top */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f0a] via-[#3E2723]/60 to-transparent opacity-90" />

              {/* Content Section */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white z-10">
                <div className="transform transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex flex-col gap-1">
                      {p.badge && (
                        <span className="w-fit px-2 py-0.5 rounded-full bg-[#D4A373] text-[#2C1810] text-[0.65rem] font-bold uppercase tracking-wider mb-1">
                          {p.badge}
                        </span>
                      )}
                      <h3 className="font-playfair text-2xl font-bold leading-tight group-hover:text-[#D4A373] transition-colors">
                        {p.name}
                      </h3>
                    </div>
                    <span className="bg-white/10 px-3 py-1 rounded-full text-md font-semibold backdrop-blur-sm border border-white/10">
                      ${p.price.toFixed(2)}
                    </span>
                  </div>

                  <p className="text-white/80 text-sm mb-4 line-clamp-2 opacity-0 h-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-300 delay-75">
                    Experience the taste of our premium {p.category.toLowerCase()}, baked fresh every morning with organic ingredients.
                  </p>

                  <div className="flex items-center justify-between mb-5">
                     <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-[#FFD700] text-[#FFD700]" />
                      <span className="text-white text-sm font-bold">4.8</span>
                    </div>
                    <span className="text-white/60 text-xs font-medium uppercase tracking-widest">
                       {p.category}
                    </span>
                  </div>

                  <button 
                    onClick={() => handleAddToCart(p)}
                    className="w-full bg-white text-[#2C1810] font-bold py-3.5 rounded-full hover:bg-[#D4A373] hover:text-[#2C1810] transition-colors shadow-lg active:scale-95 duration-200"
                  >
                    Add to Order
                  </button>
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
  );
}
