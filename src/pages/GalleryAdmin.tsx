import React, { useEffect, useState, useRef } from "react";
import { api } from "@/services/api";
import axiosInstance from "@/services/api";
import { toast } from "sonner";
import { X, Plus, Edit, Trash2 } from "lucide-react";

interface GalleryItem {
  _id?: string;
  id?: string;
  title: string;
  alt?: string;
  category?: string;
  src?: string; // data URI or relative path
  badge?: string;
  price?: string;
  desc?: string;
}

const empty: GalleryItem = { title: "", alt: "", category: "Misc", src: "", badge: "", price: "", desc: "" };

export default function GalleryAdmin() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<GalleryItem>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  // track any object URLs created from binary buffers so we can revoke them
  const objectUrlsRef = useRef<string[]>([]);

  // maximum allowed bytes (500 KB)
  const MAX_BYTES = 500 * 1024;

  const estimateBase64Size = (b64: string) => {
    if (!b64) return 0;
    const padding = b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0;
    return Math.ceil((b64.length * 3) / 4) - padding;
  };

  const estimateDataUriSize = (dataUri?: string) => {
    if (!dataUri) return 0;
    const comma = dataUri.indexOf(',');
    if (comma === -1) return 0;
    const metadata = dataUri.substring(0, comma);
    const data = dataUri.substring(comma + 1);
    // if base64 encoded
    if (metadata.indexOf(';base64') !== -1) {
      return estimateBase64Size(data);
    }
    // otherwise attempt percent-decoding
    try {
      return new TextEncoder().encode(decodeURIComponent(data)).length;
    } catch {
      return data.length;
    }
  };

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  // revoke object URLs on unmount
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
      // debug: inspect raw backend response
      console.log('gallery.getAll response:', res);
      // normalize response whether backend returns array or wrapper { data: [...] }
      const data = Array.isArray(res) ? res : (res && (res.data || res)) || [];

      // revoke previously created object URLs to avoid leaks
      objectUrlsRef.current.forEach(url => {
        try { URL.revokeObjectURL(url); } catch (e) { /* ignore */ }
      });
      objectUrlsRef.current = [];

      const arr = data as unknown[];
      const normalized = arr.map((itRaw) => {
        const it = itRaw as Record<string, unknown>;
        const id = (it._id as string) || (it.id as string);
        // prefer imgBase64 from backend if provided (may be full data URI or plain base64)
        const imgBase64 = it.imgBase64 as unknown;
        const srcVal = it.src as unknown;
        let src: string | undefined;

        if (typeof imgBase64 === 'string' && imgBase64.trim()) {
          src = imgBase64;
          // if backend sent plain base64 without data: prefix, add default mime
          if (!src.startsWith('data:')) {
            src = `data:image/png;base64,${src}`;
          }
        } else if (typeof srcVal === 'string') {
          src = srcVal;
          // if it's a plain base64 string (no leading slash, http, or data) treat as base64
          if (!src.startsWith('data:') && !src.startsWith('/') && !src.startsWith('http')) {
            src = `data:image/png;base64,${src}`;
          }
        } else if (srcVal && typeof srcVal === 'object') {
          // try Buffer-like object { type: 'Buffer', data: number[] }
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
      toast.error("Failed to load gallery");
    } finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      // use api helper to fetch categories (normalized by api.ts)
      const res = await api.categories.getAll() as unknown;
      const arr = Array.isArray(res) ? res : (res && (res.data || res)) || [];
      const cats = (arr as unknown[]).map(c => {
        if (typeof c === 'string') return c;
        const obj = c as Record<string, unknown>;
        return (obj.name as string) || (obj.title as string) || (obj.category as string) || undefined;
      }).filter(Boolean) as string[];
      setCategories(cats);
    } catch (e) {
      setCategories([]);
    }
  };

  const openAdd = () => {
    // default category to first fetched category (if any)
    setForm({ ...empty, category: categories && categories.length ? categories[0] : empty.category });
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

  const handleSrcChange = (val: string) => {
    if (val && val.startsWith('data:')) {
      const size = estimateDataUriSize(val);
      if (size > MAX_BYTES) {
        toast.error('Data URI image must be 500KB or smaller');
        return;
      }
    }
    setForm(prev => ({ ...prev, src: val }));
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!form.title || !form.title.trim()) { toast.error('Title required'); return; }

    // final size check for data URI images
    if (form.src && form.src.startsWith('data:')) {
      const size = estimateDataUriSize(form.src);
      if (size > MAX_BYTES) { toast.error('Image exceeds 500KB'); return; }
    }

    try {
      setLoading(true);
      if (editingId) {
        await api.gallery.update(editingId as any, form as any);
        toast.success('Gallery item updated');
        await fetchItems();
      } else {
        await api.gallery.create(form as any);
        toast.success('Gallery item created');
        await fetchItems();
      }
      closeForm();
    } catch (err) {
      toast.error('Save failed');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm('Delete this item?')) return;
    try {
      setLoading(true);
      await api.gallery.delete(id as any);
      toast.success('Deleted');
      setItems(items.filter(i => (i.id || i._id) !== id));
    } catch (e) { toast.error('Delete failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-playfair">Gallery Admin</h2>
          <p className="text-sm text-[#8D6E63]">Add, edit or remove gallery images. Public gallery page remains view-only.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={openAdd} className="px-4 py-2 bg-[#1A2744] text-white rounded-md flex items-center gap-2">
            <Plus size={16}/> Add Image
          </button>
          <button onClick={fetchItems} className="px-4 py-2 bg-white border rounded-md">Refresh</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(it => (
          <div key={it.id || it._id} className="bg-white rounded-xl p-3 shadow-md flex flex-col">
            <div className="h-40 bg-gray-100 rounded-md overflow-hidden mb-3">
              {it.src ? <img src={it.src.startsWith('data:') ? it.src : (it.src.startsWith('/') ? it.src : `/${it.src}`)} alt={it.alt || it.title} className="w-full h-full object-cover"/> : <div className="w-full h-full grid place-items-center text-sm text-gray-500">No image</div>}
            </div>
            <div className="flex-1">
              <div className="font-semibold">{it.title}</div>
              <div className="text-xs text-[#8D6E63]">{it.category} {it.badge ? `• ${it.badge}` : ''}</div>
              <div className="text-sm text-[#5D4037] mt-2 truncate">{it.desc}</div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <button onClick={() => openEdit(it)} className="px-3 py-1 bg-[#FAF6E6] rounded-md flex items-center gap-2"><Edit size={14}/> Edit</button>
              <button onClick={() => handleDelete(it.id || it._id)} className="px-3 py-1 bg-[#FFEAEA] rounded-md flex items-center gap-2"><Trash2 size={14}/> Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* simple modal form */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl max-w-xl w-full p-6 relative">
            <button type="button" onClick={closeForm} className="absolute right-4 top-4 text-gray-500"><X/></button>
            <h3 className="text-xl font-semibold mb-4">{editingId ? 'Edit' : 'Add'} Gallery Item</h3>
            <div className="grid grid-cols-1 gap-3">
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Title" className="w-full p-2 border rounded" />
              <input value={form.alt} onChange={e => setForm({...form, alt: e.target.value})} placeholder="Alt text" className="w-full p-2 border rounded" />
              {/* category dropdown (populated from API) */}
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full p-2 border rounded">
                {categories.length === 0 && <option value={form.category || 'Misc'}>Misc</option>}
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input value={form.badge} onChange={e => setForm({...form, badge: e.target.value})} placeholder="Badge" className="w-full p-2 border rounded" />
              <input value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="Price" className="w-full p-2 border rounded" />
              <textarea value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} placeholder="Description" className="w-full p-2 border rounded" />

              <div className="flex items-center gap-3">
                <input type="file" accept="image/*" onChange={e => handleFile(e.target.files && e.target.files[0] ? e.target.files[0] : undefined)} />
                <div className="text-sm text-gray-500">Or paste a data URI into the src field below</div>
              </div>
              <input value={form.src} onChange={e => handleSrcChange(e.target.value)} placeholder="Image src (data URI or /uploads...)" className="w-full p-2 border rounded" />

              <div className="flex justify-end gap-2 mt-3">
                <button type="button" onClick={closeForm} className="px-4 py-2 rounded border">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#D4A373] text-[#2C1810] rounded">Save</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {loading && <div className="text-center text-sm">Working…</div>}
    </div>
  );
}
