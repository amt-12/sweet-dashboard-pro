
import { Star, Truck, Leaf } from "lucide-react";
import bakeryIllustrations from "@/assets/bakery-illustrations.png";

export default function FeatureStrip() {
  return (
    <section className="bg-[#fdfbf7] px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">
                <img src={bakeryIllustrations} alt="Baker Icon" className="w-10 h-10 object-contain opacity-80" />
              </div>
              <h3 className="font-playfair text-xl font-bold text-navy mb-3">Professional Baker</h3>
              <p className="text-gray-600 text-sm leading-relaxed px-4">
                Our team of expert bakers brings years of experience and passion to every loaf.
              </p>
          </div>

          <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">
                <Star className="w-8 h-8 text-gold" strokeWidth={1.5} />
              </div>
              <h3 className="font-playfair text-xl font-bold text-navy mb-3">Unique Pastry</h3>
              <p className="text-gray-600 text-sm leading-relaxed px-4">
                Discover our signature pastries, crafted with creativity and the finest ingredients.
              </p>
          </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">
                <Truck className="w-8 h-8 text-gold" strokeWidth={1.5} />
              </div>
              <h3 className="font-playfair text-xl font-bold text-navy mb-3">Door Delivery</h3>
              <p className="text-gray-600 text-sm leading-relaxed px-4">
                Freshness delivered straight to your doorstep, ensuring you start your day right.
              </p>
          </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">
                <Leaf className="w-8 h-8 text-gold" strokeWidth={1.5} />
              </div>
              <h3 className="font-playfair text-xl font-bold text-navy mb-3">Healthy Food</h3>
              <p className="text-gray-600 text-sm leading-relaxed px-4">
                Wholesome, natural ingredients for a healthy and delicious bakery experience.
              </p>
          </div>
      </div>
    </section>
  );
}
