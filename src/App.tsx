import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { getToken, getRole } from "@/services/auth";

// Lazy-loaded pages and admin layout

const AdminLayout = lazy(() => import("./components/AdminLayout"));
const Index = lazy(() => import("./pages/Index"));
const Orders = lazy(() => import("./pages/Orders"));
const Products = lazy(() => import("./pages/Products"));
const Customers = lazy(() => import("./pages/Customers"));
const Categories = lazy(() => import("./pages/Categories"));
const Payments = lazy(() => import("./pages/Payments"));
const Delivery = lazy(() => import("./pages/Delivery"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Settings = lazy(() => import("./pages/Settings"));
const CustomizeOrderAdmin = lazy(() => import("./pages/CustomizeOrderAdmin"));
const Types = lazy(() => import("./pages/Types"));
const Flavors = lazy(() => import("./pages/Flavors"));
const Occasions = lazy(() => import("./pages/Occasions"));
const Weights = lazy(() => import("./pages/Weights"));
const Shapes = lazy(() => import("./pages/Shapes"));
const Themes = lazy(() => import("./pages/Themes"));
const GalleryAdmin = lazy(() => import("./pages/GalleryAdmin"));
const Admins = lazy(() => import("./pages/Admins"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLogin = lazy(() => import("./components/AdminLogin"));

const queryClient = new QueryClient();

const isAuthenticated = () => {
  try {
    return !!getToken();
  } catch (e) {
    return false;
  }
};

const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

// Require a specific role (e.g. superadmin). If role doesn't match, redirect to /admin (or login if not authenticated).
const RequireRole: React.FC<{ role: string; children: React.ReactElement }> = ({ role, children }) => {
  try {
    if (!isAuthenticated()) return <Navigate to="/login" replace />;
    const r = getRole();
    return r === role ? children : <Navigate to="/admin" replace />;
  } catch (e) {
    return <Navigate to="/login" replace />;
  }
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="min-h-screen grid place-items-center">Loading…</div>
          }
        >
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<AdminLogin />} />
            <Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
              <Route index element={<Index />} />
              <Route path="orders" element={<Orders />} />
              <Route path="products" element={<Products />} />
              <Route path="customers" element={<Customers />} />
              <Route path="categories" element={<Categories />} />
              <Route path="payments" element={<Payments />} />
              <Route path="delivery" element={<Delivery />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="flavors" element={<Flavors />} />
              <Route path="weights" element={<Weights />} />
              <Route path="shapes" element={<Shapes />} />
              <Route path="themes" element={<Themes />} />
              <Route path="types" element={<Types />} />
              <Route path="occasions" element={<Occasions />} />
              <Route path="gallery" element={<GalleryAdmin />} />
              <Route path="admins" element={<RequireRole role="superadmin"><Admins /></RequireRole>} />
              <Route path="customize-order" element={<CustomizeOrderAdmin />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
