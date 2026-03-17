import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Lazy-loaded pages and admin layout
const Home = lazy(() => import("./pages/Home"));
const Menu = lazy(() => import("./pages/Menu"));
const About = lazy(() => import("./pages/About"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Contact = lazy(() => import("./pages/Contact"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const CustomizeOrder = lazy(() => import("./pages/CustomizeOrder"));
const Login = lazy(() => import("./pages/Login"));

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
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

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
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/about" element={<About />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/customize-order" element={<CustomizeOrder />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminLayout />}>
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
