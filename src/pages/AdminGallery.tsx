import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Image as ImageIcon, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '../components/ui/sheet';

interface GalleryItem {
  _id?: string;
  id?: string;
  title: string;
  alt?: string;
  category?: string;
  src?: string; // url or data
  badge?: string;
  price?: string;
  desc?: string;
}

const MAX_IMAGE_SIZE_BYTES = 500 * 1024; // 500KB

export default function AdminGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileData, setFileData] = useState<string | null>(null);

  // Helper to normalize API responses which may be: Array, { data: Array }, { data: item }, or { data: { data: Array } }
  function unwrapResult<T>(res: unknown): T | T[] | undefined {
    if (res == null) return undefined;
    if (Array.isArray(res)) return res as unknown as T[];
    if (typeof res === 'object') {
      const r = res as Record<string, unknown>;
      const d = r.data;
      if (d !== undefined) {
        if (Array.isArray(d)) return d as unknown as T[];
        if (d && typeof d === 'object') {
          const dd = (d as Record<string, unknown>).data;
          if (Array.isArray(dd)) return dd as unknown as T[];
          return d as unknown as T;
        }
      }
    }
    return undefined;
  }

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.gallery.getAll();
      const out = unwrapResult<GalleryItem>(res);
      let list: GalleryItem[] = [];
      if (Array.isArray(out)) list = out as GalleryItem[];
      else if (out && typeof out === 'object') list = [out as GalleryItem];
      else list = [];
      console.log('Gallery items loaded:', list.map(l => l.src));
      setItems(list);
    } catch (e) {
      toast.error('Failed to load gallery');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openAdd = () => { setEditing(null); setPreview(null); setFileData(null); setShowForm(true); };
  const openEdit = (it: GalleryItem) => { setEditing(it); setPreview(it.src || null); setFileData(null); setShowForm(true); };

  const handleFile = (f?: File) => {
    if (!f) { setPreview(null); setFileData(null); return; }
    if (f.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error('Image must be 500KB or smaller');
      return;
    }
    const url = URL.createObjectURL(f);
    setPreview(url);
    const reader = new FileReader();
    reader.onload = () => { setFileData(String(reader.result)); };
    reader.readAsDataURL(f);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget as HTMLFormElement);
    const payload: Partial<GalleryItem> = {
      title: String(form.get('title') || '').trim(),
      alt: String(form.get('alt') || '').trim(),
      category: String(form.get('category') || '').trim(),
      badge: String(form.get('badge') || '').trim(),
      price: String(form.get('price') || '').trim(),
      desc: String(form.get('desc') || '').trim(),
    };
    if (fileData) payload.src = fileData;
    else if (editing && editing.src) payload.src = editing.src;

    try {
      setLoading(true);
      if (editing && (editing._id || editing.id)) {
        const id = editing._id || editing.id!;
        const updatedRes = await api.gallery.update(id, payload as object);
        const updatedOut = unwrapResult<GalleryItem>(updatedRes);
        const updatedItem: GalleryItem = Array.isArray(updatedOut) ? (updatedOut as GalleryItem[])[0] : (updatedOut as GalleryItem) || (updatedRes as unknown as GalleryItem);
        setItems(items.map(it => ((it._id === id || it.id === id) ? { ...it, ...updatedItem } : it)));
        toast.success('Gallery item updated');
      } else {
        const createdRes = await api.gallery.create(payload as object);
        const createdOut = unwrapResult<GalleryItem>(createdRes);
        const createdItem: GalleryItem = Array.isArray(createdOut) ? (createdOut as GalleryItem[])[0] : (createdOut as GalleryItem) || (createdRes as unknown as GalleryItem);
        setItems([createdItem, ...items]);
        toast.success('Gallery item added');
      }
      setShowForm(false);
    } catch (err) {
      toast.error('Save failed');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return; if (!confirm('Delete this image?')) return;
    try {
      setLoading(true);
      await api.gallery.delete(id);
      setItems(items.filter(i => (i._id || i.id) !== id));
      toast.success('Deleted');
    } catch (e) { toast.error('Delete failed'); }
    finally { setLoading(false); }
  };

  // Resolve image source robustly and trim input
  function resolveImageSrc(rawIn?: string) {
    const raw = String(rawIn || '').trim();
    if (!raw) return '/placeholder.svg';
    if (raw.startsWith('data:')) return raw;
    if (/^https?:\/\//i.test(raw)) return raw;
    const backendBase = (import.meta.env.VITE_BACKEND_URL as string) || window.location.origin;
    if (raw.startsWith('/uploads/')) return `${backendBase}${raw}`;
    if (raw.startsWith('/')) return raw; // relative root path
    return `/${raw}`;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-dancing text-chocolate">Gallery Master</h2>
          <p className="text-sm text-chocolate-light font-medium mt-1">Curate your bakery's visual story and showcase your sweet creations.</p>
        </div>
        <button 
          onClick={openAdd} 
          className="px-6 py-3 bg-chocolate text-white rounded-full flex items-center gap-2 shadow-bakery hover:shadow-bakery-lg hover:bg-strawberry transition-all duration-300 group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform" />
          <span className="font-bold text-xs uppercase tracking-widest">Add New Masterpiece</span>
        </button>
      </div>

      <div className="bg-white/50 backdrop-blur-sm rounded-[2rem] p-8 border border-chocolate/10 shadow-bakery">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-chocolate/10 border-t-chocolate rounded-full animate-spin" />
            <p className="text-chocolate-light font-medium animate-pulse">Loading gallery items...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="w-20 h-20 bg-chocolate/5 rounded-full flex items-center justify-center mx-auto">
              <ImageIcon className="text-chocolate/20" size={40} />
            </div>
            <div>
              <p className="text-xl font-bold text-chocolate font-dancing">No sweet memories yet</p>
              <p className="text-sm text-chocolate-light">Start by adding your first gallery image.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map(it => (
              <div key={it._id || it.id} className="group relative bg-white rounded-3xl overflow-hidden border border-chocolate/5 shadow-bakery hover:shadow-bakery-lg transition-all duration-500">
                <div className="aspect-[4/3] overflow-hidden relative">
                  {
                    (() => {
                      const raw = it.src || '';
                      const src = resolveImageSrc(raw);
                      return (
                        <div
                          className="w-full h-full bg-center bg-cover"
                          style={{ backgroundImage: `url(${src})` }}
                          data-resolved-src={src}
                        >
                          <img
                            src={src}
                            alt={it.alt || it.title}
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-0"
                          />
                        </div>
                      );
                    })()
                  }
                  <div className="absolute inset-0 bg-gradient-to-t from-chocolate/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-4 right-4 flex gap-2 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <button onClick={() => openEdit(it)} className="p-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:bg-strawberry hover:text-white transition-colors">
                      <Edit size={16}/>
                    </button>
                    <button onClick={() => handleDelete(it._id || it.id)} className="p-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:bg-red-500 hover:text-white transition-colors text-red-500">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                  {it.category && (
                    <div className="absolute bottom-4 left-4">
                      <span className="px-3 py-1 bg-strawberry text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm">
                        {it.category}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="font-bold text-chocolate text-lg leading-tight truncate">{it.title}</h4>
                    {it.badge && <span className="px-3 py-1 bg-chocolate/10 text-chocolate text-[11px] font-bold rounded-full uppercase">{it.badge}</span>}
                  </div>
                  {it.price && <p className="text-strawberry font-bold mt-1 text-sm">{it.price}</p>}
                  {it.desc && <p className="text-sm text-chocolate-light mt-2 truncate">{it.desc}</p>}
                  <div className="mt-2 space-y-1 text-[11px] text-chocolate-light">
                    {it.alt !== undefined && <div><strong>Alt:</strong> <span className="ml-1">{it.alt || '-'}</span></div>}
                    {it.cloudinaryPublicId && <div><strong>Cloudinary ID:</strong> <span className="ml-1 truncate">{it.cloudinaryPublicId}</span></div>}
                    {it.createdAt && <div><strong>Created:</strong> <span className="ml-1">{new Date(it.createdAt).toLocaleString()}</span></div>}
                    {it.src && (
                      <div>
                        <a href={it.src} target="_blank" rel="noreferrer" className="underline text-[11px]">Open image</a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent side="right" className="flex flex-col h-full bg-[#FAFBFD] p-0 border-l border-chocolate/10">
          <SheetHeader className="p-8 bg-white border-b border-chocolate/5 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-strawberry/5 rounded-full -mr-16 -mt-16 blur-3xl" />
             <div className="relative flex items-center gap-4">
                <div className="w-12 h-12 bg-chocolate text-white rounded-2xl flex items-center justify-center shadow-lg">
                  <ImageIcon size={24} />
                </div>
                <div>
                  <SheetTitle className="text-2xl font-bold text-chocolate font-dancing">
                    {editing ? 'Edit Masterpiece' : 'Add New creation'}
                  </SheetTitle>
                  <SheetDescription className="text-chocolate-light font-medium">
                    {editing ? 'Update the details for your sweet memory.' : 'Capture and share a new addition to the gallery.'}
                  </SheetDescription>
                </div>
             </div>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-chocolate/60 uppercase tracking-widest ml-1">Title</label>
                  <input name="title" defaultValue={editing?.title || ''} required className="w-full px-4 py-3 rounded-2xl bg-white border border-chocolate/10 focus:border-strawberry focus:ring-4 focus:ring-strawberry/5 outline-none transition-all shadow-sm" placeholder="Give your creation a name..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-chocolate/60 uppercase tracking-widest ml-1">Category</label>
                    <input name="category" defaultValue={editing?.category || ''} className="w-full px-4 py-3 rounded-2xl bg-white border border-chocolate/10 focus:border-strawberry focus:ring-4 focus:ring-strawberry/5 outline-none transition-all shadow-sm" placeholder="e.g. Cakes" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-chocolate/60 uppercase tracking-widest ml-1">Badge</label>
                    <input name="badge" defaultValue={editing?.badge || ''} className="w-full px-4 py-3 rounded-2xl bg-white border border-chocolate/10 focus:border-strawberry focus:ring-4 focus:ring-strawberry/5 outline-none transition-all shadow-sm" placeholder="e.g. New" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-chocolate/60 uppercase tracking-widest ml-1">Price / Tag</label>
                  <input name="price" defaultValue={editing?.price || ''} className="w-full px-4 py-3 rounded-2xl bg-white border border-chocolate/10 focus:border-strawberry focus:ring-4 focus:ring-strawberry/5 outline-none transition-all shadow-sm" placeholder="e.g. Starting from $20" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-chocolate/60 uppercase tracking-widest ml-1">Description</label>
                <textarea name="desc" defaultValue={editing?.desc || ''} className="w-full px-4 py-3 rounded-2xl bg-white border border-chocolate/10 focus:border-strawberry focus:ring-4 focus:ring-strawberry/5 outline-none transition-all shadow-sm min-h-[100px]" placeholder="Tell the story behind this delight..." />
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-chocolate/60 uppercase tracking-widest ml-1">Image Presentation</label>
                <div className="relative group overflow-hidden rounded-3xl border-2 border-dashed border-chocolate/20 bg-chocolate/5 flex flex-col items-center justify-center p-8 transition-all hover:border-strawberry/40 hover:bg-strawberry/5">
                  {preview ? (
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
                      <img src={preview} className="w-full h-full object-cover" alt="preview" />
                      <button 
                        type="button" 
                        onClick={() => { setPreview(null); setFileData(null); }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-chocolate-light cursor-pointer">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-bakery">
                        <Plus className="text-strawberry" />
                      </div>
                      <div className="text-center">
                        <span className="font-bold text-sm block">Click to upload cover</span>
                        <span className="text-[10px] opacity-70">PNG, JPG or WEBP (Max. 500KB)</span>
                      </div>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files ? e.target.files[0] : undefined)} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>
            </div>

            <SheetFooter className="pt-4 border-t border-chocolate/5 gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-6 py-3 rounded-full border border-chocolate/10 font-bold text-chocolate hover:bg-chocolate/5 transition-colors">Cancel</button>
              <button type="submit" className="flex-1 px-6 py-3 bg-chocolate text-white rounded-full font-bold shadow-bakery hover:shadow-bakery-lg hover:bg-strawberry transition-all">Save Changes</button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
