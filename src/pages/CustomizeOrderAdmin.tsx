import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { api } from "@/services/api";
import { Trash2 } from "lucide-react";

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
};

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
      setOrders((prev) => prev.filter((it) => (it as any)._id !== orderId && (it as any).id !== orderId));
      setDeletingId(null);
    } catch (err) {
      console.error(err);
      setDeletingId(null);
      alert("Failed to delete order");
    }
  };

  // If no specific id provided, we attempt to show the latest order from the API.
  // If none found, UI below will display 'No order found'

  return (
    <div className="min-h-screen bg-[#FFF8F0] font-lora">
      <Navbar />
      <main className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-playfair font-bold text-[#1A2744]">Customize Order Details</h1>
          <Link to="/admin/orders" className="text-sm text-[#8D6E63] hover:text-[#D4A373]">Back to Orders</Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#D4A373]/20 shadow-sm">
          {loading && <div className="p-6">Loading...</div>}
          {error && <div className="p-6 text-red-500">Error: {error}</div>}
          {!loading && !error && orders.length > 0 ? (
            <div className="flex flex-col divide-y divide-[#EFE3D5] space-y-4">
              {orders.map((o, idx) => {
                const it = o as any;
                const imageSrc = (() => {
                  const img = String(it.image || "");
                  if (!img) return null;
                  if (img.startsWith("data:")) return img;
                  if (img.startsWith("http")) return img;
                  const normalized = img.replace(/\\/g, "/");
                  if (normalized.startsWith("/")) return normalized;
                  if (normalized.startsWith("uploads/")) return `/${normalized}`;
                  return `/uploads/${normalized}`;
                })();

                return (
                  <div key={it._id || it.id || idx} className="w-full bg-white rounded-2xl border border-[#E7D9C7] shadow-sm hover:shadow-lg transition transform hover:-translate-y-0.5 p-4 md:p-6 flex flex-col md:flex-row gap-4 items-start">
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs text-[#8D6E63]">Order</div>
                          <div className="font-mono font-bold text-[#1A2744] text-lg">{it._id || it.id}</div>
                          <div className="text-xs text-[#5D4037] mt-1">{it.createdAt ? new Date(it.createdAt).toLocaleString() : ''}</div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs text-[#8D6E63]">Customer</div>
                          <div className="font-bold text-[#1A2744]">{it.name || '—'}</div>
                          <div className="text-xs text-[#5D4037]">{it.mobile || '—'}</div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-[#5D4037]">
                        <div><strong className="text-[#8D6E63]">Occasion:</strong> {it.occasion || '—'}</div>
                        <div><strong className="text-[#8D6E63]">Weight:</strong> {it.weight || it.servingCount || '—'}</div>
                        <div><strong className="text-[#8D6E63]">Flavor:</strong> {it.flavor || '—'}</div>
                        <div><strong className="text-[#8D6E63]">Shape:</strong> {it.shape || '—'}</div>
                        <div><strong className="text-[#8D6E63]">Frosting:</strong> {it.frosting || '—'}</div>
                        <div><strong className="text-[#8D6E63]">Eggless:</strong> {it.isEggless === 'eggless' ? 'Yes' : it.isEggless === 'egg' ? 'No' : '—'}</div>
                        <div><strong className="text-[#8D6E63]">Delivery:</strong> {it.deliveryType || '—'}</div>
                        <div><strong className="text-[#8D6E63]">When:</strong> {it.deliveryDate ? `${it.deliveryDate}${it.deliveryTime ? ' @ '+it.deliveryTime : ''}` : '—'}</div>
                      </div>

                      <div className="mt-3 text-sm text-[#5D4037]">{it.designTheme || it.message || ''}</div>
                    </div>

                    <div className="w-full md:w-40 flex-shrink-0 flex flex-col items-center">
                      {imageSrc ? (
                        <button onClick={() => handlePreview(imageSrc)} className="w-full h-28 p-0 rounded-lg overflow-hidden border mb-2">
                          <img src={imageSrc} alt="ref" className="w-full h-full object-cover" />
                        </button>
                      ) : (
                        <div className="w-full h-28 bg-[#FFF8F0] rounded-lg flex items-center justify-center text-sm text-[#8D6E63] mb-2">No image</div>
                      )}
                      <div className="flex gap-2 items-center">
                        <Link to={`/admin/customize-order?id=${it._id || it.id}`} className="text-xs text-[#D4A373] underline">View</Link>
                        <button disabled={deletingId=== (it._id||it.id)} onClick={() => handleRemove(it._id||it.id)} className="ml-2 px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-500 text-xs flex items-center gap-2">
                          <Trash2 size={14} />
                          <span>{deletingId=== (it._id||it.id) ? 'Removing...' : 'Remove'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            !loading && !error && <div className="p-6 text-center text-[#8D6E63]">No orders found.</div>
          )}
         </div>
       </main>

       {previewSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closePreview}>
          <div className="bg-white p-4 rounded-lg max-w-[90vw] max-h-[90vh] overflow-auto">
            <img src={previewSrc} alt="preview" className="max-w-full max-h-[80vh] object-contain" />
          </div>
        </div>
      )}
     </div>
   );
}
