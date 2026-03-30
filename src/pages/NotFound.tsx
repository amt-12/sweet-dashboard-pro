import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { MoveLeft, Sparkles, Star } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5ECD7] text-center px-6 relative overflow-hidden font-lora">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-strawberry/5 rounded-full -mr-48 -mt-48 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-chocolate/5 rounded-full -ml-24 -mb-24 blur-3xl" />
      
      <div className="relative z-10 space-y-12 max-w-2xl">
          <div className="relative inline-block">
              <h1 className="text-[12rem] font-bold font-dancing text-chocolate leading-none transform -rotate-3 select-none">
                404
              </h1>
              <div className="absolute -top-4 -right-10 text-strawberry animate-pulse">
                <Sparkles size={64} />
              </div>
              <div className="absolute -bottom-4 -left-10 text-chocolate/20">
                <Star size={48} />
              </div>
          </div>

          <div className="space-y-6">
              <h2 className="text-4xl font-bold font-playfair text-chocolate italic">A Crumbled Path</h2>
              <p className="text-xl font-medium text-chocolate-light leading-relaxed max-w-lg mx-auto italic border-t border-chocolate/5 pt-8">
                The chapter you seek has crumbled away into the archives. Let us lead you back to more flavorful realms.
              </p>
          </div>

          <div className="pt-8">
              <Link
                to="/"
                className="inline-flex items-center gap-4 px-12 py-5 rounded-full bg-chocolate text-[#FAF6E6] font-bold uppercase tracking-[0.2em] shadow-bakery hover:shadow-bakery-lg hover:bg-strawberry transition-all active:scale-95 group"
              >
                <MoveLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" /> 
                Return to Showroom
              </Link>
          </div>
          
          <div className="flex items-center justify-center gap-2 pt-10 text-chocolate/10">
              <div className="w-2 h-2 rounded-full bg-current" />
              <div className="w-2 h-2 rounded-full bg-current" />
              <div className="w-2 h-2 rounded-full bg-current" />
          </div>
      </div>
    </div>
  );
};

export default NotFound;
