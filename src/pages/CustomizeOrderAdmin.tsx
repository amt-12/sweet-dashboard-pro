import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { api } from "@/services/api";
import {
  Trash2,
  Cake,
  User,
  Phone,
  Calendar,
  Clock,
  MapPin,
  Package,
  Sparkles,
  ChevronRight,
  Image as ImageIcon,
  X,
  Eye,
  Tag,
  Star,
  Leaf,
  Truck,
  MessageSquare,
  RefreshCw,
  Hash,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";

type Order = {
  _id?: string;
  id?: string | number;
  name?: string;
  mobile?: string;
  occasion?: string;
  weight?: string;
  servingCount?: string;
  flavor?: string;
  shape?: string;
  designTheme?: string;
  message?: string;
  frosting?: string;
  isEggless?: string;
  deliveryType?: string;
  deliveryDate?: string;
  deliveryTime?: string;
  address?: string;
  pincode?: string;
  image?: string | null;
  createdAt?: string;
};

const DetailChip = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
}) => (
  <div className="flex items-start gap-4 p-4 rounded-[1.5rem] bg-white/40 border border-chocolate/5 hover:border-strawberry/20 hover:bg-white/80 transition-all group shadow-sm hover:shadow-bakery">
    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-chocolate/5 flex items-center justify-center text-chocolate group-hover:text-strawberry transition-all">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[9px] font-bold text-chocolate/30 uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className="text-sm font-bold text-chocolate truncate italic">{value || "—"}</p>
    </div>
  </div>
);

export default function CustomizeOrderAdmin() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const id = params.get("id");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.orders.getAll();
      const r = res as any;
      let list: any[] = [];
      if (Array.isArray(r)) list = r;
      else if (r && r.orders) list = r.orders;
      else if (r && r.data) list = r.data;
      setOrders(list || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [id]);

  const handlePreview = (src: string) => setPreviewSrc(src);
  const closePreview = () => setPreviewSrc(null);

  const handleRemove = async (orderId: string) => {
    if (!confirm("Delete this custom request permanently?")) return;
    try {
      setDeletingId(orderId);
      await api.orders.delete(orderId);
      setOrders((prev) =>
        prev.filter((it) => (it as any)._id !== orderId && (it as any).id !== orderId)
      );
      toast.success('Custom request removed.');
      setDeletingId(null);
    } catch (err: any) {
      toast.error('Failed to remove request');
      setDeletingId(null);
    }
  };

  const getImageSrc = (it: any): string | null => {
    const img = String(it.image || "");
    if (!img) return null;
    if (img.startsWith("data:")) return img;
    if (img.startsWith("http")) return img;
    const normalized = img.replace(/\\/g, "/");
    if (normalized.startsWith("/")) return normalized;
    if (normalized.startsWith("uploads/")) return `/${normalized}`;
    return `/uploads/${normalized}`;
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 font-lora pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold font-dancing text-chocolate">Custom Requests</h2>
          <p className="text-sm text-chocolate-light font-medium mt-1">
            Review artistic cake customization requests from your patrons.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/admin/orders"
            className="px-6 py-3 bg-white text-chocolate border border-chocolate/10 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-chocolate/5 transition-all shadow-sm"
          >
            <ArrowLeft size={16} />
            Standard Orders
          </Link>
          <button 
            onClick={fetchOrders}
            className="p-3 bg-white border border-chocolate/10 rounded-full text-chocolate hover:bg-strawberry/5 transition-all shadow-sm group"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2rem] shadow-bakery border border-chocolate/5 flex items-center justify-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-chocolate text-white flex items-center justify-center shadow-bakery transform rotate-3">
            <Cake size={32} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-chocolate/40 uppercase tracking-widest mb-1 ml-1">Total Requests</p>
            <h3 className="text-3xl font-bold font-playfair text-chocolate">{orders.length}</h3>
          </div>
        </div>
        <div className="md:col-span-2 bg-[#F5ECD7]/30 border border-[#D4A373]/10 rounded-[2rem] p-8 flex items-center">
            <p className="text-sm text-chocolate-light font-medium italic leading-relaxed">
              Every custom cake is a story waiting to be told. Each request represents a special moment in your patron's life. Handle with artistic care.
            </p>
        </div>
      </div>

      {loading && (
        <div className="py-24 text-center">
          <RefreshCw className="w-12 h-12 text-chocolate/20 animate-spin mx-auto" />
          <p className="text-chocolate-light mt-4 font-medium italic">Preparing customized requests...</p>
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="bg-white/80 backdrop-blur-lg rounded-[2.5rem] p-24 text-center border border-chocolate/5 shadow-bakery">
          <div className="w-24 h-24 bg-chocolate/5 rounded-full flex items-center justify-center mx-auto text-chocolate/10 mb-8">
            <Sparkles size={48} />
          </div>
          <h3 className="text-2xl font-bold font-playfair text-chocolate">No artistic requests found.</h3>
          <p className="text-chocolate-light font-medium italic mt-2">When patrons dream up designs, you'll see them here.</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {orders.map((o, idx) => {
          const it = o as any;
          const imageSrc = getImageSrc(it);
          const orderId = it._id || it.id;
          const isDeleting = deletingId === orderId;

          return (
            <div key={orderId || idx} className="group relative bg-white/80 backdrop-blur-md rounded-[3rem] p-10 border border-chocolate/5 shadow-bakery hover:shadow-bakery-lg transition-all duration-500 overflow-hidden flex flex-col h-full">
              <div className="absolute top-0 right-0 w-64 h-64 bg-strawberry/5 rounded-full -mr-32 -mt-32 blur-3xl transition-all group-hover:bg-strawberry/10" />
              
              <div className="flex flex-col md:flex-row gap-10 relative z-10 flex-1">
                <div className="w-full md:w-48 flex-shrink-0 space-y-6">
                  {imageSrc ? (
                    <button
                      onClick={() => handlePreview(imageSrc)}
                      className="w-full h-48 rounded-[2rem] overflow-hidden border border-chocolate/10 shadow-bakery hover:shadow-bakery-lg transition-all group/img relative transform -rotate-3 group-hover:rotate-0"
                    >
                      <img src={imageSrc} alt="Inspiration" className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-all flex items-center justify-center">
                        <Eye size={24} className="text-white opacity-0 group-hover/img:opacity-100 transform translate-y-4 group-hover/img:translate-y-0 transition-all duration-300" />
                      </div>
                    </button>
                  ) : (
                    <div className="w-full h-48 rounded-[2rem] bg-chocolate/5 border border-chocolate/5 flex flex-col items-center justify-center gap-3 text-chocolate/20 transform rotate-3">
                      <ImageIcon size={40} className="opacity-20" />
                      <span className="text-[10px] font-bold uppercase tracking-widest italic">No Reference</span>
                    </div>
                  )}

                  <div className="p-6 bg-white rounded-2xl border border-chocolate/5 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 text-chocolate">
                        <div className="w-8 h-8 rounded-lg bg-chocolate flex items-center justify-center text-[#F5ECD7] font-bold text-[10px]">
                            {it.name?.charAt(0) || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-chocolate/20">Patron</p>
                            <p className="text-xs font-bold truncate italic">{it.name || "Unknown"}</p>
                        </div>
                    </div>
                    {it.mobile && (
                        <div className="flex items-center gap-3 text-chocolate">
                            <div className="w-8 h-8 rounded-lg bg-strawberry/10 flex items-center justify-center text-strawberry">
                                <Phone size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-chocolate/20">Contact</p>
                                <p className="text-xs font-bold truncate italic">{it.mobile}</p>
                            </div>
                        </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Hash size={14} className="text-strawberry/40" />
                            <span className="text-[10px] font-mono font-bold text-chocolate/30 uppercase tracking-[0.2em]">
                                RQ-{String(orderId || "—").slice(-8).toUpperCase()}
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold font-playfair text-chocolate group-hover:text-strawberry transition-colors capitalize italic">
                            {it.occasion || "Special Occasion"}
                        </h3>
                    </div>
                    {it.createdAt && (
                        <div className="text-right">
                             <p className="text-[9px] font-bold text-chocolate/40 uppercase tracking-widest">Received</p>
                             <p className="text-[10px] font-bold text-chocolate italic">
                                {new Date(it.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                             </p>
                        </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 flex-1">
                    {it.flavor && (
                      <DetailChip icon={<Sparkles size={16} />} label="Flavor" value={it.flavor} />
                    )}
                    {(it.weight || it.servingCount) && (
                      <DetailChip icon={<Package size={16} />} label="Size" value={it.weight || it.servingCount} />
                    )}
                    {it.shape && (
                      <DetailChip icon={<Tag size={16} />} label="Artistic Shape" value={it.shape} />
                    )}
                    {it.isEggless && (
                      <DetailChip icon={<Leaf size={16} />} label="Dietary" value={it.isEggless === "eggless" ? "Eggless 🌱" : "Includes Egg"} />
                    )}
                    {it.deliveryDate && (
                      <DetailChip icon={<Calendar size={16} />} label="Expected By" value={`${it.deliveryDate}${it.deliveryTime ? " @ " + it.deliveryTime : ""}`} />
                    )}
                    {it.deliveryType && (
                      <DetailChip icon={<Truck size={16} />} label="Mode" value={it.deliveryType} />
                    )}
                  </div>
                </div>
              </div>

              {(it.designTheme || it.message || it.address) && (
                <div className="mt-8 space-y-4 relative z-10">
                   {(it.designTheme || it.message) && (
                     <div className="p-8 bg-[#FAF6E6]/60 rounded-[2.5rem] border border-chocolate/5 relative overflow-hidden group/note">
                        <MessageSquare size={16} className="absolute right-6 top-6 text-chocolate/5 group-hover/note:text-strawberry/20 transition-colors" />
                        <p className="text-[10px] font-bold text-chocolate/30 uppercase tracking-[0.2em] mb-4">Artistic Notes</p>
                        <p className="text-sm text-chocolate leading-relaxed italic font-medium">
                            "{it.designTheme || it.message}"
                        </p>
                     </div>
                   )}
                   {it.address && (
                     <div className="flex items-start gap-3 px-8 text-chocolate/40">
                        <MapPin size={14} className="shrink-0 mt-0.5 text-strawberry/40" />
                        <p className="text-[10px] font-bold uppercase tracking-widest italic leading-loose">
                            To be delivered to: {it.address}{it.pincode ? ` (${it.pincode})` : ""}
                        </p>
                     </div>
                   )}
                </div>
              )}

              <div className="mt-10 pt-10 border-t border-chocolate/5 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full border border-green-100 text-[9px] font-bold uppercase tracking-widest shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Active Request
                </div>
                <div className="flex gap-4">
                    <button 
                         disabled={isDeleting}
                         onClick={() => handleRemove(orderId)}
                         className="px-8 py-3 bg-white border border-red-100 text-red-500 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isDeleting ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        {isDeleting ? "Removing..." : "Remove"}
                    </button>
                    <Link 
                        to={`/admin/customize-order?id=${orderId}`}
                        className="px-8 py-3 bg-chocolate text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-strawberry transition-all shadow-bakery flex items-center gap-2 active:scale-95"
                    >
                        <Eye size={14} />
                        View Details
                    </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {previewSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-10 bg-black/80 backdrop-blur-lg animate-in fade-in" onClick={closePreview}>
          <div className="relative max-w-5xl max-h-full bg-white rounded-[3rem] p-4 shadow-2xl overflow-hidden group" onClick={(e) => e.stopPropagation()}>
            <button onClick={closePreview} className="absolute top-8 right-8 w-12 h-12 rounded-full bg-black/10 hover:bg-black text-white flex items-center justify-center transition-all z-10 shadow-lg">
              <X size={24} />
            </button>
            <img src={previewSrc} alt="Preview" className="max-w-full max-h-[80vh] object-contain rounded-[2.5rem]" />
            <div className="absolute bottom-0 left-0 w-full p-10 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white text-xl font-dancing font-bold text-center tracking-widest">Reference Inspiration</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
