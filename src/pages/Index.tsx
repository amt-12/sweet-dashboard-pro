import StatsCards from "@/components/StatsCards";
import RevenueChart from "@/components/RevenueChart";
import DonutChart from "@/components/DonutChart";
import PopularProducts from "@/components/PopularProducts";
import RecentOrders from "@/components/RecentOrders";
import LowStockAlert from "@/components/LowStockAlert";
import bakeryIllustrations from "@/assets/bakery-illustrations.png";

const Index = () => {
  return (
    <div className="space-y-6 animate-fade-in font-inter text-[#1A2744]">
      {/* Welcome banner */}
      <div className="rounded-2xl border border-[#D4A373]/30 bg-[#FAF6E6] p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4A373]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[#D4A373]/20 transition-all duration-500"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h2 className="font-playfair text-3xl font-bold text-[#1A2744] mb-2">
              Welcome back, Baker! 🍰
            </h2>
            <p className="text-sm text-[#8D6E63] max-w-md">
              You have{" "}
              <span className="font-bold text-[#D4A373]">12 new orders</span> and{" "}
              <span className="font-bold text-[#D4A373]">3 custom cake requests</span>{" "}
              waiting for you today.
            </p>
          </div>
          <img
            src={bakeryIllustrations}
            alt="Bakery items"
            className="h-32 object-contain opacity-90 hidden md:block transform group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>

      {/* Stats */}
      <StatsCards />

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <RevenueChart />
        <DonutChart />
      </div>

      {/* Products and alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <PopularProducts />
        <RecentOrders />
        <LowStockAlert />
      </div>
    </div>
  );
};

export default Index;
