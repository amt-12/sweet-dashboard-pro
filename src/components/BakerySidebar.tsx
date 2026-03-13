import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  ShoppingBag,
  Package,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  List,
  CreditCard,
  Truck,
  IceCream,
  Heart,
  Star,
  Edit3,
} from "lucide-react";
import cupcakeIcon from "@/assets/cupcake-icon.png";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { title: "Orders", icon: ShoppingBag, path: "/admin/orders" },
  { title: "Customize Order", icon: Edit3, path: "/admin/customize-order" },
  { title: "Products", icon: Package, path: "/admin/products" },
  { title: "Categories", icon: List, path: "/admin/categories" },
  { title: "Flavors", icon: IceCream, path: "/admin/flavors" },
  { title: "Weights", icon: IceCream, path: "/admin/weights" },
  { title: "Types", icon: IceCream, path: "/admin/types" },
  { title: "Occasions", icon: IceCream, path: "/admin/occasions" },
  { title: "Shapes", icon: Heart, path: "/admin/shapes" },
  { title: "Themes", icon: Star, path: "/admin/themes" },
  { title: "Customers", icon: Users, path: "/admin/customers" },
  { title: "Payments", icon: CreditCard, path: "/admin/payments" },
  { title: "Delivery", icon: Truck, path: "/admin/delivery" },
  { title: "Analytics", icon: BarChart3, path: "/admin/analytics" },
  { title: "Settings", icon: Settings, path: "/admin/settings" },
];

const BakerySidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={`h-screen sticky top-0 bg-[#F5ECD7] border-r border-[#D4A373]/30 flex flex-col transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-[#D4A373]/30">
        <img src={cupcakeIcon} alt="Bakery" className="w-10 h-10 animate-float-up bg-white rounded-full p-1 border border-[#D4A373]/20 shadow-sm" />
        {!collapsed && (
          <div>
            <h1 className="font-playfair text-xl font-bold text-[#1A2744] tracking-widest leading-none">
              Hangary Sweet
            </h1>
            <div className="flex items-center gap-1 mt-1">
                <span className="h-[1px] w-4 bg-[#D4A373]"></span>
                <span className="text-[0.5rem] tracking-[0.1em] text-[#8D6E63] font-medium uppercase whitespace-nowrap">Est. 1984</span>
                <span className="h-[1px] w-4 bg-[#D4A373]"></span>
            </div>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {menuItems.map((item) => {
          const isActive =
            item.path === "/admin"
              ? location.pathname === "/admin"
              : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.title}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group ${
                isActive
                  ? "bg-[#1A2744] text-[#F5ECD7] shadow-lg shadow-[#1A2744]/20"
                  : "text-[#1A2744]/80 hover:bg-[#D4A373]/10 hover:text-[#D4A373] hover:pl-4"
              } ${collapsed ? "justify-center px-0 hover:pl-0" : ""}`}
            >
              <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "text-[#D4A373] scale-110" : "group-hover:text-[#D4A373] group-hover:scale-110"}`} />
              {!collapsed && (
                <span className={`text-sm font-medium tracking-wide ${isActive ? "font-bold" : ""}`}>{item.title}</span>
              )}
              {isActive && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D4A373] animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-[#D4A373]/30">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full py-2 rounded-xl bg-[#D4A373]/10 text-[#1A2744] hover:bg-[#1A2744] hover:text-[#F5ECD7] transition-all duration-300 flex items-center justify-center gap-2 group"
        >
          {collapsed ? <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /> : (
            <>
              <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-wider">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default BakerySidebar;
