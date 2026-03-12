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

  const [selectedFlavor, setSelectedFlavor] = useState("Truffle Chocolate Cake");
  const [selectedWeightIndex, setSelectedWeightIndex] = useState(0);

  const flavors = [
    "Truffle Chocolate Cake", "Coffee Cake 2", "Butterscotch", 
    "Butterscotch Hazelnut", "Cherry Black Forest", "Cherry Topped Black Forest Cake",
    "Chocolate & Cherry Black Forest Cake", "Chocolate Truffle", 
    "Elegant Yummy Vanilla Cake", "Red Velvet"
  ];
  
  const weightOptions = [
    { label: "500 g", pack: "Pack of 1", multiplier: 1 },
    { label: "1 kg", pack: "Pack of 1", multiplier: 1.8 },
    { label: "2 kg", pack: "Pack of 1", multiplier: 3.5 },
    { label: "3 kg", pack: "Pack of 1", multiplier: 5.2 },
    { label: "4 kg", pack: "Pack of 1", multiplier: 6.8 },
  ];

  // Find the product based on ID
  const product = products.find((p) => p.id === Number(id));

  const currentPrice = product ? product.price * weightOptions[selectedWeightIndex].multiplier : 0;

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
    if (!product) return;
    
    const variantProduct = {
      ...product,
      name: `${product.name} (${selectedFlavor}, ${weightOptions[selectedWeightIndex].label})`,
      price: currentPrice
    };

    // In a real app we'd pass quantity too
    for(let i=0; i<quantity; i++) {
        handleAddToCart(variantProduct);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-inter">
      <Navbar />
      <CartSheet />
      
      <div className="pt-28 pb-16 px-6 w-full mx-auto">
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
                ${(currentPrice * quantity).toFixed(2)}
              </span>
              {quantity > 1 && (
                 <span className="text-lg text-[#7A5C4F] font-medium mb-2">
                    (${currentPrice.toFixed(2)} each)
                 </span>
              )}
            </div>

            {/* Flavor Selection */}
            <div className="mb-8">
                <p className="text-[#2C1810] font-bold mb-3">Flavour Name: <span className="font-playfair">{selectedFlavor}</span></p>
                <div className="flex flex-wrap gap-2">
                    {flavors.map((flavor) => (
                        <button
                            key={flavor}
                            onClick={() => setSelectedFlavor(flavor)}
                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                                selectedFlavor === flavor
                                ? "border-[#2C1810] bg-[#2C1810] text-white shadow-md"
                                : "border-gray-200 bg-white text-[#2C1810] hover:border-[#D4A373]"
                            }`}
                        >
                            {flavor}
                        </button>
                    ))}
                </div>
            </div>

            {/* Size Selection */}
            <div className="mb-10">
                <p className="text-[#2C1810] font-bold mb-3">Size: <span className="font-playfair">{weightOptions[selectedWeightIndex].label}</span> ({weightOptions[selectedWeightIndex].pack})</p>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                    {weightOptions.map((option, index) => {
                         const price = product.price * option.multiplier;
                         const originalPrice = price * 1.5; 
                         return (
                            <button
                                key={index}
                                onClick={() => setSelectedWeightIndex(index)}
                                className={`text-left p-3 rounded-xl border-2 transition-all ${
                                    selectedWeightIndex === index
                                    ? "border-[#2C1810] bg-[#F2EBE3]"
                                    : "border-gray-100 bg-white hover:border-[#D4A373]"
                                }`}
                            >
                                <div className="font-bold text-[#2C1810] text-sm mb-1">{option.label}</div>
                                <div className="text-xs text-[#7A5C4F] mb-2">{option.pack}</div>
                                <div className="font-bold text-[#2C1810]">${price.toFixed(2)}</div>
                                <div className="text-xs text-gray-400 line-through">${originalPrice.toFixed(2)}</div>
                            </button>
                         );
                    })}
                </div>
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
                        Add to Cart • ${(currentPrice * quantity).toFixed(2)}
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
                             Indulge in the rich, velvety goodness of our Tempting Truffle Chocolate Cake. Perfect for Birthdays, Anniversaries, Valentine's Day, and Mother's Day. This 0.5kg delight is crafted with premium cocoa and smooth chocolate ganache, offering a melt-in-your-mouth experience. Baked fresh daily with love!
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="ingredients" className="border-b border-[#E5DACE]">
                        <AccordionTrigger className="text-[#2C1810] font-playfair font-bold text-lg hover:no-underline hover:text-[#D4A373]">Ingredients & Allergens</AccordionTrigger>
                        <AccordionContent className="text-[#7A5C4F] leading-relaxed text-base pt-2">
                            Organic wheat flour, dark chocolate, fresh cream, butter, sugar, cocoa powder, baking powder. Contains: Wheat, Dairy, Soy. May contain traces of nuts.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="shipping" className="border-b border-[#E5DACE]">
                        <AccordionTrigger className="text-[#2C1810] font-playfair font-bold text-lg hover:no-underline hover:text-[#D4A373]">Delivery & Shipping</AccordionTrigger>
                        <AccordionContent className="text-[#7A5C4F] leading-relaxed text-base pt-2">
                            Same Day Delivery available! Free delivery on orders above ₹500. Orders placed before 4 PM are eligible for same-day dispatch. Secure and contactless delivery.
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="offers" className="border-b border-[#E5DACE]">
                        <AccordionTrigger className="text-[#2C1810] font-playfair font-bold text-lg hover:no-underline hover:text-[#D4A373]">Offers</AccordionTrigger>
                        <AccordionContent className="text-[#7A5C4F] leading-relaxed text-base pt-2">
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Bank Offer:</strong> Upto ₹15.00 cashback with Amazon Pay ICICI Bank Credit Cards.</li>
                                <li><strong>Partner Offers:</strong> Buy 2 get 3% off, Buy 3 get 4% off.</li>
                                <li><strong>Price:</strong> ₹529.00 (69% off MRP ₹1,699).</li>
                            </ul>
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
