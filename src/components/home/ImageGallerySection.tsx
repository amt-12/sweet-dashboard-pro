import { motion, Variants } from "framer-motion";

export default function ImageGallerySection() {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <section className="py-24 px-6 bg-[#fcfcfc]">
      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-6xl mx-auto"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[200px]">
          {/* 1st Column */}
          <motion.div variants={item} className="col-span-1 row-span-2 overflow-hidden rounded-xl">
              <img src="/about-baker.png" alt="Baker dusting flour" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </motion.div>

          <motion.div variants={item} className="col-span-1 row-span-2 overflow-hidden rounded-xl bg-black">
              <img src="/bread.png" alt="Loaf of Bread" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </motion.div>
          
          {/* 2nd Column - Large Span */}
            <motion.div variants={item} className="col-span-1 lg:col-span-1 row-span-1 lg:row-span-2 overflow-hidden rounded-xl">
                <div className="h-full flex flex-col gap-4">
                    <div className="flex-1 overflow-hidden rounded-xl">
                        <img src="/croissant.png" alt="Croissants" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 overflow-hidden rounded-xl">
                        <img src="/hero-bg.png" alt="Bread prep" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                </div>
          </motion.div>


          {/* 3rd Column */}
          <motion.div variants={item} className="col-span-1 row-span-1 overflow-hidden rounded-xl">
                <img src="/about-baker.png" alt="Dark bread" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </motion.div>

            <motion.div variants={item} className="col-span-1 row-span-1 lg:col-span-1 lg:row-span-1 overflow-hidden rounded-xl">
                <img src="/cake.png" alt="Chocolate dipped cake" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </motion.div>
            
        </div>
      </motion.div>
    </section>
  );
}
