import { Bell, Search, Plus } from "lucide-react";

const DashboardTopbar = () => {
  return (
    <header className="h-16 border-b border-[#D4A373]/30 bg-[#F5ECD7]/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10 font-hepta">
      <div>
        <h2 className="font-playfair text-xl font-bold text-[#1A2744]">
          Good Morning! ☀️
        </h2>
        <p className="text-sm text-[#8D6E63] font-inter">
          Here's what's happening at your bakery today
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative group">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1A2744]/40 group-focus-within:text-[#D4A373] transition-colors" />
          <input
            placeholder="Search orders, products..."
            className="pl-9 pr-4 py-2 bg-[#F5ECD7] border border-[#D4A373]/20 rounded-lg text-sm text-[#1A2744] placeholder-[#1A2744]/40 outline-none focus:ring-1 focus:ring-[#D4A373] focus:bg-white w-64 transition-all shadow-inner"
          />
        </div>

        {/* Add Product - Clean Bakery Style */}
        <button className="flex items-center gap-2 px-4 py-2 bg-[#1A2744] hover:bg-[#D4A373] text-[#F5ECD7] hover:text-[#1A2744] rounded-lg transition-all duration-300 shadow-md group">
          <Plus size={16} className="group-hover:rotate-90 transition-transform" />
          <span className="font-bold text-xs uppercase tracking-wider">Add Product</span>
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg bg-[#FAF6E6] text-[#1A2744] hover:bg-[#D4A373] hover:text-[#1A2744] transition-all border border-[#D4A373]/20 shadow-sm">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#D4A373] rounded-full ring-2 ring-white"></span>
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-lg bg-[#D4A373] flex items-center justify-center text-lg font-bold font-playfair text-[#1A2744] shadow-md border-2 border-[#FAF6E6] cursor-pointer hover:scale-105 transition-transform">
          B
        </div>
      </div>
    </header>
  );
};

export default DashboardTopbar;
