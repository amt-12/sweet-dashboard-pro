import { products, useProductActions } from "./home-data";
import { Star } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { Link } from "react-router-dom"; // Import Link for navigation

export default function MenuSection() {
  const { handleAddToCart, scrollTo } = useProductActions();

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <section id="menu" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-[0.8rem] font-bold tracking-[0.2em] uppercase text-gold mb-3">Our Menu</p>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-bread-dark mb-4">Made to Delight</h2>
          <p className="text-[#7A5C4F] max-w-xl mx-auto text-base leading-relaxed">
            From flaky morning croissants to celebration cakes — something for every craving.
          </p>
        </motion.div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-5"
        >
          {products.slice(0, 8).map((p) => (
            <motion.article key={p.id}
              variants={item}
              className="group relative h-[320px] rounded-2xl overflow-hidden shadow-xl cursor-pointer"
            >
              {/* Wrap the product card content with Link */}
              <Link to={`/product/${p.id}`} className="block h-full w-full"> 
                {/* Full Background Image */}
                <div className="absolute inset-0 w-full h-full">
                  <img src={p.img} alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
                
                {/* Gradient Overlay: Dark Bottom to Transparent Top */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f0a] via-[#3E2723]/60 to-transparent opacity-90" />

                {/* Content Section */}
                <div className="absolute inset-0 p-4 flex flex-col justify-end text-white z-10">
                  <div className="transform transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <div className="flex justify-between items-end mb-1.5">
                      <div className="flex flex-col gap-0.5">
                        {p.badge && (
                          <span className="w-fit px-2 py-0.5 rounded-full bg-[#D4A373] text-[#2C1810] text-[0.6rem] font-bold uppercase tracking-wider mb-0.5">
                            {p.badge}
                          </span>
                        )}
                        <h3 className="font-playfair text-lg font-bold leading-tight group-hover:text-[#D4A373] transition-colors">
                          {p.name}
                        </h3>
                      </div>
                      <span className="bg-white/10 px-2 py-0.5 rounded-full text-sm font-semibold backdrop-blur-sm border border-white/10">
                        ${p.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-[#FFD700] text-[#FFD700]" />
                        <span className="text-white text-xs font-bold">4.8</span>
                      </div>
                      <span className="text-white/60 text-[0.65rem] font-medium uppercase tracking-widest">
                        {p.category}
                      </span>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(p);
                      }}
                      className="w-full bg-white text-[#2C1810] font-bold py-2.5 text-sm rounded-full hover:bg-[#D4A373] hover:text-[#2C1810] transition-colors shadow-lg active:scale-95 duration-200"
                    >
                      Add to Order
                    </button>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button
            onClick={() => scrollTo("Contact")}
            className="border-2 border-bread-brown text-bread-brown bg-transparent px-8 py-3.5 rounded-full font-semibold hover:bg-bread-brown hover:text-white transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
          >
            See Full Menu
          </button>
        </motion.div>
      </div>
    </section>
  );
}
