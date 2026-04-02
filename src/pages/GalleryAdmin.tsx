import React, { useEffect, useState, useRef } from "react";
import { api } from "@/services/api";
import { toast } from "sonner";
import { X, Plus, Edit, Trash2, Image as ImageIcon, Search, RefreshCw, Upload, FileText, Tag, Info, Sparkles, DollarSign, Boxes, Camera, LayoutGrid, List, ArrowLeft, MousePointer2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";

interface GalleryItem {
  _id?: string;
  id?: string;
  title: string;
  alt?: string;
  category?: string;
  src?: string; 
  badge?: string;
  price?: string;
  desc?: string;
}

const empty: GalleryItem = { title: "", alt: "", category: "General", src: "", badge: "", price: "", desc: "" };

export default function GalleryAdmin() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<GalleryItem>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const objectUrlsRef = useRef<string[]>([]);
  const navigate = useNavigate();

  const MAX_BYTES = 1000 * 1024; // 1MB for gallery

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach(url => {
        try { URL.revokeObjectURL(url); } catch (e) { /* ignore */ }
      });
      objectUrlsRef.current = [];
    };
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.gallery.getAll() as any;
      const data = Array.isArray(res) ? res : (res && (res.data || res)) || [];

      objectUrlsRef.current.forEach(url => {
        try { URL.revokeObjectURL(url); } catch (e) { /* ignore */ }
      });
      objectUrlsRef.current = [];

      const arr = data as unknown[];
      const normalized = arr.map((itRaw) => {
        const it = itRaw as Record<string, unknown>;
        const id = (it._id as string) || (it.id as string);
        const imgBase64 = it.imgBase64 as unknown;
        const srcVal = it.src as unknown;
        let src: string | undefined;

        if (typeof imgBase64 === 'string' && imgBase64.trim()) {
          src = imgBase64;
          if (!src.startsWith('data:')) {
            src = `data:image/png;base64,${src}`;
          }
        } else if (typeof srcVal === 'string') {
          src = srcVal;
          if (!src.startsWith('data:') && !src.startsWith('/') && !src.startsWith('http')) {
            src = `data:image/png;base64,${src}`;
          }
        } else if (srcVal && typeof srcVal === 'object') {
          const maybe = srcVal as { data?: number[] };
          if (Array.isArray(maybe.data)) {
            try {
              const u8 = new Uint8Array(maybe.data);
              const blob = new Blob([u8], { type: 'image/png' });
              const url = URL.createObjectURL(blob);
              objectUrlsRef.current.push(url);
              src = url;
            } catch (e) {
              src = undefined;
            }
          }
        }

        const out: GalleryItem = {
          _id: it._id as string | undefined,
          id,
          title: (it.title as string) || '',
          alt: it.alt as string | undefined,
          category: it.category as string | undefined,
          src,
          badge: it.badge as string | undefined,
          price: it.price as string | undefined,
          desc: it.desc as string | undefined,
        };
        return out;
      });

      setItems(normalized);
    } catch (e) {
      toast.error("Failed to load showroom");
    } finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res: any = await api.categories.getAll();
      const arr = Array.isArray(res) ? res : (res && (res.data || res)) || [];
      const cats = (arr as unknown[]).map(c => {
        if (typeof c === 'string') return c;
        const obj = c as Record<string, unknown>;
        return (obj.name as string) || (obj.title as string) || (obj.category as string) || undefined;
      }).filter(Boolean) as string[];
      setCategories(Array.from(new Set(cats)));
    } catch (e) {
      setCategories([]);
    }
  };

  const openAdd = () => {
    setForm({ ...empty, category: categories && categories.length ? categories[0] : "General" });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (it: GalleryItem) => {
    setForm({ ...it });
    setEditingId(it.id || it._id || null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(empty);
    setEditingId(null);
  };

  const handleFile = (f?: File) => {
    if (!f) return;
    if (f.size > MAX_BYTES) {
      toast.error('Image must be 1MB or smaller');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setForm(prev => ({ ...prev, src: result }));
    };
    reader.readAsDataURL(f);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.title || !form.title.trim()) { toast.error('A title is required for your masterpiece'); return; }

    try {
      setLoading(true);
      if (editingId) {
        await api.gallery.update(editingId as any, form as any);
        toast.success('Showroom updated!');
        await fetchItems();
      } else {
        await api.gallery.create(form as any);
        toast.success('Masterpiece added to showroom!');
        await fetchItems();
      }
      closeForm();
    } catch (err) {
      toast.error('Failed to save artwork');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm('Remove this masterpiece from the showroom?')) return;
    try {
      setLoading(true);
      await api.gallery.delete(id as any);
      toast.success('Artwork removed.');
      setItems(items.filter(i => (i.id || i._id) !== id));
    } catch (e) { toast.error('Removal failed'); }
    finally { setLoading(false); }
  };

  const filteredItems = items.filter(it => 
    it.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    it.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    it.desc?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 font-lora max-w-7xl mx-auto pb-20 px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div>
          <h2 className="text-4xl font-bold font-dancing text-chocolate">Artisan Showroom</h2>
          <p className="text-sm text-chocolate-light font-medium mt-1">
            Display your finest creations to inspire your patrons.
          </p>
        </div>
        <div className="flex items-center gap-4">
           <button 
                onClick={() => navigate('/admin')} 
                className="p-3 bg-white border border-chocolate/5 rounded-full text-chocolate hover:bg-strawberry/5 transition-all shadow-sm group hidden md:flex"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            </button>
           <div className="flex bg-white rounded-full p-1 border border-chocolate/5 shadow-sm">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-chocolate text-white shadow-md' : 'text-chocolate hover:bg-strawberry/5'}`}
                  title="Gallery View"
                >
                  <LayoutGrid size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-full transition-all ${viewMode === 'table' ? 'bg-chocolate text-white shadow-md' : 'text-chocolate hover:bg-strawberry/5'}`}
                  title="Registry View"
                >
                  <List size={18} />
                </button>
           </div>
          <button 
            onClick={fetchItems}
            className="p-3 bg-white border border-chocolate/5 rounded-full text-chocolate hover:bg-strawberry/5 transition-all shadow-sm group"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
          </button>
          <button 
            onClick={openAdd} 
            className="px-8 py-3 bg-chocolate text-white rounded-full flex items-center gap-3 shadow-bakery hover:shadow-bakery-lg hover:bg-strawberry transition-all duration-300 font-bold text-xs uppercase tracking-widest active:scale-95"
          >
            <Plus size={20} />
            New Masterpiece
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-[2.5rem] shadow-bakery border border-chocolate/5 mx-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-chocolate/30 group-focus-within:text-strawberry transition-colors w-5 h-5" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search showroom..." 
            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-[#FAF6E6]/50 text-chocolate outline-none border border-transparent focus:border-strawberry/20 focus:bg-white focus:ring-8 focus:ring-strawberry/5 transition-all font-medium placeholder:text-chocolate/20 italic" 
          />
        </div>
      </div>

      {loading && items.length === 0 ? (
        <div className="bg-white/50 backdrop-blur-sm rounded-[3rem] border border-chocolate/5 shadow-bakery p-32 flex flex-col items-center justify-center gap-6 animate-pulse">
          <div className="w-16 h-16 border-4 border-chocolate/10 border-t-strawberry rounded-full animate-spin" />
          <p className="text-chocolate-light font-bold uppercase tracking-widest text-xs italic">Unveiling the gallery...</p>
        </div>
      ) : (
        <>
          {viewMode === 'table' ? (
            <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] shadow-bakery border border-chocolate/5 overflow-hidden mx-4">
               <Table>
                 <TableHeader>
                   <TableRow className="border-chocolate/5 hover:bg-transparent">
                     <TableHead className="w-20 pl-8 h-16 font-bold text-chocolate italic uppercase tracking-widest text-[10px]">Preview</TableHead>
                     <TableHead className="h-16 font-bold text-chocolate/80 uppercase tracking-widest text-[10px]">Creation & Story</TableHead>
                     <TableHead className="h-16 font-bold text-chocolate/80 uppercase tracking-widest text-[10px] hidden md:table-cell">Collection</TableHead>
                     <TableHead className="h-16 font-bold text-chocolate/80 uppercase tracking-widest text-[10px] hidden lg:table-cell">Price</TableHead>
                     <TableHead className="h-16 font-bold text-chocolate italic uppercase tracking-widest text-[10px] text-right pr-8">Actions</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {filteredItems.map((it) => (
                     <TableRow key={it.id || it._id} className="group border-chocolate/5 hover:bg-strawberry/[0.02] transition-colors duration-500">
                       <TableCell className="py-6 pl-8">
                         <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-bakery transform -rotate-3 group-hover:rotate-0 transition-transform">
                            {it.src ? (
                                <img src={it.src} alt={it.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-[#FAF6E6] flex items-center justify-center text-chocolate/10"><Camera size={16} /></div>
                            )}
                         </div>
                       </TableCell>
                       <TableCell className="py-6 min-w-[200px]">
                         <div>
                            <span className="font-bold text-chocolate text-lg tracking-tight group-hover:text-strawberry transition-colors block italic">{it.title}</span>
                            <p className="text-[10px] text-chocolate-light/60 font-medium italic line-clamp-1 mt-0.5">{it.desc || "A masterpiece waiting to be savored."}</p>
                         </div>
                       </TableCell>
                       <TableCell className="py-6 hidden md:table-cell">
                         <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-cream/50 rounded-full text-[10px] font-bold text-chocolate uppercase tracking-widest border border-chocolate/5">
                                {it.category}
                            </span>
                            {it.badge && (
                                <span className="px-2 py-0.5 bg-strawberry/10 text-strawberry text-[8px] font-bold rounded-md uppercase border border-strawberry/20">
                                    {it.badge}
                                </span>
                            )}
                         </div>
                       </TableCell>
                       <TableCell className="py-6 hidden lg:table-cell">
                         <span className="text-sm font-bold text-strawberry font-playfair">{it.price || "Contact for Quote"}</span>
                       </TableCell>
                       <TableCell className="py-6 pr-8 text-right">
                         <div className="flex items-center justify-end gap-2">
                           <button
                             onClick={() => openEdit(it)}
                             className="p-3 bg-white border border-chocolate/10 rounded-full text-chocolate hover:bg-chocolate hover:text-white transition-all shadow-sm active:scale-95"
                           >
                             <Edit size={16} />
                           </button>
                           <button
                             onClick={() => handleDelete(it.id || it._id)}
                             className="p-3 bg-white border border-red-100 rounded-full text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
                           >
                             <Trash2 size={16} />
                           </button>
                         </div>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-4">
              {filteredItems.map((it) => (
                <div key={it.id || it._id} className="group relative bg-white rounded-[3rem] p-6 border border-chocolate/5 shadow-bakery hover:shadow-bakery-lg transition-all duration-500 overflow-hidden flex flex-col h-full transform hover:-translate-y-1">
                  <div className="relative h-72 rounded-[2.5rem] overflow-hidden mb-8 transform -rotate-2 group-hover:rotate-0 transition-transform duration-700 shadow-lg">
                    {it.src ? (
                      <img 
                        src={it.src} 
                        alt={it.alt || it.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#FAF6E6] flex items-center justify-center text-chocolate/10">
                        <Camera size={64} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {it.badge && (
                      <div className="absolute top-6 right-6 px-4 py-1.5 bg-strawberry text-white text-[9px] font-bold uppercase tracking-widest rounded-full shadow-lg border-2 border-white transform rotate-3">
                          <Sparkles size={10} className="inline mr-1" />
                          {it.badge}
                      </div>
                    )}
                  </div>
                  
                  <div className="px-2 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-bold font-playfair text-chocolate group-hover:text-strawberry transition-colors italic leading-tight">{it.title}</h3>
                      {it.price && <span className="text-lg font-bold text-strawberry font-playfair">{it.price}</span>}
                    </div>
                    <p className="text-sm text-chocolate-light font-medium line-clamp-3 italic mb-8 leading-relaxed">
                      {it.desc || "A masterpiece waiting to be savored."}
                    </p>
                    
                    <div className="mt-auto pt-6 border-t border-chocolate/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-chocolate/5 flex items-center justify-center text-chocolate/20">
                              <Tag size={14} />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-chocolate/30 italic">
                              {it.category}
                          </span>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => openEdit(it)} className="p-3 bg-white border border-chocolate/10 rounded-full text-chocolate hover:bg-chocolate hover:text-white transition-all shadow-sm active:scale-95"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(it.id || it._id)} className="p-3 bg-white border border-red-100 rounded-full text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredItems.length === 0 && !loading && (
            <div className="py-40 text-center space-y-6">
              <div className="w-24 h-24 bg-cream/50 rounded-full flex items-center justify-center mx-auto text-chocolate/10 transform rotate-12 shadow-inner">
                <ImageIcon size={48} />
              </div>
              <div>
                  <h3 className="text-3xl font-bold font-dancing text-chocolate">The Showroom Awaits</h3>
                  <p className="text-chocolate-light font-medium italic mt-2">Begin your exhibition by adding your first creation to this empty hall.</p>
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-[95vw] md:max-w-3xl h-[90vh] flex flex-col p-0 bg-[#FAFBFD] border-none overflow-hidden rounded-[2.5rem]">
          <DialogHeader className="p-10 bg-white border-b border-chocolate/5 relative shrink-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-strawberry/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="relative flex items-center gap-6">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-bakery border border-chocolate/5 transform rotate-3 overflow-hidden">
                {form.src ? <img src={form.src} className="w-full h-full object-cover" /> : <Camera size={28} className="text-chocolate/20" />}
              </div>
              <div>
                <DialogTitle className="text-4xl font-bold text-chocolate font-dancing">
                  {editingId ? "Refine Creation" : "Exhibit Artwork"}
                </DialogTitle>
                <DialogDescription className="text-chocolate-light font-medium italic">
                  {editingId ? "Updating the perspective of your exhibition piece." : "Introduce a new visual delight to your master showroom."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form id="gallery-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
            <div className="space-y-8">
              <div className="space-y-2 group">
                <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Creation Title</label>
                <div className="relative">
                  <ImageIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
                  <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Velvet Opera Cake" className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/5 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm font-bold text-chocolate italic placeholder:text-chocolate/10 outline-none transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 group">
                  <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Showroom Category</label>
                  <div className="relative">
                    <Boxes size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors pointer-events-none" />
                    <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full pl-12 pr-10 py-4 bg-white border border-chocolate/5 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm font-bold text-chocolate italic appearance-none outline-none">
                      <option value="General">General Showroom</option>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2 group">
                  <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Premium Pricing</label>
                  <div className="relative">
                    <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
                    <input value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="e.g. ₹1,200 Onwards" className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/5 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm font-bold text-chocolate italic placeholder:text-chocolate/10 outline-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Artistic Badge</label>
                <div className="relative">
                    <Sparkles size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
                    <input value={form.badge} onChange={e => setForm({...form, badge: e.target.value})} placeholder="e.g. Seasonal Star, Signature" className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/5 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm font-bold text-chocolate italic placeholder:text-chocolate/10 outline-none" />
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Culinary Story</label>
                <div className="relative">
                    <FileText size={18} className="absolute left-4 top-6 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
                    <textarea value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} placeholder="Describe the soul of this creation..." className="w-full pl-12 pr-6 py-5 rounded-[2rem] bg-white border border-chocolate/5 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 outline-none text-sm text-chocolate-light font-medium min-h-[140px] resize-none leading-relaxed italic placeholder:text-chocolate/10" />
                </div>
              </div>

              <div className="pt-8 border-t border-chocolate/5">
                <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1 mb-6 block">Artistic Capture</label>
                
                {form.src ? (
                    <div className="relative rounded-[2.5rem] overflow-hidden border border-chocolate/5 shadow-bakery h-80 bg-white group/preview">
                        <img src={form.src} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                            <button type="button" onClick={() => setForm({...form, src: ""})} className="p-4 bg-red-500 text-white rounded-full shadow-2xl transform scale-90 group-hover/preview:scale-100 transition-all">
                                <Trash2 size={24} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="relative group">
                        <input type="file" accept="image/*" onChange={e => handleFile(e.target.files?.[0])} className="hidden" id="gallery-image-upload" />
                        <label htmlFor="gallery-image-upload" className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-chocolate/10 rounded-[2.5rem] bg-white cursor-pointer hover:bg-strawberry/5 hover:border-strawberry/20 transition-all shadow-sm">
                            <div className="flex flex-col items-center text-center p-10">
                                <Upload className="w-16 h-16 mb-4 text-chocolate/10 group-hover:text-strawberry transition-all group-hover:-translate-y-2" />
                                <p className="text-sm text-chocolate/40 font-bold uppercase tracking-widest mb-1">Upload Creation</p>
                                <p className="text-[10px] text-chocolate/20 font-medium italic">High resolution JPG/PNG (Max 1MB)</p>
                            </div>
                        </label>
                    </div>
                )}
              </div>
            </div>
          </form>

          <DialogFooter className="p-10 bg-white border-t border-chocolate/5 flex flex-row justify-between items-center shrink-0">
            <button type="button" onClick={closeForm} className="px-10 py-4 rounded-full border border-chocolate/10 font-bold text-chocolate bg-white hover:bg-chocolate/5 transition-all text-xs uppercase tracking-[0.2em] italic">
              Cancel
            </button>
            <button type="submit" form="gallery-form" disabled={loading} className="px-12 py-4 bg-chocolate text-white rounded-full font-bold shadow-bakery hover:bg-strawberry transition-all text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3">
              {loading && <RefreshCw size={16} className="animate-spin" />}
              {editingId ? "Refine Exhibit" : "Unveil Masterpiece"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
