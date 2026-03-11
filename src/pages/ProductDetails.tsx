import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { products, useProductActions } from "../components/home/home-data";
import Navbar from "@/components/Navbar";
import CartSheet from "@/components/CartSheet";
import { ArrowLeft, Star, ShoppingBag, Truck, ShieldCheck, Heart, Share2, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { handleAddToCart } = useProductActions();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0); 

  // Find the product based on ID
  const product = products.find((p) => p.id === Number(id));

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7]">
        <h2 className="text-4xl font-playfair font-bold text-[#2C1810] mb-4">Product Not Found</h2>
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-[#D4A373] hover:text-[#B08968] transition-colors"
        >
          <ArrowLeft size={20} /> Back to Menu
        </button>
      </div>
    );
  }

  // Mock multiple images for gallery effect
  const productImages = [
    product.img,
    // Add same image for demo purposes, in real app these would be different views
    product.img, 
    product.img,
  ];

  const handleQuantityChange = (type: "inc" | "dec") => {
    if (type === "dec" && quantity > 1) setQuantity(prev => prev - 1);
    if (type === "inc" && quantity < 10) setQuantity(prev => prev + 1);
  };

  const onAddToCart = () => {
    // In a real app we'd pass quantity too
    for(let i=0; i<quantity; i++) {
        handleAddToCart(product);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-inter">
      <Navbar />
      <CartSheet />
      
      <div className="pt-28 pb-16 px-6 max-w-7xl mx-auto">
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-[#7A5C4F] hover:text-[#2C1810] mb-8 transition-colors text-sm font-medium uppercase tracking-wider group"
        >
          <div className="p-2 bg-white rounded-full shadow-sm group-hover:shadow-md transition-all">
            <ArrowLeft size={16} /> 
          </div>
          Back to Menu
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
          
          {/* Left: Image Gallery Section */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative aspect-[4/5] md:aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl bg-white p-12 group border-[3px] border-white ring-1 ring-black/5"
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#ff000000] to-[#00000005]" />
                <AnimatePresence mode="wait">
                    <motion.img 
                        key={activeImage}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        src={productImages[activeImage]} 
                        alt={product.name} 
                        className="w-full h-full object-contain drop-shadow-2xl z-10 relative"
                    />
                </AnimatePresence>
                
                {product.badge && (
                <span className="absolute top-8 left-8 bg-[#2C1810] text-[#D4A373] px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-xl z-20">
                    {product.badge}
                </span>
                )}

                <div className="absolute top-8 right-8 z-20 flex flex-col gap-3">
                    <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform text-red-500">
                        <Heart size={20} />
                    </button>
                    <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform text-[#2C1810]">
                        <Share2 size={20} />
                    </button>
                </div>
            </motion.div>

            {/* Thumbnail Navigation */}
            <div className="flex justify-center gap-4">
                {productImages.map((img, idx) => (
                    <button 
                        key={idx}
                        onClick={() => setActiveImage(idx)}
                        className={`relative w-24 h-24 rounded-2xl bg-white p-2 border-2 transition-all ${activeImage === idx ? 'border-[#D4A373] shadow-lg scale-105' : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'}`}
                    >
                        <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-contain" />
                    </button>
                ))}
            </div>
          </div>


          {/* Right: Details Section */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col h-full pt-4"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-[#F2EBE3] rounded-full text-[#D4A373] font-bold text-xs tracking-widest uppercase">{product.category}</span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={`${i < 4 ? "fill-[#FFD700] text-[#FFD700]" : "text-gray-300"}`} />
                ))}
                <span className="text-[#2C1810] text-sm font-bold ml-2 underline cursor-pointer">128 reviews</span>
              </div>
            </div>

            <h1 className="font-playfair text-5xl md:text-7xl font-bold text-[#2C1810] mb-6 leading-[0.9]">
              {product.name}
            </h1>

            <p className="text-[#7A5C4F] text-lg leading-relaxed mb-8 max-w-lg">
              Hand-crafted with the finest organic ingredients, baked fresh daily. Experience the perfect balance of texture and flavor in every bite.
            </p>

            <div className="flex items-end gap-6 mb-10">
              <span className="text-5xl font-playfair font-bold text-[#2C1810]">
                ${(product.price * quantity).toFixed(2)}
              </span>
              {quantity > 1 && (
                 <span className="text-lg text-[#7A5C4F] font-medium mb-2">
                    (${product.price.toFixed(2)} each)
                 </span>
              )}
            </div>
            
            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-6 mb-12">
                <div className="flex items-center bg-white rounded-full p-2 shadow-sm border border-gray-100 w-fit">
                    <button 
                        onClick={() => handleQuantityChange("dec")}
                        className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-[#2C1810]"
                        disabled={quantity <= 1}
                    >
                        <Minus size={20} />
                    </button>
                    <span className="w-12 text-center text-xl font-bold font-playfair">{quantity}</span>
                    <button 
                        onClick={() => handleQuantityChange("inc")}
                        className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-[#2C1810]"
                        disabled={quantity >= 10}
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <Button 
                    onClick={onAddToCart}
                    className="flex-1 h-16 bg-[#2C1810] text-white font-bold text-lg rounded-full hover:bg-[#D4A373] hover:text-[#2C1810] transition-all shadow-xl hover:shadow-2xl active:scale-95 flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                    <span className="relative z-10 flex items-center gap-3">
                        <ShoppingBag size={22} />
                        Add to Cart • ${(product.price * quantity).toFixed(2)}
                    </span>
                    <div className="absolute inset-0 bg-[#D4A373] translate-y-[101%] group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                </Button>
            </div>

            {/* Accordion Info */}
            <div className="mb-12">
                <Accordion type="single" collapsible className="w-full" defaultValue="desc">
                    <AccordionItem value="desc" className="border-b border-[#E5DACE]">
                        <AccordionTrigger className="text-[#2C1810] font-playfair font-bold text-lg hover:no-underline hover:text-[#D4A373]">Description</AccordionTrigger>
                        <AccordionContent className="text-[#7A5C4F] leading-relaxed text-base pt-2">
                            Our {product.name.toLowerCase()} is made using traditional methods and slow fermentation processes to ensure superior flavor and texture. We use only organic flour, natural leavening, and premium ingredients sourced from local farmers.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="ingredients" className="border-b border-[#E5DACE]">
                        <AccordionTrigger className="text-[#2C1810] font-playfair font-bold text-lg hover:no-underline hover:text-[#D4A373]">Ingredients & Allergens</AccordionTrigger>
                        <AccordionContent className="text-[#7A5C4F] leading-relaxed text-base pt-2">
                            Organic wheat flour, water, sea salt, natural yeast. Contains: Wheat, Gluten. May contain traces of nuts and dairy due to shared equipment.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="shipping" className="border-b border-[#E5DACE]">
                        <AccordionTrigger className="text-[#2C1810] font-playfair font-bold text-lg hover:no-underline hover:text-[#D4A373]">Delivery & Shipping</AccordionTrigger>
                        <AccordionContent className="text-[#7A5C4F] leading-relaxed text-base pt-2">
                            We deliver daily within the city limits. Orders placed before 10 AM are eligible for same-day delivery. Nationwide shipping is available for select items with 2-day express handling.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-6 p-6 bg-[#fff8e7] rounded-2xl border border-[#f5e6d3]">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl text-[#D4A373] shadow-sm">
                  <Truck size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-[#2C1810] font-playfair">Free Delivery</h4>
                  <p className="text-xs text-[#7A5C4F] mt-1">On orders over $50</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl text-[#D4A373] shadow-sm">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-[#2C1810] font-playfair">Fresh Guarantee</h4>
                  <p className="text-xs text-[#7A5C4F] mt-1">Baked fresh daily</p>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
