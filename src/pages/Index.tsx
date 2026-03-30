import StatsCards from "@/components/StatsCards";
import RevenueChart from "@/components/RevenueChart";
import DonutChart from "@/components/DonutChart";
import PopularProducts from "@/components/PopularProducts";
import RecentOrders from "@/components/RecentOrders";
import LowStockAlert from "@/components/LowStockAlert";
import bakeryIllustrations from "@/assets/bakery-illustrations.png";
import { Sparkles, ShoppingBag, Heart, Coffee } from "lucide-react";

const Index = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-1000 font-lora text-chocolate pb-10">
      {/* Premium Welcome Banner */}
      <div className="relative rounded-[2.5rem] bg-gradient-to-br from-chocolate to-[#2c1d12] p-10 shadow-bakery-lg overflow-hidden group">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-strawberry/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 group-hover:bg-strawberry/20 transition-all duration-700 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cream/5 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/4 animate-bounce duration-[10s]"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-strawberry/20 rounded-full backdrop-blur-md border border-strawberry/10 text-cream text-[10px] font-bold uppercase tracking-[0.2em] animate-in slide-in-from-left duration-500">
              <Sparkles size={14} className="text-strawberry-light" />
              The Artisan's Sanctuary
            </div>
            <h2 className="font-dancing text-5xl md:text-6xl font-bold text-cream mb-2 leading-tight">
              Welcome, Head Baker! 🍰
            </h2>
            <p className="text-cream/70 max-w-xl text-lg font-medium leading-relaxed italic">
              "Every crumb tells a story of passion and precision. Today, you have{" "}
              <span className="text-strawberry font-bold shadow-strawberry/20 drop-shadow-sm">12 masterpiece orders</span> and{" "}
              <span className="text-strawberry font-bold shadow-strawberry/20 drop-shadow-sm">3 custom visions</span>{" "}
              waiting for your touch."
            </p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
               <div className="flex items-center gap-2 text-cream/50 text-xs font-bold uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                 <ShoppingBag size={14} />
                 Fresh Orders
               </div>
               <div className="flex items-center gap-2 text-cream/50 text-xs font-bold uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                 <Heart size={14} />
                 Guest Love
               </div>
               <div className="flex items-center gap-2 text-cream/50 text-xs font-bold uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                 <Coffee size={14} />
                 Cafe Status
               </div>
            </div>
          </div>
          
          <div className="relative group/img">
            <div className="absolute inset-0 bg-strawberry/20 rounded-full blur-3xl opacity-0 group-hover/img:opacity-100 transition-opacity"></div>
            <img
              src={bakeryIllustrations}
              alt="Bakery items"
              className="relative h-48 md:h-64 object-contain drop-shadow-2xl filter brightness-110 contrast-110 transform rotate-2 group-hover:rotate-0 group-hover:scale-110 transition-all duration-700 hidden md:block"
            />
          </div>
        </div>
      </div>

      {/* Stats Section with extra spacing */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 ml-2">
           <div className="w-1.5 h-6 bg-strawberry rounded-full"></div>
           <h3 className="text-xs font-bold text-chocolate/40 uppercase tracking-[0.3em]">Momentum Overview</h3>
        </div>
        <StatsCards />
      </div>

      {/* Charts row: Premium layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white/60 backdrop-blur-md rounded-[2.5rem] p-4 shadow-bakery border border-chocolate/5">
           <RevenueChart />
        </div>
        <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-4 shadow-bakery border border-chocolate/5">
           <DonutChart />
        </div>
      </div>

      {/* Products and alerts: Refined grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 shadow-bakery border border-chocolate/5 ring-1 ring-white/20">
          <PopularProducts />
        </div>
        <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 shadow-bakery border border-chocolate/5 ring-1 ring-white/20">
          <RecentOrders />
        </div>
        <div className="bg-strawberry/5 backdrop-blur-md rounded-[2.5rem] p-8 shadow-bakery border border-strawberry/10 ring-1 ring-white/20 flex flex-col h-full transform hover:scale-[1.02] transition-transform">
          <LowStockAlert />
        </div>
      </div>
    </div>
  );
};

export default Index;
