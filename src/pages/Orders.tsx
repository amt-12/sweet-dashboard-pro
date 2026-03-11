import { Search, Eye, Filter, CheckCircle, Clock, XCircle, Truck, Package, ChefHat, AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setOrders, setLoading, setError } from "../store/slices/orderSlice";
import { api } from "../services/api";

const getStatusColor = (status: string) => {
    // Basic status mapping, falling back for custom statuses if needed
    if (status === "Delivered" || status === "Completed") return "bg-green-100/50 text-green-700 border-green-200";
    if (status === "Processing" || status === "Preparing") return "bg-blue-100/50 text-blue-700 border-blue-200";
    if (status === "Pending") return "bg-yellow-100/50 text-yellow-700 border-yellow-200";
    if (status === "Cancelled") return "bg-red-100/50 text-red-700 border-red-200";
    if (status === "Ready") return "bg-purple-100/50 text-purple-700 border-purple-200";
    return "bg-gray-100 text-gray-700";
};

const getStatusIcon = (status: string) => {
    if (status === "Delivered" || status === "Completed") return <CheckCircle size={12} />;
    if (status === "Processing" || status === "Preparing") return <ChefHat size={12} />;
    if (status === "Pending") return <Clock size={12} />;
    if (status === "Cancelled") return <XCircle size={12} />;
    if (status === "Ready") return <Package size={12} />;
    return <Truck size={12} />; // Default icon
}

const Orders = () => {
  const dispatch = useAppDispatch();
  const { orders, loading, error } = useAppSelector((state) => state.orders);

  useEffect(() => {
    const fetchOrders = async () => {
      dispatch(setLoading(true));
      try {
        const data = await api.orders.getAll();
        dispatch(setOrders(data));
      } catch (err) {
        dispatch(setError("Failed to fetch orders"));
      } finally {
        dispatch(setLoading(false));
      }
    };
    
    fetchOrders();
  }, [dispatch]);

  if (loading) return <div className="p-8 text-center text-secondary-foreground font-lora">Loading orders... 🚚</div>;
  if (error) return <div className="p-8 text-center text-destructive font-lora">Error: {error}</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-playfair text-[#1A2744]">Order Management <span className="inline-block animate-bounce">📦</span></h2>
          <p className="text-[#8D6E63] mt-1 font-lora">Track and manage customer orders efficiently.</p>
        </div>
        <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-[#D4A373] text-white rounded-full font-bold shadow-md hover:bg-[#c49265] transition-all flex items-center gap-2">
                <ChefHat size={18} />
                New Order
            </button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-[#D4A373]/20">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4A373] w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search orders by ID, customer, or items..." 
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#F5ECD7]/30 text-[#1A2744] outline-none focus:ring-2 focus:ring-[#D4A373]/50 transition-all placeholder:text-[#8D6E63]/60 font-lora"
          />
        </div>
        <button className="p-3 bg-[#F5ECD7]/30 rounded-xl text-[#8D6E63] hover:bg-[#D4A373] hover:text-white transition-all shadow-sm border border-[#D4A373]/10">
          <Filter size={20} />
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#D4A373]/20 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F5ECD7]/30 text-[#8D6E63] font-bold uppercase tracking-wider text-xs border-b border-[#D4A373]/20">
              <tr>
                <th className="p-5 pl-6">Order ID</th>
                <th className="p-5">Customer</th>
                <th className="p-5">Items</th>
                <th className="p-5">Total</th>
                <th className="p-5">Status</th>
                <th className="p-5">Date</th>
                <th className="p-5 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4A373]/10">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-[#F5ECD7]/20 transition-colors group">
                  <td className="p-5 pl-6 text-[#1A2744] font-bold font-mono text-sm">{order.id}</td>
                  <td className="p-5">
                      <div className="font-medium text-[#1A2744]">{order.customerName}</div>
                  </td>
                  <td className="p-5 text-[#6D4C41] text-sm max-w-[200px] truncate" title={order.items}>{order.items}</td>
                  <td className="p-5 text-[#D4A373] font-bold text-base">${order.total.toFixed(2)}</td>
                  <td className="p-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </td>
                  <td className="p-5 text-[#8D6E63] text-sm tabular-nums">{order.date}</td>
                  <td className="p-5 pr-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-[#D4A373]/10 rounded-full text-[#D4A373] transition-colors" title="View Details">
                        <Eye size={18} />
                        </button>
                        <button className="p-2 hover:bg-red-50 rounded-full text-red-400 transition-colors" title="Cancel Order">
                        <XCircle size={18} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
           {orders.length === 0 && (
            <div className="text-center p-8 text-muted-foreground">No orders found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
