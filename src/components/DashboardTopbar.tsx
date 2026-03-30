import { Bell, Search, Plus, LogOut, ChevronDown, User, Sparkles, Settings as SettingsIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout, getRole } from "@/services/auth";

const DashboardTopbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-20 bg-white/60 border-b border-chocolate/5 backdrop-blur-xl flex items-center justify-between px-10 sticky top-0 z-40 font-lora transition-all duration-300">
      <div className="animate-in fade-in slide-in-from-top-4 duration-700">
        <h2 className="font-dancing text-2xl font-bold text-chocolate leading-none">
          Good Morning, <span className="text-strawberry">Baker</span> ☀️
        </h2>
        <p className="text-[10px] text-chocolate/40 font-bold uppercase tracking-[0.2em] mt-1 hidden md:block">
           The kitchen is ready for your creations.
        </p>
      </div>

      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative group hidden lg:block">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
          <input
            placeholder="Search the archives..."
            className="pl-11 pr-6 py-2.5 bg-chocolate/[0.03] border border-chocolate/5 rounded-full text-xs text-chocolate placeholder-chocolate/20 outline-none focus:ring-4 focus:ring-strawberry/5 focus:bg-white w-72 transition-all shadow-inner font-medium"
          />
        </div>

        {/* Global Action Button */}
        <button 
          onClick={() => navigate('/admin/products')}
          className="flex items-center gap-2.5 px-6 py-2.5 bg-chocolate text-white rounded-full transition-all duration-500 shadow-bakery hover:shadow-bakery-lg hover:bg-strawberry group"
        >
          <Plus size={16} className="group-hover:rotate-90 transition-transform duration-500" />
          <span className="font-bold text-[10px] uppercase tracking-widest">Add Product</span>
        </button>

        <div className="flex items-center gap-4 border-l border-chocolate/5 pl-6">
          {/* Notifications */}
          <button className="relative p-2.5 rounded-xl bg-white border border-chocolate/5 text-chocolate hover:text-strawberry hover:bg-strawberry/5 transition-all shadow-sm group">
            <Bell size={18} className="group-hover:scale-110 transition-transform" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-strawberry rounded-full ring-2 ring-white animate-pulse"></span>
          </button>

          {/* User Profile & Menu */}
          <div ref={menuRef} className="relative">
            <button 
              onClick={() => setMenuOpen(s => !s)} 
              className="flex items-center gap-3 p-1.5 pr-4 rounded-full bg-white border border-chocolate/5 group hover:border-strawberry/20 transition-all shadow-sm"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-chocolate to-chocolate/80 flex items-center justify-center text-white font-dancing font-bold text-xl shadow-inner border-2 border-white overflow-hidden relative group-hover:scale-105 transition-transform">
                <div className="absolute inset-0 bg-strawberry/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                B
              </div>
              <div className="hidden md:block text-left">
                <p className="text-[10px] font-bold text-chocolate leading-none">Baker</p>
                <p className="text-[8px] text-strawberry font-bold uppercase tracking-widest mt-0.5">{getRole() || 'Admin'}</p>
              </div>
              <ChevronDown size={14} className={`text-chocolate/30 transition-transform duration-500 ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-[2rem] shadow-bakery-lg border border-chocolate/5 p-3 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="px-4 py-4 mb-2 bg-chocolate/5 rounded-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-strawberry/5 rounded-full -mr-12 -mt-12 blur-2xl" />
                   <p className="text-[9px] font-bold text-chocolate/40 uppercase tracking-widest mb-1 relative">User Access</p>
                   <p className="text-xs font-bold text-chocolate flex items-center gap-2 relative">
                     <User size={14} className="text-strawberry" />
                     {getRole() || 'Administrator'}
                   </p>
                </div>
                
                <div className="space-y-1">
                  <button onClick={() => navigate('/admin/settings')} className="w-full flex items-center gap-3 px-4 py-3 text-chocolate/60 hover:text-chocolate hover:bg-chocolate/5 rounded-xl transition-all font-medium text-xs">
                     <SettingsIcon size={14} />
                     Bakery Settings
                  </button>
                  <button onClick={() => navigate('/admin/analytics')} className="w-full flex items-center gap-3 px-4 py-3 text-chocolate/60 hover:text-chocolate hover:bg-chocolate/5 rounded-xl transition-all font-medium text-xs">
                     <Sparkles size={14} />
                     Insights
                  </button>
                  <div className="h-[1px] bg-chocolate/5 my-2 mx-2" />
                  <button 
                    onClick={handleLogout} 
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:text-white hover:bg-red-500 rounded-xl transition-all font-bold text-xs uppercase tracking-widest"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardTopbar;
