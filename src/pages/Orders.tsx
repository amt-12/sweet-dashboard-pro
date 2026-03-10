import { Search, Eye, Filter, CheckCircle, Clock, XCircle, Truck } from "lucide-react";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setOrders, setLoading, setError } from "../store/slices/orderSlice";
import { api } from "../services/api";

const getStatusColor = (status: string) => {
  switch (status) {
    case "Delivered": return "bg-green-100 text-green-700 border-green-200";
    case "Processing": return "bg-blue-100 text-blue-700 border-blue-200";
    case "Pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "Cancelled": return "bg-red-100 text-red-700 border-red-200";
    default: return "bg-gray-100 text-gray-700";
  }
};

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
    <div className="space-y-6 animate-fade-in font-lora">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-dancing text-foreground">Order Management 📦</h2>
          <p className="text-muted-foreground">Track and manage customer orders.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-bakery shadow-sm border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search orders by ID or customer..." 
            className="w-full pl-9 pr-4 py-2 rounded-full bg-secondary text-sm outline-none focus:ring-2 focus:ring-chocolate/20 transition-all"
          />
        </div>
        <button className="p-2 bg-secondary rounded-full text-foreground hover:bg-secondary/80 transition-colors">
          <Filter size={18} />
        </button>
      </div>

      <div className="bakery-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary/50 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="p-4 pl-6">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="p-4 pl-6 text-foreground font-medium">{order.id}</td>
                  <td className="p-4 text-muted-foreground">{order.customerName}</td>
                  <td className="p-4 text-muted-foreground">{order.items}</td>
                  <td className="p-4 text-primary font-bold">${order.total.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">{order.date}</td>
                  <td className="p-4 pr-6 text-right">
                    <button className="p-2 hover:bg-primary/10 rounded-full text-primary transition-colors">
                      <Eye size={18} />
                    </button>
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
