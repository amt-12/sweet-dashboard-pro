import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLayout from "./components/AdminLayout";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Categories from "./pages/Categories";
import Payments from "./pages/Payments";
import Delivery from "./pages/Delivery";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import CustomizeOrder from "./pages/CustomizeOrder";
import ProductDetails from "./pages/ProductDetails";
import Menu from "./pages/Menu";
import About from "./pages/About";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import Types from "./pages/Types";
import Flavors from "./pages/Flavors";
import Occasions from "./pages/Occasions";
import Weights from "./pages/Weights";
import Shapes from "./pages/Shapes";
import Themes from "./pages/Themes";
import CustomizeOrderAdmin from "./pages/CustomizeOrderAdmin";

import Home from "./pages/Home";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
            <Route path="customize-order" element={<CustomizeOrderAdmin />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
