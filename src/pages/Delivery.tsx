import { 
  Truck, 
  MapPin, 
  CheckCircle, 
  Clock, 
  Phone, 
  AlertTriangle, 
  RefreshCw, 
  Navigation, 
  User, 
  ChevronRight, 
  Hash, 
  Sparkles, 
  Search, 
  Boxes, 
  IndianRupee,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { api } from "../services/api";
import { fetchWithAuth } from "@/services/auth";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Delivery = () => {
    const [loading, setLoading] = useState(false);
    const [deliveries, setDeliveries] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const normalizeToArray = (payload: unknown): any[] => {
      if (Array.isArray(payload)) return payload;
      if (payload && typeof payload === "object") {
        const p = payload as Record<string, unknown>;
        if (Array.isArray(p.data)) return p.data;
        if (Array.isArray(p.orders)) return p.orders;
      }
      return [];
    };

    const loadDeliveries = async () => {
      setLoading(true);
      try {
        const [customOrders, checkoutOrders] = await Promise.all([
          api.orders.getAll().catch(() => []),
          api.checkoutOrders.getAll().catch(() => []),
        ]);

        const normCustom = normalizeToArray(customOrders);
        const normCheckout = normalizeToArray(checkoutOrders);

        const mapOrder = (order: any, type: 'custom' | 'checkout') => ({
          id: `#DEL-${String(order._id || order.id).slice(-6).toUpperCase()}`,
          orderId: type === 'checkout' ? (order.orderNumber || `#ORD-${String(order._id || order.id).slice(-6)}`) : `#ORD-${String(order._id || order.id).slice(-6)}`,
          orderIdRaw: order._id || order.id || null,
          orderType: type,
          address: order.deliveryAddress || order.address || 'Address not specified',
          driver: order.deliveryPartner || 'Unassigned',
          driverPhone: order.deliveryPartnerPhone || 'N/A',
          status: 'En Route',
          time: order.deliveryEstimatedTime || 'Pending',
          customerName: order.customerName || order.name || 'Customer',
          totalAmount: order.totalAmount || order.total || 0,
          createdAt: order.createdAt,
          originalOrder: order,
        });

        const customMapped = normCustom
          .filter((o: any) => String(o.orderStatus || o.status || '').toLowerCase() === 'out_for_delivery')
          .map((o: any) => mapOrder(o, 'custom'));

        const checkoutMapped = normCheckout
          .filter((o: any) => String(o.orderStatus || o.status || '').toLowerCase() === 'out_for_delivery')
          .map((o: any) => mapOrder(o, 'checkout'));

        const allDeliveries = [...customMapped, ...checkoutMapped];
        setDeliveries(allDeliveries);
      } catch (err) {
        console.error('Failed to load deliveries:', err);
        toast.error("Failed to load deliveries");
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      loadDeliveries();
    }, []);

    const filteredDeliveries = useMemo(() => {
      return deliveries.filter(d => 
        d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.driver.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }, [deliveries, searchQuery]);

    const totalValue = deliveries.reduce((sum, d) => sum + (d.totalAmount || 0), 0);

    const markDelivered = async (delivery: any) => {
        try {
            setLoading(true);
            await api.checkoutOrders.updateStatus(delivery.orderIdRaw || delivery.originalOrder?._id, 'delivered');
            toast.success('Manifest Updated: Product Delivered');
            loadDeliveries();
        } catch (e) {
            toast.error('Failed to update manifest status');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 font-lora pb-12 p-6 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-chocolate text-white flex items-center justify-center shadow-bakery transform rotate-3">
                     <Truck size={28} />
                  </div>
                  <div>
                    <h2 className="text-4xl font-bold font-dancing text-chocolate">Tracking Manifest</h2>
                    <p className="text-sm text-chocolate-light font-medium mt-1">
                      Monitor artisanal creations in real-time transit.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={loadDeliveries}
                        className="p-3 bg-white border border-chocolate/10 rounded-full text-chocolate hover:bg-strawberry/5 transition-all shadow-sm group"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
                    </button>
                    <button className="px-6 py-3 bg-chocolate text-white rounded-full flex items-center gap-2 shadow-bakery hover:shadow-bakery-lg hover:bg-strawberry transition-all duration-300">
                        <User size={18} />
                        <span className="font-bold text-xs uppercase tracking-widest text-[#F5ECD7]">Dispatch Partners</span>
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-chocolate/5 shadow-bakery group hover:shadow-bakery-lg transition-all duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                            <Navigation size={20} className="rotate-45" />
                        </div>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">In Transit</span>
                    </div>
                    <h4 className="text-3xl font-bold text-chocolate font-dancing">{deliveries.length} Packages</h4>
                    <p className="text-[10px] text-chocolate/40 font-bold uppercase tracking-widest mt-1">Active Deliveries</p>
                </div>

                <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-chocolate/5 shadow-bakery group hover:shadow-bakery-lg transition-all duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-strawberry/5 text-strawberry border border-strawberry/10">
                            <IndianRupee size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-strawberry bg-strawberry/5 px-2 py-0.5 rounded-full uppercase tracking-tighter">Revenue Float</span>
                    </div>
                    <h4 className="text-3xl font-bold text-chocolate font-dancing">₹{(totalValue/1000).toFixed(1)}k</h4>
                    <p className="text-[10px] text-chocolate/40 font-bold uppercase tracking-widest mt-1">Manifest Value</p>
                </div>

                <div className="bg-chocolate p-6 rounded-[2rem] shadow-bakery relative overflow-hidden group hover:bg-strawberry transition-all duration-500">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/10" />
                    <div className="flex items-center justify-between mb-4 relative z-10">
                         <div className="p-3 rounded-xl bg-white/20 text-white backdrop-blur-sm">
                            <ShieldCheck size={20} />
                        </div>
                        <Sparkles size={20} className="text-white/20 group-hover:text-white/40 transition-colors" />
                    </div>
                    <h4 className="text-3xl font-bold text-white font-dancing">Seamless</h4>
                    <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest mt-1">Logistics Integrity</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="space-y-6">
                {/* Search / Filter */}
                <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-[2rem] shadow-bakery border border-chocolate/5">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-chocolate/30 group-focus-within:text-strawberry transition-colors w-5 h-5" />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by manifest ID, customer, or courier..." 
                            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-[#FAF6E6]/50 text-chocolate outline-none border border-transparent focus:border-strawberry/20 focus:bg-white focus:ring-8 focus:ring-strawberry/5 transition-all font-medium placeholder:text-chocolate/20" 
                        />
                    </div>
                </div>

                {/* Tracking Manifest Table */}
                <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-chocolate/5 shadow-bakery overflow-hidden">
                    <Table>
                        <TableHeader className="bg-cream/30">
                            <TableRow className="border-chocolate/5 hover:bg-transparent">
                                <TableHead className="w-20 pl-8 h-16 font-bold text-chocolate italic uppercase tracking-widest text-[10px]">Tracker</TableHead>
                                <TableHead className="h-16 font-bold text-chocolate/80 uppercase tracking-widest text-[10px]">Customer & Destination</TableHead>
                                <TableHead className="h-16 font-bold text-chocolate/80 uppercase tracking-widest text-[10px] hidden md:table-cell">Courier Detail</TableHead>
                                <TableHead className="h-16 font-bold text-chocolate/80 uppercase tracking-widest text-[10px]">ETA & Value</TableHead>
                                <TableHead className="pr-8 h-16 font-bold text-chocolate italic uppercase tracking-widest text-[10px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="no-scrollbar">
                            {loading && filteredDeliveries.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-24 text-center">
                                       <div className="flex flex-col items-center gap-3">
                                          <RefreshCw size={32} className="animate-spin text-chocolate/20" />
                                          <p className="text-chocolate/40 font-medium italic">Consulting the logistics graph...</p>
                                       </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredDeliveries.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-24 text-center">
                                        <div className="w-16 h-16 bg-chocolate/5 rounded-full flex items-center justify-center mx-auto text-chocolate/10 mb-4">
                                            <Truck size={32} />
                                        </div>
                                        <p className="text-chocolate-light font-medium italic">No active deliveries found in transit.</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredDeliveries.map((delivery) => (
                                    <TableRow key={delivery.id} className="group border-chocolate/5 hover:bg-cream/20 transition-colors">
                                        <TableCell className="pl-8 py-6">
                                            <div className="w-12 h-12 rounded-xl bg-chocolate text-white flex items-center justify-center shadow-sm transform group-hover:rotate-3 transition-transform duration-300">
                                                <Truck size={20} />
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-chocolate text-lg tracking-tight group-hover:text-strawberry transition-colors">
                                                    {delivery.customerName}
                                                </span>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <MapPin size={10} className="text-chocolate/20" />
                                                    <span className="text-[10px] font-medium text-chocolate/40 italic line-clamp-1 max-w-[200px]">
                                                        {delivery.address}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-6 hidden md:table-cell">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-strawberry/5 text-strawberry flex items-center justify-center font-bold text-[10px] transform group-hover:-rotate-12 transition-transform">
                                                    {delivery.driver?.charAt(0) || 'D'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-chocolate/60">{delivery.driver}</span>
                                                    <span className="text-[9px] text-chocolate/20 font-mono tracking-tighter">{delivery.driverPhone}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-6">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="px-3 py-1 bg-chocolate/5 rounded-full border border-chocolate/5 w-fit flex items-center gap-1.5">
                                                    <Clock size={10} className="text-chocolate/30" />
                                                    <span className="text-[10px] font-bold text-chocolate/60">{delivery.time}</span>
                                                </div>
                                                <span className="text-[11px] font-bold text-chocolate/40 italic ml-2">₹{delivery.totalAmount?.toLocaleString()}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-6 pr-8 text-right">
                                            <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                                <button
                                                    onClick={() => markDelivered(delivery)}
                                                    className="px-4 py-2 bg-chocolate text-[#F5ECD7] rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-strawberry transition-all shadow-sm active:scale-95 flex items-center gap-2"
                                                >
                                                    <CheckCircle size={12} />
                                                    Delivered
                                                </button>
                                                <button className="p-2.5 bg-white border border-chocolate/10 rounded-full text-chocolate hover:bg-chocolate hover:text-white transition-all shadow-sm">
                                                    <ExternalLink size={14} />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Tactical Footer Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                 <div className="bg-strawberry/5 p-8 rounded-[2.5rem] border border-strawberry/20 flex items-center gap-6 shadow-bakery relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-strawberry/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <div className="p-4 bg-white rounded-2xl text-strawberry shadow-sm transform -rotate-3 group-hover:rotate-0 transition-transform">
                        <AlertTriangle size={32} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-chocolate text-xl font-dancing">Logistical Insight</h4>
                        <p className="text-sm text-chocolate-light font-medium italic leading-relaxed mt-1">
                            High transit volume in <span className="font-bold text-chocolate">Downtown</span>. Ensure couriers prefer optimized bypass routes.
                        </p>
                    </div>
                </div>

                <div className="bg-chocolate/5 p-8 rounded-[2.5rem] border border-chocolate/10 flex items-center justify-between shadow-bakery group hover:bg-chocolate transition-all duration-500">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-chocolate group-hover:rotate-6 transition-transform">
                            <Boxes size={24} />
                        </div>
                        <div>
                             <h4 className="font-bold text-chocolate group-hover:text-white transition-colors text-xl font-dancing">Courier Network</h4>
                             <p className="text-[10px] font-bold text-chocolate/40 group-hover:text-white/40 uppercase tracking-widest">Manage partners</p>
                        </div>
                    </div>
                    <ChevronRight size={20} className="text-chocolate/20 group-hover:text-white/40 group-hover:translate-x-2 transition-all" />
                </div>
            </div>
        </div>
    );
};

export default Delivery;
