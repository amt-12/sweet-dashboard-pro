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
} from "lucide-react";
import cupcakeIcon from "@/assets/cupcake-icon.png";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/" },
  { title: "Orders", icon: ShoppingBag, path: "/orders" },
  { title: "Products", icon: Package, path: "/products" },
  { title: "Categories", icon: List, path: "/categories" },
  { title: "Customers", icon: Users, path: "/customers" },
  { title: "Payments", icon: CreditCard, path: "/payments" },
  { title: "Delivery", icon: Truck, path: "/delivery" },
  { title: "Analytics", icon: BarChart3, path: "/analytics" },
  { title: "Settings", icon: Settings, path: "/settings" },
];

const BakerySidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={`h-screen sticky top-0 bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
        <img src={cupcakeIcon} alt="Bakery" className="w-10 h-10 animate-float-up" />
        {!collapsed && (
          <div>
            <h1 className="font-dancing text-xl font-bold text-gradient-bakery">
              Sweet Bake
            </h1>
            <p className="text-xs text-muted-foreground">Bakery Admin</p>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.title}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-bakery transition-all duration-200 group cookie-bounce ${
                isActive
                  ? "bg-chocolate text-cream font-semibold shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-cream" : "text-chocolate"}`} />
              {!collapsed && (
                <span className="text-sm">{item.title}</span>
              )}
              {isActive && !collapsed && (
                <span className="ml-auto w-2 h-2 rounded-full bg-cream" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="m-3 p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-200 self-center"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </aside>
  );
};

export default BakerySidebar;
