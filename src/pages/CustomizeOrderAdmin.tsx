import React, { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
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
  ArrowLeft,
  LayoutGrid,
  List,
  Search,
  MousePointer2
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  <div className="flex items-start gap-4 p-4 rounded-[1.5rem] bg-white/40 border border-chocolate/5 hover:border-strawberry/20 hover:bg-white/80 transition-all group shadow-sm hover:shadow-bakery flex-1 min-w-[200px]">
    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-chocolate/5 flex items-center justify-center text-chocolate group-hover:text-strawberry transition-all shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[9px] font-bold text-chocolate/30 uppercase tracking-[0.2em] mb-1 italic">{label}</p>
      <p className="text-sm font-bold text-chocolate truncate italic">{value || "—"}</p>
    </div>
  </div>
);

export default function CustomizeOrderAdmin() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const idFromUrl = params.get("id");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const navigate = useNavigate();

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
      
      if (idFromUrl && list) {
        const order = list.find((it: any) => (it._id === idFromUrl || it.id === idFromUrl));
        if (order) setSelectedOrder(order);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load bespoke requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [idFromUrl]);

  const handleRemove = async (orderId: string) => {
    if (!confirm("Delete this bespoke request permanently? This vision will vanish from history.")) return;
    try {
      setDeletingId(orderId);
      await api.orders.delete(orderId);
      setOrders((prev) =>
        prev.filter((it) => (it as any)._id !== orderId && (it as any).id !== orderId)
      );
      toast.success('Bespoke request dismissed.');
      setDeletingId(null);
      if (selectedOrder && ((selectedOrder as any)._id === orderId || (selectedOrder as any).id === orderId)) {
        setSelectedOrder(null);
      }
    } catch (err: any) {
      toast.error('Failed to dismiss request');
      setDeletingId(null);
    }
  };

  const getImageSrc = (it: any): string | null => {
    if (!it) return null;
    const img = String(it.image || "");
    if (!img) return null;
    if (img.startsWith("data:")) return img;
    if (img.startsWith("http")) return img;
    const normalized = img.replace(/\\/g, "/");
    if (normalized.startsWith("/")) return normalized;
    if (normalized.startsWith("uploads/")) return `/${normalized}`;
    return `/uploads/${normalized}`;
  };

  const filteredOrders = orders.filter(o => 
    (o.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.occasion || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.mobile || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 font-lora max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div>
          <h2 className="text-4xl font-bold font-dancing text-chocolate">Bespoke Visions</h2>
          <p className="text-sm text-chocolate-light font-medium mt-1">
            Carefully review artistic cake customization requests from your patrons.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/admin/orders"
            className="px-8 py-3 bg-white text-chocolate border border-chocolate/5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-chocolate/5 transition-all shadow-sm group active:scale-95 italic"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Registry
          </Link>
          <div className="flex bg-white rounded-full p-1 border border-chocolate/5 shadow-sm">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-chocolate text-white shadow-md' : 'text-chocolate hover:bg-strawberry/5'}`} title="Portraits"><LayoutGrid size={18} /></button>
                <button onClick={() => setViewMode('table')} className={`p-2 rounded-full transition-all ${viewMode === 'table' ? 'bg-chocolate text-white shadow-md' : 'text-chocolate hover:bg-strawberry/5'}`} title="Archives"><List size={18} /></button>
          </div>
          <button 
            onClick={fetchOrders}
            className="p-3 bg-white border border-chocolate/5 rounded-full text-chocolate hover:bg-strawberry/5 transition-all shadow-sm group active:scale-95"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] shadow-bakery border border-chocolate/5 flex items-center justify-center gap-6 group hover:translate-y-[-4px] transition-all duration-500">
           <div className="w-16 h-16 rounded-2xl bg-chocolate text-white flex items-center justify-center shadow-bakery transform -rotate-3 group-hover:rotate-0 transition-transform">
             <Cake size={30} />
           </div>
           <div>
             <p className="text-[9px] font-bold text-chocolate/40 uppercase tracking-widest mb-1 italic">Visions</p>
             <h3 className="text-3xl font-bold font-playfair text-chocolate">{orders.length}</h3>
           </div>
        </div>
        <div className="md:col-span-2 bg-[#FAF6E6]/40 border border-chocolate/5 rounded-[2.5rem] p-8 flex items-center relative overflow-hidden group shadow-inner">
            <p className="text-sm text-chocolate-light font-medium italic leading-relaxed z-10">
              "Every custom cake is a story waiting to be told." Handle every bespoke request with the artistic care it deserves to preserve the soul of the bakery.
            </p>
            <Sparkles className="absolute -bottom-6 -right-6 text-chocolate/5 w-24 h-24 transform rotate-12 transition-transform group-hover:scale-110" />
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-[2.5rem] shadow-bakery border border-chocolate/5 mx-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-chocolate/30 group-focus-within:text-strawberry transition-colors w-5 h-5" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search bespoke archives by patron or occasion..." className="w-full pl-14 pr-6 py-4 rounded-2xl bg-[#FAF6E6]/50 text-chocolate outline-none border border-transparent focus:border-strawberry/20 focus:bg-white focus:ring-8 focus:ring-strawberry/5 transition-all font-medium placeholder:text-chocolate/20 italic" />
        </div>
      </div>

      {loading && orders.length === 0 ? (
        <div className="bg-white/50 backdrop-blur-sm rounded-[3rem] border border-chocolate/5 shadow-bakery p-32 flex flex-col items-center justify-center gap-6 animate-pulse">
          <RefreshCw className="w-12 h-12 text-chocolate/20 animate-spin" />
          <p className="text-chocolate-light font-bold uppercase tracking-widest text-xs italic">Gathering visions...</p>
        </div>
      ) : (
        <>
            {viewMode === 'table' ? (
                <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] shadow-bakery border border-chocolate/5 overflow-hidden mx-4">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-chocolate/5 hover:bg-transparent">
                                <TableHead className="w-20 pl-8 h-16 font-bold text-chocolate italic uppercase tracking-widest text-[10px]">Portal</TableHead>
                                <TableHead className="h-16 font-bold text-chocolate/80 uppercase tracking-widest text-[10px]">Patron & Occasion</TableHead>
                                <TableHead className="h-16 font-bold text-chocolate/80 uppercase tracking-widest text-[10px] hidden md:table-cell">Flavor & Spirit</TableHead>
                                <TableHead className="h-16 font-bold text-chocolate/80 uppercase tracking-widest text-[10px] hidden lg:table-cell">Dispatch Goal</TableHead>
                                <TableHead className="h-16 font-bold text-chocolate italic uppercase tracking-widest text-[10px] text-right pr-8">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.map((o) => {
                                const imageSrc = getImageSrc(o);
                                const orderId = (o as any)._id || (o as any).id;
                                return (
                                    <TableRow key={orderId} className="group border-chocolate/5 hover:bg-strawberry/[0.02] transition-colors duration-500">
                                        <TableCell className="py-6 pl-8">
                                            {imageSrc ? (
                                                <div className="w-12 h-12 rounded-2xl overflow-hidden border border-chocolate/10 shadow-bakery transform rotate-3 group-hover:rotate-0 transition-all">
                                                    <img src={imageSrc} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 rounded-2xl bg-cream flex items-center justify-center text-chocolate/20 transform rotate-3 transition-transform group-hover:rotate-0">
                                                    <ImageIcon size={18} />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-6">
                                            <div>
                                                <span className="font-bold text-chocolate text-lg tracking-tight group-hover:text-strawberry transition-colors block italic leading-tight capitalize">{o.occasion || "Bespoke Creation"}</span>
                                                <p className="text-[10px] text-chocolate-light/60 font-medium italic mt-0.5">{o.name || "Unknown Patron"}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-6 hidden md:table-cell">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-chocolate italic capitalize">{o.flavor || "Flavor Undefined"}</span>
                                                <span className="text-[9px] font-bold text-chocolate/20 uppercase italic">{o.weight || o.servingCount || "Standard Size"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-6 hidden lg:table-cell text-left">
                                           <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-chocolate-light italic">{o.deliveryDate || "TBA"}</span>
                                                <span className="text-[9px] font-bold text-chocolate/20 uppercase italic">{o.deliveryTime || "Anytime"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-6 pr-8 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => setSelectedOrder(o)} className="p-3 bg-white border border-chocolate/5 rounded-full text-chocolate hover:bg-chocolate hover:text-white transition-all shadow-sm active:scale-95"><Eye size={16} /></button>
                                                <button onClick={() => { setPreviewSrc(imageSrc); }} className="p-3 bg-white border border-chocolate/5 rounded-full text-chocolate hover:bg-strawberry hover:text-white transition-all shadow-sm active:scale-95"><ImageIcon size={16} /></button>
                                                <button onClick={() => handleRemove(orderId)} disabled={deletingId === orderId} className="p-3 bg-white border border-red-50 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-30"><Trash2 size={16} /></button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 px-4">
                    {filteredOrders.map((o) => {
                        const imageSrc = getImageSrc(o);
                        const orderId = (o as any)._id || (o as any).id;
                        return (
                            <div key={orderId} className="group relative bg-white rounded-[3.5rem] p-10 border border-chocolate/5 shadow-bakery hover:shadow-bakery-lg transition-all duration-700 overflow-hidden flex flex-col h-full transform hover:-translate-y-1">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-strawberry/5 rounded-full -mr-32 -mt-32 blur-3xl transition-all group-hover:bg-strawberry/10" />
                                
                                <div className="flex flex-col md:flex-row gap-10 relative z-10 flex-1">
                                    <div className="w-full md:w-48 flex-shrink-0 flex flex-col gap-8">
                                        <div className="relative group/view">
                                            <div className="absolute -inset-1 bg-gradient-to-tr from-chocolate/10 to-strawberry/10 rounded-[2.5rem] blur opacity-0 group-hover/view:opacity-100 transition duration-500" />
                                            {imageSrc ? (
                                                <button onClick={() => setPreviewSrc(imageSrc)} className="relative w-full h-48 rounded-[2rem] overflow-hidden border border-chocolate/5 shadow-bakery transform -rotate-3 group-hover:rotate-0 transition-transform duration-700 aspect-square group/img">
                                                    <img src={imageSrc} alt="" className="w-full h-full object-cover group-hover/img:scale-110 transition-duration-1000" />
                                                    <div className="absolute inset-0 bg-chocolate/0 group-hover/img:bg-chocolate/20 flex items-center justify-center transition-all">
                                                        <Eye size={24} className="text-white opacity-0 group-hover/img:opacity-100 transform translate-y-2 group-hover/img:translate-y-0 transition-all" />
                                                    </div>
                                                </button>
                                            ) : (
                                                <div className="relative w-full h-48 rounded-[2rem] bg-[#FAFBFD] border border-chocolate/5 flex flex-col items-center justify-center gap-3 text-chocolate/10 transform rotate-3 transition-transform group-hover:rotate-0">
                                                    <ImageIcon size={40} />
                                                    <span className="text-[9px] font-black uppercase tracking-widest italic">Reference-Less</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-6 bg-[#FAFBFD] rounded-[2rem] border border-chocolate/5 space-y-4 shadow-inner">
                                            <div className="flex items-center gap-3">
                                                 <div className="w-8 h-8 rounded-xl bg-chocolate text-white flex items-center justify-center font-dancing font-bold text-lg shadow-bakery transform rotate-3">
                                                     {o.name?.charAt(0) || "?"}
                                                 </div>
                                                 <div className="flex-1 min-w-0">
                                                     <p className="text-[8px] font-bold uppercase tracking-widest text-chocolate/20 mb-0.5">Patron</p>
                                                     <p className="text-[11px] font-bold truncate text-chocolate italic line-clamp-1">{o.name || "Unknown"}</p>
                                                 </div>
                                            </div>
                                            {o.mobile && (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-strawberry/10 flex items-center justify-center text-strawberry">
                                                        <Phone size={14} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[8px] font-bold uppercase tracking-widest text-chocolate/20 mb-0.5">Contact</p>
                                                        <p className="text-[11px] font-bold truncate text-chocolate italic">{o.mobile}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Hash size={14} className="text-strawberry/40" />
                                                    <span className="text-[10px] font-mono font-bold text-chocolate/20 uppercase tracking-[0.2em]">RQ-{String(orderId).slice(-8).toUpperCase()}</span>
                                                </div>
                                                <h3 className="text-3xl font-bold font-playfair text-chocolate group-hover:text-strawberry transition-colors italic leading-tight capitalize">{o.occasion || "Bespoke Creation"}</h3>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-chocolate/10 mb-0.5">Established</p>
                                                <p className="text-[10px] font-bold text-chocolate-light italic">{o.createdAt && new Date(o.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {o.flavor && <DetailChip icon={<Sparkles size={16} />} label="Flavor Palette" value={o.flavor} />}
                                            {(o.weight || o.servingCount) && <DetailChip icon={<Package size={16} />} label="Vessel Size" value={o.weight || o.servingCount} />}
                                            {o.shape && <DetailChip icon={<Tag size={16} />} label="Artistic Shape" value={o.shape} />}
                                            {o.deliveryDate && <DetailChip icon={<Calendar size={16} />} label="Dispatch Goal" value={o.deliveryDate} />}
                                        </div>

                                        {o.designTheme && (
                                            <div className="p-8 bg-[#FAF6E6]/60 rounded-[2.5rem] border border-chocolate/5 relative overflow-hidden group/note shadow-inner italic leading-relaxed text-chocolate text-sm font-medium">
                                                <MessageSquare className="absolute right-6 top-6 text-chocolate/5 w-12 h-12" />
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-chocolate/20 mb-4 flex items-center gap-2"><Sparkles size={12} /> The Artistic Vision</p>
                                                <p className="relative z-10 leading-relaxed italic">"{o.designTheme}"</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-10 pt-10 border-t border-chocolate/5 flex items-center justify-between relative z-10 group/actions">
                                    <div className="flex items-center gap-3 italic">
                                        <div className="w-2 h-2 rounded-full bg-strawberry animate-pulse" />
                                        <span className="text-[10px] font-bold text-chocolate-light uppercase tracking-widest">Active Dream</span>
                                    </div>
                                    <div className="flex gap-4">
                                        <button onClick={() => handleRemove(orderId)} disabled={deletingId === orderId} className="px-8 py-3 bg-white border border-red-50 text-red-500 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-30 flex items-center gap-2 group/del">
                                            <Trash2 size={14} className="group-hover/del:rotate-12 transition-transform" /> {deletingId === orderId ? "Dismissing..." : "Dismiss"}
                                        </button>
                                        <button onClick={() => setSelectedOrder(o)} className="px-10 py-3 bg-chocolate text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-strawberry transition-all shadow-bakery flex items-center gap-2 active:scale-95 group/view">
                                            <Eye size={14} className="group-hover/view:scale-110 transition-transform" /> View Essence
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
      )}

      {/* Narrative Portal/Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-4xl h-[90vh] flex flex-col p-0 bg-[#FAFBFD] border-none overflow-hidden rounded-[2.5rem]">
           <DialogHeader className="p-12 bg-white border-b border-chocolate/5 relative overflow-hidden shrink-0">
               <div className="absolute top-0 right-0 w-80 h-80 bg-strawberry/5 rounded-full -mr-40 -mt-40 blur-3xl" />
               <div className="relative flex items-center gap-8">
                    <div className="w-20 h-20 bg-chocolate text-white rounded-[2rem] flex items-center justify-center font-dancing font-bold text-4xl shadow-bakery transform rotate-6 border-4 border-white">
                        {selectedOrder?.name?.charAt(0) || "?"}
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <DialogTitle className="text-5xl font-bold font-dancing text-chocolate capitalize">{selectedOrder?.occasion || "Bespoke Vision"}</DialogTitle>
                            <span className="px-3 py-1 bg-cream rounded-full text-[10px] font-black text-chocolate-light uppercase tracking-widest italic shadow-sm">Active</span>
                        </div>
                        <DialogDescription className="text-chocolate-light font-medium italic text-lg opacity-60">
                           A masterpiece requested by {selectedOrder?.name || "a Patron"}
                        </DialogDescription>
                    </div>
               </div>
           </DialogHeader>

           <div className="flex-1 overflow-y-auto p-12 space-y-12 no-scrollbar">
                <div className="flex flex-col xl:flex-row gap-12">
                     <div className="w-full xl:w-80 shrink-0">
                        {getImageSrc(selectedOrder) ? (
                            <div className="relative group/zoom overflow-hidden rounded-[3rem] border-8 border-white shadow-bakery bg-white aspect-square">
                                <img src={getImageSrc(selectedOrder)!} alt="Vision" className="w-full h-full object-cover transition-transform duration-1000 group-hover/zoom:scale-110" />
                                <div className="absolute inset-0 bg-transparent group-hover/zoom:bg-chocolate/10 transition-colors pointer-events-none" />
                            </div>
                        ) : (
                            <div className="w-full aspect-square bg-[#FAFBFD] rounded-[3rem] border border-chocolate/5 border-dashed flex flex-col items-center justify-center gap-4 text-chocolate/20">
                                <ImageIcon size={64} className="opacity-10" />
                                <p className="text-xs font-bold uppercase tracking-widest italic">A Vision Unseen</p>
                            </div>
                        )}
                        
                        <div className="mt-8 p-8 bg-white rounded-[2.5rem] border border-chocolate/5 shadow-sm space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 group/item">
                                    <div className="p-3 bg-chocolate/5 text-chocolate rounded-xl group-hover/item:bg-chocolate group-hover/item:text-white transition-all"><User size={18} /></div>
                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-chocolate/20 italic">Patron Name</p>
                                        <p className="text-sm font-bold text-chocolate italic">{selectedOrder?.name || "Unknown Steward"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group/item">
                                    <div className="p-3 bg-chocolate/5 text-chocolate rounded-xl group-hover/item:bg-strawberry group-hover/item:text-white transition-all"><Phone size={18} /></div>
                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-chocolate/20 italic">Contact Channel</p>
                                        <p className="text-sm font-bold text-chocolate italic">{selectedOrder?.mobile || "Not Recorded"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                     </div>

                     <div className="flex-1 space-y-10">
                        <section className="space-y-6">
                            <h4 className="text-[10px] font-bold text-chocolate/30 uppercase tracking-[0.3em] border-b border-chocolate/5 pb-2 ml-1 italic flex items-center gap-3">
                                <Sparkles size={14} className="text-strawberry/40" /> Composition Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <DetailChip icon={<Sparkles size={18} />} label="Artistic Flavor" value={selectedOrder?.flavor} />
                                <DetailChip icon={<Package size={18} />} label="Enthroned Weight" value={selectedOrder?.weight || selectedOrder?.servingCount} />
                                <DetailChip icon={<Tag size={18} />} label="Legacy Shape" value={selectedOrder?.shape} />
                                <DetailChip icon={<Leaf size={18} />} label="The Diet" value={selectedOrder?.isEggless === "eggless" ? "Purely Eggless 🌱" : "With Eggs"} />
                                <DetailChip icon={<Calendar size={18} />} label="Dispatch Moon" value={selectedOrder?.deliveryDate} />
                                <DetailChip icon={<Clock size={18} />} label="Dispatch Sun" value={selectedOrder?.deliveryTime} />
                            </div>
                        </section>

                        <section className="space-y-6 pt-6">
                           <h4 className="text-[10px] font-bold text-chocolate/30 uppercase tracking-[0.3em] border-b border-chocolate/5 pb-2 ml-1 italic flex items-center gap-3">
                                <MessageSquare size={14} className="text-strawberry/40" /> The Artisan Vision (Notes)
                            </h4>
                            <div className="p-12 bg-cream/20 rounded-[3rem] border border-chocolate/5 shadow-inner italic text-chocolate text-xl leading-relaxed relative overflow-hidden group/narrative">
                                <Cake className="absolute -bottom-4 -right-4 text-chocolate/5 w-32 h-32 transform -rotate-12 transition-transform duration-1000 group-hover/narrative:scale-110" />
                                <p className="relative z-10 whitespace-pre-line leading-relaxed">
                                    "{selectedOrder?.designTheme || selectedOrder?.message || "The patron has shared no further narrative for this creation."}"
                                </p>
                            </div>
                        </section>

                        {selectedOrder?.address && (
                            <section className="space-y-4 pt-6">
                                <h4 className="text-[10px] font-bold text-chocolate/30 uppercase tracking-[0.3em] border-b border-chocolate/5 pb-2 ml-1 italic flex items-center gap-3">
                                    <MapPin size={14} className="text-strawberry/40" /> Bespoke Destination
                                </h4>
                                <div className="p-8 bg-white/60 rounded-[2rem] border border-chocolate/5 italic text-chocolate-light font-medium text-base shadow-sm">
                                    {selectedOrder?.address}{selectedOrder?.pincode ? ` — PIN: ${selectedOrder.pincode}` : ""}
                                </div>
                            </section>
                        )}
                     </div>
                </div>
           </div>

           <DialogFooter className="p-10 bg-white border-t border-chocolate/5 flex flex-row items-center justify-between shrink-0">
              <button onClick={() => setSelectedOrder(null)} className="px-12 py-4 font-bold text-chocolate bg-white border border-chocolate/10 rounded-full hover:bg-chocolate/5 transition-all text-xs uppercase tracking-widest italic">Close Portal</button>
              <div className="flex gap-4">
                <button 
                    onClick={() => selectedOrder && handleRemove((selectedOrder as any)._id || selectedOrder.id as string)} 
                    className="px-10 py-4 bg-red-50 text-red-500 rounded-full border border-red-100 hover:bg-red-500 hover:text-white transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-3 group/sub"
                >
                    <Trash2 size={18} className="group-hover/sub:rotate-6 transition-transform" /> Dismiss Archive
                </button>
                <div className="w-1 bg-chocolate/5 rounded-full" />
                <button onClick={() => navigate(`/admin/orders?search=${selectedOrder?.name}`)} className="px-12 py-4 bg-chocolate text-white rounded-full font-bold shadow-bakery hover:bg-strawberry transition-all text-xs uppercase tracking-widest flex items-center gap-3 group/nav">
                    Orchestrate Fulfillment <ChevronRight size={18} className="group-hover/nav:translate-x-1 transition-transform" />
                </button>
              </div>
           </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full Preview Image */}
      {previewSrc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-10 bg-black/80 backdrop-blur-3xl animate-in fade-in transition-all" onClick={() => setPreviewSrc(null)}>
             <button className="absolute top-10 right-10 p-4 bg-white/10 text-white rounded-full hover:bg-white hover:text-black transition-all z-20"><X size={32} /></button>
             <div className="relative max-w-5xl w-full h-[80vh] flex items-center justify-center pointer-events-none">
                 <img src={previewSrc} alt="Vision Portal" className="max-w-full max-h-full object-contain rounded-[3rem] shadow-2xl pointer-events-auto shadow-white/5" />
             </div>
        </div>
      )}
    </div>
  );
}
