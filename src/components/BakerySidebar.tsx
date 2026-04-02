import { useState, useEffect, useMemo } from "react";
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
  ChevronDown,
  Info,
  ChefHat,
  ShieldCheck,
} from "lucide-react";
import bakeryLogo from "@/assets/logo.jpg";
import { getRole, hasAccessToPath } from '@/services/auth';

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { title: "Orders", icon: ShoppingBag, path: "/admin/orders" },
  { title: "Customize Order", icon: Edit3, path: "/admin/customize-order" },
  { title: "Gallery", icon: Star, path: "/admin/gallery" },
  { title: "Contacts", icon: Users, path: "/admin/contacts" },
  // About parent with children (moved Gallery and Contacts here)
  {
    title: "About",
    icon: Info,
    path: "/admin/about",
    children: [
      { title: "Origin Story", icon: Info, path: "/admin/about/origin-story" },
      { title: "Values", icon: Star, path: "/admin/about/values" },
      { title: "Team", icon: ChefHat, path: "/admin/team" },
    ],
  },
  // Products now has a children array to show Product Details submenu
  {
    title: "Products",
    icon: Package,
    path: "/admin/products",
    children: [
      { title: "Products", icon: Package, path: "/admin/products" },
      { title: "Categories", icon: List, path: "/admin/categories" },
      { title: "Flavors", icon: IceCream, path: "/admin/flavors" },
      { title: "Weights", icon: IceCream, path: "/admin/weights" },
      { title: "Types", icon: IceCream, path: "/admin/types" },
      { title: "Occasions", icon: IceCream, path: "/admin/occasions" },
      { title: "Shapes", icon: Heart, path: "/admin/shapes" },
      { title: "Themes", icon: Star, path: "/admin/themes" },
       { title: "Nutrition", icon: List, path: "/admin/nutrition" },
      { title: "Ingredients", icon: List, path: "/admin/ingredients" },
     
    ],
  },
  { title: "Admins", icon: Users, path: "/admin/admins" },
  { title: "Roles", icon: ShieldCheck, path: "/admin/roles" },
  { title: "Customers", icon: Users, path: "/admin/customers" },
  { title: "Payments", icon: CreditCard, path: "/admin/payments" },
  { title: "Delivery", icon: Truck, path: "/admin/delivery" },
  { title: "Analytics", icon: BarChart3, path: "/admin/analytics" },
  { title: "Settings", icon: Settings, path: "/admin/settings" },
];

const BakerySidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openProducts, setOpenProducts] = useState(false);
  const [openAbout, setOpenAbout] = useState(false);
  const location = useLocation();
  const role = getRole();
  
  const getVisibleMenu = () => {
    // Superadmin sees everything
    if (role === 'superadmin') {
      return menuItems;
    }
    
    // Admin sees only pages included in assigned permissions.
    return menuItems.map(item => {
      // Always show Dashboard
      if (item.title === 'Dashboard') return item;

      if (item.title === 'Admins' || item.title === 'Roles') return null;

      if (item.children) {
        const visibleChildren = item.children.filter((child) => hasAccessToPath(child.path));
        const canViewParent = hasAccessToPath(item.path);

        if (!canViewParent && visibleChildren.length === 0) {
          return null;
        }

        return {
          ...item,
          children: visibleChildren,
        };
      }

      if (hasAccessToPath(item.path)) {
        return item;
      }

      return null;
    }).filter(Boolean);
  };
  
  const visibleMenu = useMemo(() => getVisibleMenu(), [role, location.pathname]);

  // Auto-open submenu when current route is inside it, but don't force-close on unrelated routes.
  useEffect(() => {
    const product = visibleMenu.find(m => m.title === 'Products');
    if (product && product.children) {
      const activeChild = product.children.some(c => location.pathname.startsWith(c.path));
      const activeParent = location.pathname === product.path || location.pathname.startsWith(product.path + "/");
      if (activeChild || activeParent) {
        setOpenProducts(true);
      }
    }

    const about = visibleMenu.find(m => m.title === 'About');
    if (about && about.children) {
      const activeChild = about.children.some(c => location.pathname.startsWith(c.path));
      const activeParent = location.pathname === about.path || location.pathname.startsWith(about.path + "/");
      if (activeChild || activeParent) {
        setOpenAbout(true);
      }
    }
  }, [location.pathname, visibleMenu]);

  return (
    <aside
      className={`h-screen sticky top-0 bg-[#F5ECD7] border-r border-[#D4A373]/30 flex flex-col transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-[#D4A373]/30">
        <img src={bakeryLogo} alt="Bakery" className="w-14 h-14 animate-float-up bg-white rounded-full p-1 border border-[#D4A373]/20 shadow-sm object-contain" />
        {!collapsed && (
          <div>
            <h1 className="font-playfair text-xl font-bold text-[#1A2744] tracking-widest leading-none">
              Hangary? Sweet.
            </h1>
            <div className="flex items-center gap-1 mt-1">
                <span className="h-[1px] w-4 bg-[#D4A373]"></span>
                <span className="text-[0.5rem] tracking-[0.1em] text-[#8D6E63] font-medium uppercase whitespace-nowrap">Est. 2024</span>
                <span className="h-[1px] w-4 bg-[#D4A373]"></span>
            </div>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 no-scrollbar">
        {visibleMenu.map((item) => {
          const isParentWithChildren = Array.isArray(item.children) && item.children.length > 0;

          const isActive = isParentWithChildren
            ? // parent is active if its path or any child path matches
              item.path === "/admin"
              ? location.pathname === "/admin"
              : (location.pathname === item.path || location.pathname.startsWith(item.path) || item.children.some(c => location.pathname.startsWith(c.path)))
            : item.path === "/admin"
            ? location.pathname === "/admin"
            : location.pathname.startsWith(item.path);

          if (isParentWithChildren) {
            const isOpen = item.title === 'Products' ? openProducts : item.title === 'About' ? openAbout : false;
            const toggleOpen = () => {
              if (item.title === 'Products') setOpenProducts(!openProducts);
              if (item.title === 'About') setOpenAbout(!openAbout);
            };

            return (
              <div key={item.title}>
                <button
                  onClick={toggleOpen}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group ${
                    isActive
                      ? "bg-[#1A2744] text-[#F5ECD7] shadow-lg shadow-[#1A2744]/20"
                      : "text-[#1A2744]/80 hover:bg-[#D4A373]/10 hover:text-[#D4A373] hover:pl-4"
                  } ${collapsed ? "justify-center px-0 hover:pl-0" : ""}`}
                >
                  <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "text-[#D4A373] scale-110" : "group-hover:text-[#D4A373] group-hover:scale-110"}`} />
                  {!collapsed && (
                    <>
                      <span className={`text-sm font-medium tracking-wide ${isActive ? "font-bold" : ""}`}>{item.title}</span>
                      <ChevronDown className={`ml-auto transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </>
                  )}
                </button>

                {/* children links */}
                {isOpen && !collapsed && (
                  <div className="mt-1 ml-8 space-y-1">
                    {item.children.map((child) => {
                      const childActive = location.pathname === child.path || location.pathname.startsWith(child.path);
                      return (
                        <Link
                          key={child.title}
                          to={child.path}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                            childActive
                              ? "bg-[#1A2744] text-[#F5ECD7] shadow-md"
                              : "text-[#1A2744]/80 hover:bg-[#D4A373]/10 hover:text-[#D4A373]"
                          }`}
                        >
                          <child.icon className={`w-4 h-4 ${childActive ? "text-[#D4A373]" : "text-[#1A2744]/60 group-hover:text-[#D4A373]"}`} />
                          <span className="truncate">{child.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

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
