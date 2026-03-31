import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { getToken, getRole, hasAccessToPath } from "@/services/auth";

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
const Roles = lazy(() => import("./pages/Roles"));

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

const RequirePermission: React.FC<{ path: string; children: React.ReactElement }> = ({ path, children }) => {
  try {
    if (!isAuthenticated()) return <Navigate to="/login" replace />;
    return hasAccessToPath(path) ? children : <Navigate to="/admin" replace />;
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
              <Route index element={<RequirePermission path="/admin"><Index /></RequirePermission>} />
              <Route path="orders" element={<RequirePermission path="/admin/orders"><Orders /></RequirePermission>} />
              <Route path="products" element={<RequirePermission path="/admin/products"><Products /></RequirePermission>} />
              <Route path="customers" element={<RequirePermission path="/admin/customers"><Customers /></RequirePermission>} />
              <Route path="categories" element={<RequirePermission path="/admin/categories"><Categories /></RequirePermission>} />
              <Route path="contacts" element={<RequirePermission path="/admin/contacts"><Contacts /></RequirePermission>} />
              <Route path="payments" element={<RequirePermission path="/admin/payments"><Payments /></RequirePermission>} />
              <Route path="delivery" element={<RequirePermission path="/admin/delivery"><Delivery /></RequirePermission>} />
              <Route path="analytics" element={<RequirePermission path="/admin/analytics"><Analytics /></RequirePermission>} />
              <Route path="flavors" element={<RequirePermission path="/admin/flavors"><Flavors /></RequirePermission>} />
              <Route path="weights" element={<RequirePermission path="/admin/weights"><Weights /></RequirePermission>} />
              <Route path="shapes" element={<RequirePermission path="/admin/shapes"><Shapes /></RequirePermission>} />
              <Route path="themes" element={<RequirePermission path="/admin/themes"><Themes /></RequirePermission>} />
              <Route path="types" element={<RequirePermission path="/admin/types"><Types /></RequirePermission>} />
              <Route path="occasions" element={<RequirePermission path="/admin/occasions"><Occasions /></RequirePermission>} />
              <Route path="ingredients" element={<RequirePermission path="/admin/ingredients"><IngredientConfig /></RequirePermission>} />
              <Route path="nutrition" element={<RequirePermission path="/admin/nutrition"><NutritionConfig /></RequirePermission>} />
              <Route path="gallery" element={<RequirePermission path="/admin/gallery"><GalleryAdmin /></RequirePermission>} />
              <Route path="about/origin-story" element={<RequirePermission path="/admin/about/origin-story"><OriginStoryEditor /></RequirePermission>} />
              <Route path="about/values" element={<RequirePermission path="/admin/about/values"><ValuesAdmin /></RequirePermission>} />
              <Route path="team" element={<RequirePermission path="/admin/team"><TeamAdmin /></RequirePermission>} />
              <Route path="admins" element={<RequireRole role="superadmin"><Admins /></RequireRole>} />
              <Route path="roles" element={<RequireRole role="superadmin"><Roles /></RequireRole>} />
              <Route path="customize-order" element={<RequirePermission path="/admin/customize-order"><CustomizeOrderAdmin /></RequirePermission>} />
              <Route path="settings" element={<RequirePermission path="/admin/settings"><Settings /></RequirePermission>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
