import BakerySidebar from "@/components/BakerySidebar";
import DashboardTopbar from "@/components/DashboardTopbar";
import StatsCards from "@/components/StatsCards";
import RevenueChart from "@/components/RevenueChart";
import DonutChart from "@/components/DonutChart";
import PopularProducts from "@/components/PopularProducts";
import RecentOrders from "@/components/RecentOrders";
import LowStockAlert from "@/components/LowStockAlert";
import bakeryIllustrations from "@/assets/bakery-illustrations.png";
import SprinklesCursor from "@/components/SprinklesCursor";

const Index = () => {
  return (
    <>
      <SprinklesCursor />
    <div className="flex min-h-screen w-full bg-background">
      <BakerySidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopbar />
        <main className="flex-1 p-6 space-y-6 overflow-auto">
          {/* Welcome banner */}
          <div className="bakery-card bg-gradient-to-r from-strawberry-light to-vanilla flex items-center justify-between overflow-hidden">
            <div>
              <h2 className="font-fredoka text-2xl font-bold text-foreground mb-1">
                Welcome back, Baker! 🍰
              </h2>
              <p className="text-sm text-muted-foreground max-w-md">
                You have <span className="font-bold text-primary">12 new orders</span> and{" "}
                <span className="font-bold text-accent">3 custom cake requests</span> waiting for you today.
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
            <LowStockAlert />
            <div className="bakery-card flex flex-col items-center justify-center text-center animate-fade-in" style={{ animationDelay: "700ms" }}>
              <span className="text-5xl mb-3 animate-float-up">🧁</span>
              <h3 className="font-fredoka text-lg font-bold text-foreground mb-1">Quick Actions</h3>
              <p className="text-sm text-muted-foreground mb-4">Manage your bakery</p>
              <div className="grid grid-cols-2 gap-2 w-full">
                {[
                  { label: "New Order", emoji: "🛒" },
                  { label: "Add Product", emoji: "🍞" },
                  { label: "Custom Cake", emoji: "🎂" },
                  { label: "Inventory", emoji: "📦" },
                ].map((action) => (
                  <button
                    key={action.label}
                    className="bakery-btn bg-secondary text-secondary-foreground text-xs py-2 px-3 flex items-center gap-1.5 justify-center"
                  >
                    <span>{action.emoji}</span>
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent orders */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <RecentOrders />
            <div className="bakery-card flex flex-col animate-fade-in" style={{ animationDelay: "800ms" }}>
              <h3 className="font-fredoka text-lg font-bold text-foreground mb-1">Today's Schedule 📅</h3>
              <p className="text-sm text-muted-foreground mb-4">Upcoming tasks</p>
              <div className="space-y-3 flex-1">
                {[
                  { time: "8:00 AM", task: "Open bakery & prep ovens", emoji: "🔥" },
                  { time: "9:30 AM", task: "Bake morning croissants", emoji: "🥐" },
                  { time: "11:00 AM", task: "Custom cake decoration", emoji: "🎨" },
                  { time: "2:00 PM", task: "Inventory restock delivery", emoji: "📦" },
                  { time: "4:00 PM", task: "Prepare tomorrow's dough", emoji: "🍞" },
                ].map((item) => (
                  <div key={item.time} className="flex items-start gap-3 p-2 rounded-xl hover:bg-secondary/50 transition-colors">
                    <span className="text-xs font-mono font-bold text-primary whitespace-nowrap mt-0.5">{item.time}</span>
                    <span className="text-sm text-foreground">{item.emoji} {item.task}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
    </>
  );
};

export default Index;
