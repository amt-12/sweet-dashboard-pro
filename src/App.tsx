import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { getToken, getRole, hasPermission } from "@/services/auth";

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
const Contacts = lazy(() => import("./pages/Contacts"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLogin = lazy(() => import("./components/AdminLogin"));
const OriginStoryEditor = lazy(() => import("./pages/admin/OriginStoryEditor"));
const ValuesAdmin = lazy(() => import("./pages/admin/ValuesAdmin"));
const TeamAdmin = lazy(() => import("./pages/admin/TeamAdmin"));
const IngredientConfig = lazy(() => import("./pages/IngredientConfig"));
const NutritionConfig = lazy(() => import("./pages/NutritionConfig"));

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

const RequirePermission: React.FC<{ feature: string; children: React.ReactElement }> = ({ feature, children }) => {
  try {
    if (!isAuthenticated()) return <Navigate to="/login" replace />;
    return hasPermission(feature) ? children : <Navigate to="/admin" replace />;
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
              <Route index element={<RequirePermission feature="Dashboard"><Index /></RequirePermission>} />
              <Route path="orders" element={<RequirePermission feature="Orders"><Orders /></RequirePermission>} />
              <Route path="products" element={<RequirePermission feature="Products"><Products /></RequirePermission>} />
              <Route path="customers" element={<RequirePermission feature="Customers"><Customers /></RequirePermission>} />
              <Route path="categories" element={<RequirePermission feature="Categories"><Categories /></RequirePermission>} />
              <Route path="contacts" element={<RequirePermission feature="Contacts"><Contacts /></RequirePermission>} />
              <Route path="payments" element={<RequirePermission feature="Payments"><Payments /></RequirePermission>} />
              <Route path="delivery" element={<RequirePermission feature="Delivery"><Delivery /></RequirePermission>} />
              <Route path="analytics" element={<RequirePermission feature="Analytics"><Analytics /></RequirePermission>} />
              <Route path="flavors" element={<RequirePermission feature="Flavors"><Flavors /></RequirePermission>} />
              <Route path="weights" element={<RequirePermission feature="Weights"><Weights /></RequirePermission>} />
              <Route path="shapes" element={<RequirePermission feature="Shapes"><Shapes /></RequirePermission>} />
              <Route path="themes" element={<RequirePermission feature="Themes"><Themes /></RequirePermission>} />
              <Route path="types" element={<RequirePermission feature="Types"><Types /></RequirePermission>} />
              <Route path="occasions" element={<RequirePermission feature="Occasions"><Occasions /></RequirePermission>} />
              <Route path="ingredients" element={<RequirePermission feature="Ingredients"><IngredientConfig /></RequirePermission>} />
              <Route path="nutrition" element={<RequirePermission feature="Nutrition"><NutritionConfig /></RequirePermission>} />
              <Route path="gallery" element={<RequirePermission feature="Gallery"><GalleryAdmin /></RequirePermission>} />
              <Route path="about/origin-story" element={<RequirePermission feature="Origin Story"><OriginStoryEditor /></RequirePermission>} />
              <Route path="about/values" element={<RequirePermission feature="Values"><ValuesAdmin /></RequirePermission>} />
              <Route path="team" element={<RequirePermission feature="Team"><TeamAdmin /></RequirePermission>} />
              <Route path="admins" element={<RequireRole role="superadmin"><Admins /></RequireRole>} />
              <Route path="customize-order" element={<RequirePermission feature="Customize Order"><CustomizeOrderAdmin /></RequirePermission>} />
              <Route path="settings" element={<RequirePermission feature="Settings"><Settings /></RequirePermission>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
