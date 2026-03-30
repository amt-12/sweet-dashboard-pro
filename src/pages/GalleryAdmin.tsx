import React, { useEffect, useState, useRef } from "react";
import { api } from "@/services/api";
import { toast } from "sonner";
import { X, Plus, Edit, Trash2, Image as ImageIcon, Search, RefreshCw, Upload, FileText, Tag, Info, Sparkles, DollarSign, Boxes, Camera } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "../components/ui/sheet";

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
  const objectUrlsRef = useRef<string[]>([]);

  const MAX_BYTES = 500 * 1024; // 500KB

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
      toast.error('Image must be 500KB or smaller');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setForm(prev => ({ ...prev, src: result }));
    };
    reader.readAsDataURL(f);
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
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
    <div className="space-y-10 animate-in fade-in duration-700 font-lora pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold font-dancing text-chocolate">Artisan Showroom</h2>
          <p className="text-sm text-chocolate-light font-medium mt-1">
            Display your finest creations to inspire your patrons.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchItems}
            className="p-3 bg-white border border-chocolate/10 rounded-full text-chocolate hover:bg-strawberry/5 transition-all shadow-sm group"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
          </button>
          <button 
            onClick={openAdd} 
            className="px-6 py-3 bg-chocolate text-white rounded-full flex items-center gap-2 shadow-bakery hover:shadow-bakery-lg hover:bg-strawberry transition-all duration-300"
          >
            <Plus size={18} />
            <span className="font-bold text-xs uppercase tracking-widest text-[#F5ECD7]">New Masterpiece</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-[2rem] shadow-bakery border border-chocolate/5">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-chocolate/30 group-focus-within:text-strawberry transition-colors w-5 h-5" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search showroom..." 
            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-[#FAF6E6]/50 text-chocolate outline-none border border-transparent focus:border-strawberry/20 focus:bg-white focus:ring-8 focus:ring-strawberry/5 transition-all font-medium placeholder:text-chocolate/20" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredItems.map((it) => (
          <div key={it.id || it._id} className="group relative bg-white rounded-[3rem] p-6 border border-chocolate/5 shadow-bakery hover:shadow-bakery-lg transition-all duration-500 overflow-hidden flex flex-col h-full">
            <div className="relative h-72 rounded-[2.5rem] overflow-hidden mb-8 transform -rotate-2 group-hover:rotate-0 transition-transform duration-700 shadow-lg">
              {it.src ? (
                <img 
                  src={it.src.startsWith('data:') ? it.src : (it.src.startsWith('/') ? it.src : `/${it.src}`)} 
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
                <div className="absolute top-6 right-6 px-4 py-1.5 bg-strawberry text-white text-[9px] font-bold uppercase tracking-widest rounded-full shadow-lg transform rotate-3">
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
                  <button onClick={() => handleDelete(it.id || it._id)} className="p-3 bg-white border border-red-50 rounded-full text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && !loading && (
          <div className="col-span-full py-32 text-center space-y-6">
            <div className="w-24 h-24 bg-chocolate/5 rounded-full flex items-center justify-center mx-auto text-chocolate/10 transform rotate-12">
              <ImageIcon size={48} />
            </div>
            <div>
                <h3 className="text-2xl font-bold font-playfair text-chocolate">The Showroom is Empty</h3>
                <p className="text-chocolate-light font-medium italic mt-2">Begin your exhibition by adding your first creation.</p>
            </div>
          </div>
        )}
      </div>

      <Sheet open={showForm} onOpenChange={(open) => !open && closeForm()}>
        <SheetContent side="right" className="flex flex-col h-full bg-[#FAFBFD] p-0 border-l border-chocolate/10">
          <SheetHeader className="p-10 bg-white border-b border-chocolate/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-strawberry/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="relative flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-chocolate text-white flex items-center justify-center shadow-bakery transform rotate-3">
                <Camera size={28} />
              </div>
              <div>
                <SheetTitle className="text-4xl font-bold text-chocolate font-dancing">
                  {editingId ? "Refine Artwork" : "New Masterpiece"}
                </SheetTitle>
                <SheetDescription className="text-chocolate-light font-medium italic">
                  {editingId ? "Update the perspective of this exhibition piece." : "Introduce a new visual delight to your showroom."}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <form id="gallery-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-10">
            <div className="space-y-8">
              <div className="space-y-2 group">
                <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Artwork Title</label>
                <div className="relative">
                  <ImageIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
                  <input 
                    required
                    value={form.title} 
                    onChange={e => setForm({...form, title: e.target.value})} 
                    placeholder="e.g. Midnight Truffle Delight"
                    className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-medium placeholder:text-chocolate/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 group">
                  <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Collection</label>
                  <div className="relative">
                    <Boxes size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors pointer-events-none" />
                    <select 
                      value={form.category} 
                      onChange={e => setForm({...form, category: e.target.value})} 
                      className="w-full pl-12 pr-10 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-bold text-chocolate italic appearance-none"
                    >
                      <option value="General">General Collection</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2 group">
                  <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Price (Optional)</label>
                  <div className="relative">
                    <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
                    <input 
                      value={form.price} 
                      onChange={e => setForm({...form, price: e.target.value})} 
                      placeholder="e.g. $12.00"
                      className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-medium placeholder:text-chocolate/10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Ambassador Badge</label>
                <div className="relative">
                  <Sparkles size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
                  <input 
                    value={form.badge} 
                    onChange={e => setForm({...form, badge: e.target.value})} 
                    placeholder="e.g. Signature Piece, Limited Edition"
                    className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-medium placeholder:text-chocolate/10"
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Artistic Narrative</label>
                <div className="relative">
                  <FileText size={18} className="absolute left-4 top-5 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
                  <textarea 
                    value={form.desc} 
                    onChange={e => setForm({...form, desc: e.target.value})} 
                    placeholder="Weave a story about this creation..."
                    className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-medium min-h-[140px] resize-none leading-relaxed italic"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Visual Evidence</label>
                <div className="flex flex-col gap-6">
                  {form.src ? (
                    <div className="relative rounded-[2.5rem] overflow-hidden border border-chocolate/5 shadow-bakery h-72 bg-white group/preview">
                      <img src={form.src.startsWith('data:') ? form.src : (form.src.startsWith('/') ? form.src : `/${form.src}`)} className="w-full h-full object-cover" alt="Perspective Preview"/>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            type="button"
                            onClick={() => setForm({...form, src: ""})}
                            className="p-4 bg-red-500 text-white rounded-full shadow-2xl hover:bg-red-600 transition-all transform scale-90 group-hover/preview:scale-100"
                          >
                            <Trash2 size={24} />
                          </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative group">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={e => handleFile(e.target.files && e.target.files[0] ? e.target.files[0] : undefined)} 
                          className="hidden" 
                          id="image-upload"
                        />
                        <label 
                          htmlFor="image-upload" 
                          className="flex flex-col items-center justify-center w-full h-72 border-2 border-dashed border-chocolate/10 rounded-[2.5rem] bg-white cursor-pointer hover:bg-strawberry/5 hover:border-strawberry/20 transition-all group shadow-sm"
                        >
                          <div className="flex flex-col items-center justify-center p-10 text-center">
                            <Upload className="w-12 h-12 mb-4 text-chocolate/10 group-hover:text-strawberry transition-colors group-hover:translate-y-[-4px] duration-300" />
                            <p className="text-sm text-chocolate/40 font-bold uppercase tracking-widest mb-1">Upload Perspective</p>
                            <p className="text-[10px] text-chocolate/20 font-medium italic">High fidelity images (max 500KB) recommended</p>
                          </div>
                        </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>

          <SheetFooter className="p-10 bg-white border-t border-chocolate/5 flex flex-row justify-between items-center">
            <button type="button" onClick={closeForm} className="px-10 py-4 rounded-full text-xs font-bold text-chocolate bg-white border border-chocolate/10 hover:bg-chocolate/5 transition-all uppercase tracking-[0.2em] italic">
              Cancel
            </button>
            <button type="submit" form="gallery-form" disabled={loading} className="px-12 py-4 bg-chocolate text-white rounded-full font-bold shadow-bakery hover:bg-strawberry transition-all disabled:opacity-50 flex items-center gap-3 uppercase tracking-[0.2em]">
              {loading && <RefreshCw size={18} className="animate-spin" />}
              {editingId ? "Save Changes" : "Exhibit Artwork"}
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
