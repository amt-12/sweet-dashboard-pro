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
} from "lucide-react";

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
  <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF6E6]/60 border border-[#D4A373]/10 hover:border-[#D4A373]/30 hover:bg-[#FAF6E6] transition-all group">
    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4A373]/20 to-[#D4A373]/10 flex items-center justify-center text-[#D4A373] group-hover:from-[#D4A373]/30 transition-all">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold text-[#8D6E63]/80 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-[#1A2744] truncate">{value || "—"}</p>
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

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await api.orders.getAll();
        const r = res as any;
        let list: any[] = [];
        if (Array.isArray(r)) list = r;
        else if (r && r.orders) list = r.orders;
        else if (r && r.data) list = r.data;
        setOrders(list || []);
      } catch (err: unknown) {
        console.error(err);
        setError((err as Error)?.message || "Could not load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const handlePreview = (src: string) => setPreviewSrc(src);
  const closePreview = () => setPreviewSrc(null);

  const handleRemove = async (orderId: string) => {
    if (!confirm("Delete this custom order? This action cannot be undone.")) return;
    try {
      setDeletingId(orderId);
      await api.orders.delete(orderId);
      setOrders((prev) =>
        prev.filter((it) => (it as any)._id !== orderId && (it as any).id !== orderId)
      );
      setDeletingId(null);
    } catch (err) {
      console.error(err);
      setDeletingId(null);
      alert("Failed to delete order");
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
    <div className="space-y-8 animate-fade-in font-inter">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-playfair text-[#1A2744]">
            Custom Orders{" "}
            <span className="inline-block animate-bounce text-[#D4A373]">🎂</span>
          </h2>
          <p className="text-[#8D6E63] mt-1 font-medium">
            Review and manage customer cake customization requests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Order count badge */}
          {!loading && orders.length > 0 && (
            <div className="px-4 py-2 rounded-xl bg-[#1A2744]/5 border border-[#1A2744]/10 text-sm font-bold text-[#1A2744] flex items-center gap-2">
              <Cake size={16} className="text-[#D4A373]" />
              {orders.length} {orders.length === 1 ? "Order" : "Orders"}
            </div>
          )}
          <Link
            to="/admin/orders"
            className="px-5 py-2.5 rounded-xl bg-[#1A2744] text-[#F5ECD7] text-sm font-bold flex items-center gap-2 hover:bg-[#D4A373] hover:text-[#1A2744] transition-all duration-300 shadow-lg hover:shadow-xl group"
          >
            <ChevronRight size={16} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" />
            Back to Orders
          </Link>
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="bg-white rounded-2xl border border-[#D4A373]/20 shadow-sm p-16 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-[#D4A373]/20 border-t-[#D4A373] rounded-full animate-spin" />
          <p className="text-[#8D6E63] font-semibold animate-pulse">Loading custom orders...</p>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-600 font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && orders.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#D4A373]/20 shadow-sm p-16 flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D4A373]/20 to-[#D4A373]/5 flex items-center justify-center">
            <Cake size={36} className="text-[#D4A373]" />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold font-playfair text-[#1A2744]">No Custom Orders Yet</p>
            <p className="text-sm text-[#8D6E63] mt-1">
              Custom cake requests will appear here once customers submit them.
            </p>
          </div>
        </div>
      )}

      {/* ── Orders Grid ── */}
      {!loading && !error && orders.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {orders.map((o, idx) => {
            const it = o as any;
            const imageSrc = getImageSrc(it);
            const orderId = it._id || it.id;
            const isDeleting = deletingId === orderId;

            return (
              <div
                key={orderId || idx}
                className="bg-white rounded-2xl border border-[#D4A373]/20 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group relative"
              >
                {/* Top gradient accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4A373] via-[#F5ECD7] to-[#D4A373] opacity-70 group-hover:opacity-100 transition-opacity" />

                {/* ── Card Header ── */}
                <div className="relative bg-gradient-to-br from-[#1A2744] to-[#2c3e50] p-5 flex items-center justify-between gap-4">
                  {/* Decorative */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-tr-full" />

                  <div className="relative flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#D4A373]/20 flex items-center justify-center flex-shrink-0">
                      <Cake size={20} className="text-[#D4A373]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
                        Order ID
                      </p>
                      <p className="font-mono font-bold text-white text-sm leading-tight">
                        #{String(orderId || "—").slice(-8).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* Customer pill */}
                  <div className="relative flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10">
                    <div className="w-6 h-6 rounded-lg bg-[#D4A373]/30 flex items-center justify-center">
                      <User size={12} className="text-[#D4A373]" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-white/50 uppercase tracking-wider">Customer</p>
                      <p className="text-xs font-bold text-white">{it.name || "Unknown"}</p>
                    </div>
                  </div>

                  {/* Created date top-right */}
                  {it.createdAt && (
                    <div className="relative ml-auto">
                      <div className="flex items-center gap-1 text-[10px] text-white/50 font-medium">
                        <Clock size={10} />
                        {new Date(it.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Card Body ── */}
                <div className="p-5 flex flex-col md:flex-row gap-5">
                  {/* Image Section */}
                  <div className="w-full md:w-36 flex-shrink-0">
                    {imageSrc ? (
                      <button
                        onClick={() => handlePreview(imageSrc)}
                        className="w-full h-36 rounded-xl overflow-hidden border border-[#D4A373]/20 shadow-sm hover:shadow-md transition-all group/img relative"
                      >
                        <img
                          src={imageSrc}
                          alt="Design Reference"
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/30 transition-all flex items-center justify-center">
                          <Eye size={20} className="text-white opacity-0 group-hover/img:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    ) : (
                      <div className="w-full h-36 rounded-xl bg-[#FAF6E6] border border-[#D4A373]/10 flex flex-col items-center justify-center gap-2 text-[#8D6E63]">
                        <ImageIcon size={24} className="opacity-40" />
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">No Image</span>
                      </div>
                    )}

                    {/* Quick info below image */}
                    {it.mobile && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-[#5D4037] font-medium bg-[#FAF6E6] rounded-lg px-2 py-1.5">
                        <Phone size={11} className="text-[#D4A373]" />
                        {it.mobile}
                      </div>
                    )}
                  </div>

                  {/* Details Grid */}
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    {it.occasion && (
                      <DetailChip
                        icon={<Star size={14} />}
                        label="Occasion"
                        value={it.occasion}
                      />
                    )}
                    {(it.weight || it.servingCount) && (
                      <DetailChip
                        icon={<Package size={14} />}
                        label="Weight / Serving"
                        value={it.weight || it.servingCount}
                      />
                    )}
                    {it.flavor && (
                      <DetailChip
                        icon={<Sparkles size={14} />}
                        label="Flavor"
                        value={it.flavor}
                      />
                    )}
                    {it.shape && (
                      <DetailChip
                        icon={<Tag size={14} />}
                        label="Shape"
                        value={it.shape}
                      />
                    )}
                    {it.frosting && (
                      <DetailChip
                        icon={<Cake size={14} />}
                        label="Frosting"
                        value={it.frosting}
                      />
                    )}
                    {it.isEggless && (
                      <DetailChip
                        icon={<Leaf size={14} />}
                        label="Egg Preference"
                        value={it.isEggless === "eggless" ? "Eggless 🌱" : it.isEggless === "egg" ? "With Egg" : it.isEggless}
                      />
                    )}
                    {it.deliveryType && (
                      <DetailChip
                        icon={<Truck size={14} />}
                        label="Delivery"
                        value={it.deliveryType}
                      />
                    )}
                    {it.deliveryDate && (
                      <DetailChip
                        icon={<Calendar size={14} />}
                        label="Date & Time"
                        value={`${it.deliveryDate}${it.deliveryTime ? " @ " + it.deliveryTime : ""}`}
                      />
                    )}
                  </div>
                </div>

                {/* ── Design / Message note ── */}
                {(it.designTheme || it.message) && (
                  <div className="mx-5 mb-5 p-3 rounded-xl bg-gradient-to-r from-[#FAF6E6] to-[#FFF8F0] border border-[#D4A373]/15 flex gap-2">
                    <MessageSquare size={14} className="text-[#D4A373] flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-[#5D4037] font-medium leading-relaxed">
                      {it.designTheme || it.message}
                    </p>
                  </div>
                )}

                {/* Address */}
                {it.address && (
                  <div className="mx-5 mb-5 flex items-start gap-2">
                    <MapPin size={13} className="text-[#D4A373] flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-[#8D6E63] font-medium leading-relaxed">
                      {it.address}
                      {it.pincode ? ` – ${it.pincode}` : ""}
                    </p>
                  </div>
                )}

                {/* ── Footer Actions ── */}
                <div className="px-5 pb-5 flex items-center justify-between gap-3 border-t border-[#D4A373]/10 pt-4">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                      Custom Request
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/admin/customize-order?id=${orderId}`}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-[#D4A373] bg-[#D4A373]/10 hover:bg-[#D4A373] hover:text-white transition-all flex items-center gap-1.5 border border-[#D4A373]/20"
                    >
                      <Eye size={12} />
                      View
                    </Link>

                    <button
                      disabled={isDeleting}
                      onClick={() => handleRemove(orderId)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-all flex items-center gap-1.5 border border-red-100 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isDeleting ? (
                        <>
                          <div className="w-3 h-3 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                          Removing...
                        </>
                      ) : (
                        <>
                          <Trash2 size={12} />
                          Remove
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Image Preview Modal ── */}
      {previewSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={closePreview}
        >
          <div
            className="relative bg-white rounded-2xl p-4 shadow-2xl max-w-[90vw] max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closePreview}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#1A2744]/10 hover:bg-[#1A2744] hover:text-white text-[#1A2744] flex items-center justify-center transition-all"
            >
              <X size={16} />
            </button>
            <img
              src={previewSrc}
              alt="Design Reference Preview"
              className="max-w-full max-h-[80vh] object-contain rounded-xl"
            />
            <p className="text-center text-xs text-[#8D6E63] font-medium mt-3">Design Reference Image</p>
          </div>
        </div>
      )}
    </div>
  );
}
