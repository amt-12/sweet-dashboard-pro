import { Search, Eye, Filter, CheckCircle, Clock, XCircle, Truck, Package, ChefHat, Heart, ReceiptText } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setOrders, setLoading, setError } from "../store/slices/orderSlice";
import { api } from "../services/api";
import type { Order as OrderType } from "../types";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "../components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

type Order = {
  id: string | number;
  customerName: string;
  items: string;
  total: number;
  status: string;
  date: string;
  [key: string]: unknown;
};

const getStatusStyles = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === "delivered" || s === "completed") return "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (s === "processing" || s === "preparing" || s === "confirmed" || s === "out_for_delivery") return "bg-blue-50 text-blue-600 border-blue-100";
    if (s === "pending" || s === "paid" || s === "placed") return "bg-amber-50 text-amber-600 border-amber-100";
    if (s === "cancelled") return "bg-red-50 text-red-600 border-red-100";
    if (s === "ready") return "bg-strawberry/5 text-strawberry border-strawberry/10";
    return "bg-chocolate/5 text-chocolate border-chocolate/10";
};

const getStatusIcon = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === "delivered" || s === "completed") return <CheckCircle size={12} />;
    if (s === "processing" || s === "preparing" || s === "confirmed" || s === "out_for_delivery") return <ChefHat size={12} />;
    if (s === "pending" || s === "paid" || s === "placed") return <Clock size={12} />;
    if (s === "cancelled") return <XCircle size={12} />;
    if (s === "ready") return <Package size={12} />;
    return <Truck size={12} />;
}

const Orders = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { orders, loading, error } = useAppSelector((state) => state.orders);
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const normalizeToArray = (payload: unknown): OrderType[] => {
    if (Array.isArray(payload)) return payload as unknown as OrderType[];
    if (payload && typeof payload === "object") {
      const p = payload as Record<string, unknown>;
      if (Array.isArray(p.data)) return p.data as unknown as OrderType[];
      if (Array.isArray(p.orders)) return p.orders as unknown as OrderType[];
    }
    return [];
  };
  
  const normalizeCheckoutOrders = (orders: any[]): OrderType[] => {
    return orders.map(order => ({
      id: order._id || order.id,
      customerId: order.customerId,
      customerName: order.customerName,
      items: order.items?.map((item: any) => `${item.name} (x${item.quantity})`).join(', ') || 'N/A',
      total: order.totalAmount || 0,
      status: order.orderStatus || 'placed',
      date: new Date(order.createdAt).toLocaleDateString(),
      paymentStatus: order.paymentStatus || 'pending',
    })) as OrderType[];
  };

  const handleMarkAsDelivered = async () => {
    if (!selectedOrder) return;
    
    setIsUpdating(true);
    try {
      await api.checkoutOrders.updateStatus(selectedOrder.id, 'delivered');
      toast({
        title: "Success!",
        description: "Order marked as delivered",
      });
      // Refresh orders
      const [customizeOrders, checkoutOrders] = await Promise.all([
        api.orders.getAll().catch(() => []),
        api.checkoutOrders.getAll().catch(() => []),
      ]);
      const customNormalized = normalizeToArray(customizeOrders);
      const checkoutNormalized = normalizeCheckoutOrders(normalizeToArray(checkoutOrders) as any[]);
      const combined = [...customNormalized, ...checkoutNormalized];
      dispatch(setOrders(combined));
      setSelectedOrder(null);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const orderList = normalizeToArray(orders).filter(
    order => order.status?.toLowerCase() !== 'delivered' && order.status?.toLowerCase() !== 'completed'
  );

  useEffect(() => {
    const fetchOrders = async () => {
      dispatch(setLoading(true));
      try {
        const [customizeOrders, checkoutOrders] = await Promise.all([
          api.orders.getAll().catch(() => []),
          api.checkoutOrders.getAll().catch(() => []),
        ]);
        const customNormalized = normalizeToArray(customizeOrders);
        const checkoutNormalized = normalizeCheckoutOrders(normalizeToArray(checkoutOrders) as any[]);
        const combined = [...customNormalized, ...checkoutNormalized];
        dispatch(setOrders(combined));
      } catch (err) {
        dispatch(setError("Failed to fetch orders"));
      } finally {
        dispatch(setLoading(false)); }
    };
    fetchOrders();
  }, [dispatch]);

  if (loading) return (
    <div className="bg-white/50 backdrop-blur-sm rounded-[2rem] border border-chocolate/10 shadow-bakery p-20 flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-chocolate/10 border-t-chocolate rounded-full animate-spin" />
      <p className="text-chocolate-light font-medium animate-pulse">Gathering order records... 🚚</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-lora">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-bold font-dancing text-chocolate">Order Registry</h2>
          <p className="text-sm text-chocolate-light font-medium mt-1">Track and manage your customer's sweet requests with grace.</p>
        </div>
        <button className="px-6 py-3 bg-chocolate text-white rounded-full font-bold shadow-bakery hover:shadow-bakery-lg hover:bg-strawberry transition-all flex items-center gap-2 group">
          <ChefHat size={18} className="group-hover:rotate-12 transition-transform" />
          <span className="text-xs uppercase tracking-widest">New Reservation</span>
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-3xl shadow-bakery border border-chocolate/5">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/30 group-focus-within:text-strawberry transition-colors w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by name, ID, or items..." 
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-transparent focus:border-strawberry/20 focus:bg-white text-sm text-chocolate placeholder:text-chocolate/30 outline-none transition-all shadow-sm"
          />
        </div>
        <button className="p-3 bg-white rounded-2xl text-chocolate hover:bg-strawberry hover:text-white transition-all shadow-sm border border-chocolate/5">
          <Filter size={20} />
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-chocolate/5 shadow-bakery overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-chocolate/[0.02] text-chocolate/40 font-bold uppercase tracking-widest text-[10px] border-b border-chocolate/5">
              <tr>
                <th className="p-6 pl-8">ID</th>
                <th className="p-6">Client</th>
                <th className="p-6">Contents</th>
                <th className="p-6">Value</th>
                <th className="p-6">Status</th>
                <th className="p-6">Timeline</th>
                <th className="p-6 text-right pr-8">Artistry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-chocolate/5 text-sm">
              {orderList.map((order) => (
                <tr key={order.id} className="hover:bg-strawberry/[0.02] transition-colors group">
                  <td className="p-6 pl-8 font-bold text-chocolate/60 text-xs tabular-nums">#{order.id}</td>
                  <td className="p-6">
                      <div className="font-bold text-chocolate">{order.customerName}</div>
                  </td>
                  <td className="p-6 text-chocolate-light font-medium max-w-[200px] truncate italic" title={order.items}>{order.items}</td>
                  <td className="p-6 text-strawberry font-bold text-base">₹{(order.total || 0).toLocaleString()}</td>
                  <td className="p-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm ${getStatusStyles(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </td>
                  <td className="p-6 text-chocolate-light/60 text-xs font-medium tabular-nums">{order.date}</td>
                  <td className="p-6 pr-8 text-right">
                    <div className="flex justify-end gap-2 translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-2.5 bg-chocolate text-white rounded-full shadow-bakery hover:bg-strawberry transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
           </table>
           {orderList.length === 0 && (
             <div className="text-center p-20 space-y-4">
                <div className="w-16 h-16 bg-chocolate/5 rounded-full flex items-center justify-center mx-auto text-chocolate/20">
                  <ReceiptText size={32} />
                </div>
                <p className="text-chocolate-light font-medium italic">The order book is currently resting.</p>
             </div>
           )}
        </div>
      </div>

      <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <SheetContent side="right" className="flex flex-col h-full bg-[#FAFBFD] p-0 border-l border-chocolate/10">
          <SheetHeader className="p-8 bg-white border-b border-chocolate/5 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-strawberry/5 rounded-full -mr-16 -mt-16 blur-3xl" />
             <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 bg-chocolate text-white rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">
                  <ReceiptText size={28} />
                </div>
                <div>
                  <SheetTitle className="text-3xl font-bold text-chocolate font-dancing">
                    Order Details
                  </SheetTitle>
                  <SheetDescription className="text-chocolate-light font-medium">
                    Order <span className="text-strawberry font-bold">#{selectedOrder?.id}</span> for {selectedOrder?.customerName}
                  </SheetDescription>
                </div>
             </div>
          </SheetHeader>

          {selectedOrder && (
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="bg-white rounded-3xl p-6 border border-chocolate/5 shadow-bakery space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-chocolate/40 uppercase tracking-widest">Current Status</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm ${getStatusStyles(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="h-1 bg-chocolate/5 rounded-full overflow-hidden">
                   <div className="h-full bg-strawberry w-2/3" />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-sm font-bold text-chocolate uppercase tracking-widest ml-1">
                  <Package size={16} className="text-strawberry" />
                  Order Contents
                </h4>
                <div className="bg-white rounded-3xl p-6 border border-chocolate/5 shadow-bakery">
                   <p className="text-chocolate font-medium italic">"{selectedOrder.items}"</p>
                   <div className="mt-6 pt-6 border-t border-chocolate/5 flex justify-between items-center">
                      <span className="text-sm font-bold text-chocolate-light">Grand Total</span>
                      <span className="text-2xl font-bold text-strawberry">₹{(selectedOrder.total || 0).toLocaleString()}</span>
                   </div>
                </div>
              </div>

               <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-sm font-bold text-chocolate uppercase tracking-widest ml-1">
                  <Clock size={16} className="text-strawberry" />
                  Timeline
                </h4>
                <div className="bg-white rounded-3xl p-6 border border-chocolate/5 shadow-bakery space-y-3">
                   <div className="flex justify-between text-xs font-medium">
                      <span className="text-chocolate/40">Registered on</span>
                      <span className="text-chocolate">{selectedOrder.date}</span>
                   </div>
                </div>
              </div>
            </div>
          )}

          <SheetFooter className="p-8 bg-white border-t border-chocolate/5">
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="flex-1 py-3 bg-chocolate/10 text-chocolate rounded-full font-bold shadow-bakery hover:bg-chocolate/20 transition-all text-xs uppercase tracking-widest"
              >
                Close
              </button>
              {selectedOrder?.status !== 'delivered' && selectedOrder?.status !== 'completed' && (
                <button 
                  onClick={() => void handleMarkAsDelivered()}
                  disabled={isUpdating}
                  className="flex-1 py-3 bg-emerald-500 text-white rounded-full font-bold shadow-bakery hover:bg-emerald-600 transition-all text-xs uppercase tracking-widest disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : 'Mark Delivered'}
                </button>
              )}
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Orders;

