import StatsCards from "@/components/StatsCards";
import RevenueChart from "@/components/RevenueChart";
import DonutChart from "@/components/DonutChart";
import PopularProducts from "@/components/PopularProducts";
import RecentOrders from "@/components/RecentOrders";
import LowStockAlert from "@/components/LowStockAlert";
import bakeryIllustrations from "@/assets/bakery-illustrations.png";

const Index = () => {
  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bakery-card bg-gradient-to-r from-strawberry-light to-vanilla flex items-center justify-between overflow-hidden">
        <div>
          <h2 className="font-dancing text-2xl font-bold text-foreground mb-1">
            Welcome back, Baker! 🍰
          </h2>
          <p className="text-sm text-muted-foreground max-w-md">
            You have{" "}
            <span className="font-bold text-primary">12 new orders</span> and{" "}
            <span className="font-bold text-accent">3 custom cake requests</span>{" "}
            waiting for you today.
          </p>
        </div>
        <img
          src={bakeryIllustrations}
          alt="Bakery items"
          className="h-24 object-contain opacity-80 hidden md:block"
        />
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
