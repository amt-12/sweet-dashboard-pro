import { Search, Eye, Filter, CheckCircle, Clock, XCircle, Truck, Package, ChefHat, Heart, ReceiptText } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setOrders, setLoading, setError } from "../store/slices/orderSlice";
import { api } from "../services/api";
import type { Order as OrderType } from "../types";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "../components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { fetchWithAuth } from "@/services/auth";

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
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [deliveryPartner, setDeliveryPartner] = useState('');
  const [deliveryPartnerPhone, setDeliveryPartnerPhone] = useState('');
  const [deliveryEstimatedTime, setDeliveryEstimatedTime] = useState('');
  const [deliveryPartners, setDeliveryPartners] = useState<any[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(false);
  
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
      _id: order._id || order.id,
      id: order._id || order.id,
      orderNumber: order.orderNumber || '',
      customerId: order.customerId,
      customerName: order.customerName,
      customerPhone: order.customerPhone || '',
      deliveryType: order.deliveryType || '',
      deliveryAddress: order.deliveryAddress || '',
      instructions: order.instructions || '',
      itemsRaw: Array.isArray(order.items) ? order.items : [],
      subtotal: order.subtotal ?? 0,
      deliveryFee: order.deliveryFee ?? 0,
      items: order.items?.map((item: any) => `${item.name} (x${item.quantity})`).join(', ') || 'N/A',
      total: order.totalAmount || 0,
      status: order.orderStatus || 'placed',
      date: new Date(order.createdAt).toLocaleDateString(),
      paymentStatus: order.paymentStatus || 'pending',
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      orderType: 'checkout',
    })) as OrderType[];
  };
  
  const normalizeCustomOrders = (orders: any[]): OrderType[] => {
    return orders.map(order => ({
      _id: order._id || order.id,
      id: order._id || order.id,
      orderNumber: order.orderNumber || '',
      customerId: order.customerId || '',
      customerName: order.name,
      customerPhone: order.phone || '',
      deliveryType: order.deliveryType || '',
      deliveryAddress: order.deliveryAddress || '',
      instructions: order.instructions || '',
      itemsRaw: Array.isArray(order.items) ? order.items : [],
      subtotal: order.subtotal ?? 0,
      deliveryFee: order.deliveryFee ?? 0,
      items: `${order.flavor} ${order.shape} cake - Weight: ${order.weight}`,
      total: 0, // Custom orders don't have total in this context
      status: order.orderStatus || 'placed',
      date: new Date(order.createdAt).toLocaleDateString(),
      paymentStatus: order.paymentStatus || 'pending',
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      orderType: 'custom',
    })) as OrderType[];
  };

  const loadDeliveryPartners = async () => {
    setLoadingPartners(true);
    try {
      const res = await fetchWithAuth('/api/admins');
      if (!res.ok) throw new Error('Failed to load delivery partners');
      const data = await res.json();
      const partners = (data.users || []).filter((admin: any) => 
        admin.role?.toLowerCase().includes('dilvery') || admin.role?.toLowerCase().includes('delivery')
      );
      setDeliveryPartners(partners);
    } catch (err: any) {
      console.warn('Failed to load delivery partners:', err.message);
      setDeliveryPartners([]);
    } finally {
      setLoadingPartners(false);
    }
  };

  const handleMarkAsDelivered = async () => {
    if (!selectedOrder) return;
    
    setIsUpdating(true);
    try {
      // Use the appropriate API endpoint based on order type
      if ((selectedOrder as any).orderType === 'custom') {
        await api.orders.updateStatus(selectedOrder.id, 'delivered');
      } else {
        await api.checkoutOrders.updateStatus(selectedOrder.id, 'delivered');
      }
      
      toast({
        title: "Success!",
        description: "Order marked as delivered",
      });
      
      // Refresh orders
      const [customizeOrders, checkoutOrders] = await Promise.all([
        api.orders.getAll().catch(() => []),
        api.checkoutOrders.getAll().catch(() => []),
      ]);
      const checkoutNormalized = normalizeCheckoutOrders(normalizeToArray(checkoutOrders) as any[]);
      const customNormalized = normalizeCustomOrders(normalizeToArray(customizeOrders) as any[]);
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

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    // If status is out_for_delivery, show the delivery modal instead
    if (newStatus === 'out_for_delivery') {
      setShowDeliveryModal(true);
      return;
    }

    setIsUpdating(true);
    try {
      const updateData: any = {};

      if ((selectedOrder as any).orderType === 'custom') {
        await api.orders.updateStatus(selectedOrder.id, newStatus, updateData);
      } else {
        await api.checkoutOrders.updateStatus(selectedOrder.id, newStatus, updateData);
      }

      toast({
        title: "Success!",
        description: `Order status updated to ${newStatus}`,
      });

      // Reset form
      setShowStatusForm(false);
      setNewStatus('');
      setDeliveryPartner('');
      setDeliveryPartnerPhone('');
      setDeliveryEstimatedTime('');

      // Refresh orders
      const [customizeOrders, checkoutOrders] = await Promise.all([
        api.orders.getAll().catch(() => []),
        api.checkoutOrders.getAll().catch(() => []),
      ]);
      const checkoutNormalized = normalizeCheckoutOrders(normalizeToArray(checkoutOrders) as any[]);
      const customNormalized = normalizeCustomOrders(normalizeToArray(customizeOrders) as any[]);
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

  const selectDeliveryPartner = (partner: any) => {
    setDeliveryPartner(partner.name || partner.email || '');
    setDeliveryPartnerPhone(partner.phone || '');
  };

  const handleDeliveryPartnerSubmit = async () => {
    if (!deliveryPartner || !deliveryPartnerPhone) {
      toast({
        title: "Error",
        description: "Delivery partner name and phone are required",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const updateData = {
        deliveryPartner,
        deliveryPartnerPhone,
        deliveryEstimatedTime: deliveryEstimatedTime || undefined,
      };

      if ((selectedOrder as any).orderType === 'custom') {
        await api.orders.updateStatus(selectedOrder.id, 'out_for_delivery', updateData);
      } else {
        await api.checkoutOrders.updateStatus(selectedOrder.id, 'out_for_delivery', updateData);
      }

      toast({
        title: "Success!",
        description: "Order marked as out for delivery",
      });

      // Reset all states
      setShowDeliveryModal(false);
      setShowStatusForm(false);
      setNewStatus('');
      setDeliveryPartner('');
      setDeliveryPartnerPhone('');
      setDeliveryEstimatedTime('');

      // Refresh orders
      const [customizeOrders, checkoutOrders] = await Promise.all([
        api.orders.getAll().catch(() => []),
        api.checkoutOrders.getAll().catch(() => []),
      ]);
      const checkoutNormalized = normalizeCheckoutOrders(normalizeToArray(checkoutOrders) as any[]);
      const customNormalized = normalizeCustomOrders(normalizeToArray(customizeOrders) as any[]);
      const combined = [...customNormalized, ...checkoutNormalized];
      dispatch(setOrders(combined));
      setSelectedOrder(null);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to mark order as out for delivery",
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
  const selectedOrderData = selectedOrder as any;

  useEffect(() => {
    const fetchOrders = async () => {
      dispatch(setLoading(true));
      try {
        const [customizeOrders, checkoutOrders] = await Promise.all([
          api.orders.getAll().catch(() => []),
          api.checkoutOrders.getAll().catch(() => []),
        ]);
        const checkoutNormalized = normalizeCheckoutOrders(normalizeToArray(checkoutOrders) as any[]);
        const customNormalized = normalizeCustomOrders(normalizeToArray(customizeOrders) as any[]);
        const combined = [...customNormalized, ...checkoutNormalized];
        dispatch(setOrders(combined));
      } catch (err) {
        dispatch(setError("Failed to fetch orders"));
      } finally {
        dispatch(setLoading(false)); }
    };
    fetchOrders();
    loadDeliveryPartners();
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
                   {Array.isArray(selectedOrderData?.itemsRaw) && selectedOrderData.itemsRaw.length > 0 && (
                     <div className="mt-4 space-y-2">
                       <p className="text-[10px] font-bold text-chocolate/40 uppercase tracking-widest">Items Breakdown</p>
                       <div className="space-y-2">
                         {selectedOrderData.itemsRaw.map((item: any, index: number) => (
                           <div key={`${item?._id || item?.name || 'item'}-${index}`} className="flex items-center justify-between text-xs bg-[#FAFBFD] border border-chocolate/5 rounded-xl px-3 py-2">
                             <span className="text-chocolate font-semibold">{item?.name || item?.productName || 'Item'}</span>
                             <span className="text-chocolate/70 font-medium">Qty: {item?.quantity ?? 1}</span>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}
                   <div className="mt-6 pt-6 border-t border-chocolate/5 flex justify-between items-center">
                      <span className="text-sm font-bold text-chocolate-light">Grand Total</span>
                      <span className="text-2xl font-bold text-strawberry">₹{(selectedOrder.total || 0).toLocaleString()}</span>
                   </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-sm font-bold text-chocolate uppercase tracking-widest ml-1">
                  <ReceiptText size={16} className="text-strawberry" />
                  Full Order Data
                </h4>
                <div className="bg-white rounded-3xl p-6 border border-chocolate/5 shadow-bakery space-y-3">
                 
                  <div className="flex justify-between text-xs font-medium gap-4"><span className="text-chocolate/40">orderNumber</span><span className="text-chocolate font-mono break-all text-right">{selectedOrderData?.orderNumber || 'N/A'}</span></div>
                 
                  <div className="flex justify-between text-xs font-medium gap-4"><span className="text-chocolate/40">customerName</span><span className="text-chocolate text-right">{selectedOrderData?.customerName || 'N/A'}</span></div>
                  <div className="flex justify-between text-xs font-medium gap-4"><span className="text-chocolate/40">customerPhone</span><span className="text-chocolate text-right">{selectedOrderData?.customerPhone || 'N/A'}</span></div>
                  <div className="flex justify-between text-xs font-medium gap-4"><span className="text-chocolate/40">deliveryType</span><span className="text-chocolate text-right">{selectedOrderData?.deliveryType || 'N/A'}</span></div>
                  <div className="flex justify-between text-xs font-medium gap-4"><span className="text-chocolate/40">deliveryAddress</span><span className="text-chocolate break-words text-right">{selectedOrderData?.deliveryAddress || 'N/A'}</span></div>
                  <div className="flex justify-between text-xs font-medium gap-4"><span className="text-chocolate/40">instructions</span><span className="text-chocolate break-words text-right">{selectedOrderData?.instructions || 'N/A'}</span></div>
                  <div className="flex justify-between text-xs font-medium gap-4"><span className="text-chocolate/40">items</span><span className="text-chocolate text-right">{Array.isArray(selectedOrderData?.itemsRaw) ? `${selectedOrderData.itemsRaw.length} item(s)` : 'N/A'}</span></div>
                  <div className="flex justify-between text-xs font-medium gap-4"><span className="text-chocolate/40">subtotal</span><span className="text-chocolate text-right">₹{Number(selectedOrderData?.subtotal || 0).toLocaleString()}</span></div>
                  <div className="flex justify-between text-xs font-medium gap-4"><span className="text-chocolate/40">deliveryFee</span><span className="text-chocolate text-right">₹{Number(selectedOrderData?.deliveryFee || 0).toLocaleString()}</span></div>
                  <div className="flex justify-between text-xs font-medium gap-4"><span className="text-chocolate/40">totalAmount</span><span className="text-chocolate text-right">₹{Number(selectedOrderData?.total || 0).toLocaleString()}</span></div>
                  <div className="flex justify-between text-xs font-medium gap-4"><span className="text-chocolate/40">paymentStatus</span><span className="text-chocolate text-right">{selectedOrderData?.paymentStatus || 'N/A'}</span></div>
                  <div className="flex justify-between text-xs font-medium gap-4"><span className="text-chocolate/40">orderStatus</span><span className="text-chocolate text-right">{selectedOrderData?.status || 'N/A'}</span></div>
                  <div className="flex justify-between text-xs font-medium gap-4"><span className="text-chocolate/40">createdAt</span><span className="text-chocolate text-right">{selectedOrderData?.createdAt ? new Date(selectedOrderData.createdAt).toLocaleString() : 'N/A'}</span></div>
                  <div className="flex justify-between text-xs font-medium gap-4"><span className="text-chocolate/40">updatedAt</span><span className="text-chocolate text-right">{selectedOrderData?.updatedAt ? new Date(selectedOrderData.updatedAt).toLocaleString() : 'N/A'}</span></div>
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
                      <span className="text-chocolate">{selectedOrderData?.createdAt ? new Date(selectedOrderData.createdAt).toLocaleString() : selectedOrder.date}</span>
                   </div>
                   <div className="flex justify-between text-xs font-medium">
                      <span className="text-chocolate/40">Last updated</span>
                      <span className="text-chocolate">{selectedOrderData?.updatedAt ? new Date(selectedOrderData.updatedAt).toLocaleString() : 'N/A'}</span>
                   </div>
                </div>
              </div>
            </div>
          )}

          <SheetFooter className="p-8 bg-white border-t border-chocolate/5 flex flex-col gap-4">
            {showStatusForm ? (
              <div className="space-y-4 w-full">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-chocolate/40 uppercase tracking-widest">Select Status</label>
                  <select 
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-chocolate/10 rounded-lg focus:border-strawberry outline-none bg-white text-sm font-medium"
                  >
                    <option value="">-- Select --</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="preparing">Preparing</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      setShowStatusForm(false);
                      setNewStatus('');
                      setDeliveryPartner('');
                      setDeliveryPartnerPhone('');
                      setDeliveryEstimatedTime('');
                    }}
                    className="flex-1 py-2 bg-chocolate/10 text-chocolate rounded-full font-bold text-xs uppercase tracking-widest hover:bg-chocolate/20 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => void handleStatusUpdate()}
                    disabled={isUpdating || !newStatus}
                    className="flex-1 py-2 bg-chocolate text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-strawberry transition-all disabled:opacity-50"
                  >
                    {isUpdating ? 'Processing...' : 'Next'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 py-3 bg-chocolate/10 text-chocolate rounded-full font-bold shadow-bakery hover:bg-chocolate/20 transition-all text-xs uppercase tracking-widest"
                >
                  Close
                </button>
                {selectedOrder?.status !== 'delivered' && (
                  <>
                    <button 
                      onClick={() => setShowStatusForm(true)}
                      className="flex-1 py-3 bg-chocolate text-white rounded-full font-bold shadow-bakery hover:bg-strawberry transition-all text-xs uppercase tracking-widest"
                    >
                      Update Status
                    </button>
                    <button 
                      onClick={() => void handleMarkAsDelivered()}
                      disabled={isUpdating}
                      className="flex-1 py-3 bg-emerald-500 text-white rounded-full font-bold shadow-bakery hover:bg-emerald-600 transition-all text-xs uppercase tracking-widest disabled:opacity-50"
                    >
                      {isUpdating ? 'Updating...' : 'Mark Delivered'}
                    </button>
                  </>
                )}
              </div>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={showDeliveryModal} onOpenChange={(open) => !open && setShowDeliveryModal(false)}>
        <SheetContent side="right" className="flex flex-col h-full bg-[#FAFBFD] p-0 border-l border-chocolate/10">
          <SheetHeader className="p-8 bg-gradient-to-br from-chocolate via-chocolate/90 to-strawberry relative overflow-hidden">
             <div className="absolute top-0 right-0 w-40 h-40 bg-strawberry/20 rounded-full -mr-20 -mt-20 blur-3xl" />
             <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 blur-2xl" />
             <div className="relative flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 text-white rounded-2xl flex items-center justify-center shadow-lg border border-white/20">
                  <Truck size={32} className="animate-bounce" />
                </div>
                <div>
                  <SheetTitle className="text-3xl font-bold text-white font-dancing">
                    Assign Delivery
                  </SheetTitle>
                  <SheetDescription className="text-white/80 font-medium">
                    Set delivery partner details for order <span className="text-yellow-100 font-bold">#{selectedOrder?.id}</span>
                  </SheetDescription>
                </div>
             </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            <div className="bg-gradient-to-br from-strawberry/5 via-white to-orange-50/5 rounded-3xl p-8 border border-strawberry/10 shadow-bakery">
              <div className="space-y-2 mb-6">
                <h3 className="text-xs font-bold text-chocolate/40 uppercase tracking-widest">Order Summary</h3>
                <p className="text-sm text-chocolate font-medium italic">"{selectedOrder?.items}"</p>
              </div>
              <div className="h-1 bg-chocolate/5 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-gradient-to-r from-chocolate via-strawberry to-orange-400 w-4/5" />
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-chocolate/5">
                <span className="text-xs font-bold text-chocolate/40 uppercase tracking-widest">Customer</span>
                <span className="text-sm font-bold text-chocolate">{selectedOrder?.customerName}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-chocolate/40 uppercase tracking-widest ml-1">Delivery Partner Details</h4>
              
              {deliveryPartners.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-chocolate uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1 h-4 bg-orange-400 rounded-full" />
                    Select from Team <span className="text-orange-400 font-medium">(Optional)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                    {deliveryPartners.map((partner) => (
                      <button
                        key={partner._id}
                        type="button"
                        onClick={() => selectDeliveryPartner(partner)}
                        className={`p-3 rounded-xl border-2 transition-all text-left ${
                          deliveryPartner === (partner.name || partner.email)
                            ? 'bg-chocolate/10 border-chocolate'
                            : 'bg-white border-chocolate/10 hover:border-orange-300'
                        }`}
                      >
                        <p className="text-xs font-bold text-chocolate">{partner.name || partner.email}</p>
                        {partner.phone && (
                          <p className="text-[10px] text-chocolate/60 font-mono">{partner.phone}</p>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-chocolate/50 font-medium ml-1">Or enter details manually below</p>
                </div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="partnerName" className="text-xs font-bold text-chocolate uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1 h-4 bg-strawberry rounded-full" />
                  Partner Name <span className="text-strawberry">*</span>
                </label>
                <input 
                  id="partnerName"
                  type="text" 
                  placeholder="e.g., Rajesh Kumar"
                  value={deliveryPartner}
                  onChange={(e) => setDeliveryPartner(e.target.value)}
                  className="w-full px-5 py-3 border-2 border-chocolate/10 rounded-2xl focus:border-strawberry outline-none bg-white text-sm font-medium text-chocolate placeholder:text-chocolate/30 transition-all hover:border-chocolate/20"
                />
                <p className="text-xs text-chocolate/50 font-medium ml-1">Full name of the delivery partner</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="partnerPhone" className="text-xs font-bold text-chocolate uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1 h-4 bg-strawberry rounded-full" />
                  Partner Phone <span className="text-strawberry">*</span>
                </label>
                <input 
                  id="partnerPhone"
                  type="tel" 
                  placeholder="e.g., +91-9876543210"
                  value={deliveryPartnerPhone}
                  onChange={(e) => setDeliveryPartnerPhone(e.target.value)}
                  className="w-full px-5 py-3 border-2 border-chocolate/10 rounded-2xl focus:border-strawberry outline-none bg-white text-sm font-medium text-chocolate placeholder:text-chocolate/30 transition-all hover:border-chocolate/20"
                />
                <p className="text-xs text-chocolate/50 font-medium ml-1">Contact number for communication</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="estimatedTime" className="text-xs font-bold text-chocolate uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1 h-4 bg-orange-400 rounded-full" />
                  Estimated Delivery Time <span className="text-orange-400 font-medium">(Optional)</span>
                </label>
                <input 
                  id="estimatedTime"
                  type="text" 
                  placeholder="e.g., 02:30 PM or 2 hours"
                  value={deliveryEstimatedTime}
                  onChange={(e) => setDeliveryEstimatedTime(e.target.value)}
                  className="w-full px-5 py-3 border-2 border-chocolate/10 rounded-2xl focus:border-orange-400 outline-none bg-white text-sm font-medium text-chocolate placeholder:text-chocolate/30 transition-all hover:border-chocolate/20"
                />
                <p className="text-xs text-chocolate/50 font-medium ml-1">Estimated time for delivery arrival</p>
              </div>
            </div>

            <div className="bg-chocolate/5 rounded-2xl p-5 border border-chocolate/10">
              <p className="text-xs text-chocolate/60 font-medium leading-relaxed">
                <span className="font-bold text-chocolate">💡 Tip:</span> Ensure all delivery partner details are accurate to maintain smooth communication and successful delivery.
              </p>
            </div>
          </div>

          <SheetFooter className="p-8 bg-white border-t border-chocolate/5 flex flex-col gap-3">
            <button 
              onClick={() => {
                setShowDeliveryModal(false);
                setShowStatusForm(false);
                setNewStatus('');
                setDeliveryPartner('');
                setDeliveryPartnerPhone('');
                setDeliveryEstimatedTime('');
              }}
              className="w-full py-3 bg-chocolate/10 text-chocolate rounded-full font-bold text-xs uppercase tracking-widest hover:bg-chocolate/20 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={() => void handleDeliveryPartnerSubmit()}
              disabled={isUpdating || !deliveryPartner || !deliveryPartnerPhone}
              className="w-full py-3 bg-gradient-to-r from-chocolate to-strawberry text-white rounded-full font-bold text-xs uppercase tracking-widest hover:shadow-bakery transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Truck size={16} />
              {isUpdating ? 'Assigning Partner...' : 'Confirm & Send Out for Delivery'}
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Orders;