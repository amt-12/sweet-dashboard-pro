import { Bell, Search, Plus } from "lucide-react";
import cookieIcon from "@/assets/cookie-icon.png";

const DashboardTopbar = () => {
  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10">
      <div>
        <h2 className="font-fredoka text-xl font-bold text-foreground">
          Good Morning! ☀️
        </h2>
        <p className="text-sm text-muted-foreground">
          Here's what's happening at your bakery today
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search orders, products..."
            className="pl-9 pr-4 py-2 rounded-full bg-secondary text-sm text-secondary-foreground border-none outline-none focus:ring-2 focus:ring-primary/30 w-64 transition-all"
          />
        </div>

        {/* Add Product */}
        <button className="bakery-btn bg-primary text-primary-foreground flex items-center gap-2 text-sm">
          <Plus size={16} />
          <span>Add Product</span>
          <img src={cookieIcon} alt="" className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-primary/10 transition-colors sprinkle-badge">
          <Bell size={20} />
        </button>

        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-strawberry-light flex items-center justify-center text-lg font-bold font-fredoka text-strawberry">
          B
        </div>
      </div>
    </header>
  );
};

export default DashboardTopbar;
