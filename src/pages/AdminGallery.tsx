import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';

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

export default function AdminGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileData, setFileData] = useState<string | null>(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.gallery.getAll();
      // api wrapper normalizes response to the data payload; ensure array
      const list = Array.isArray(res) ? res : (res && (res as any).data) || [];
      setItems(list as GalleryItem[]);
    } catch (e) {
      toast.error('Failed to load gallery');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setEditing(null); setPreview(null); setFileData(null); setShowForm(true); };
  const openEdit = (it: GalleryItem) => { setEditing(it); setPreview(it.src || null); setFileData(null); setShowForm(true); };

  const handleFile = (f?: File) => {
    if (!f) { setPreview(null); setFileData(null); return; }
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
        const updatedItem: GalleryItem = (updatedRes && ((updatedRes as any).data || updatedRes)) as GalleryItem;
        setItems(items.map(it => ((it._id === id || it.id === id) ? { ...it, ...updatedItem } : it)));
        toast.success('Gallery item updated');
      } else {
        const createdRes = await api.gallery.create(payload as object);
        const createdItem: GalleryItem = (createdRes && ((createdRes as any).data || createdRes)) as GalleryItem;
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-playfair">Gallery Admin</h2>
          <p className="text-sm text-[#8D6E63]">Add, edit and remove gallery images shown on public gallery.</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2 bg-[#1A2744] text-white rounded-lg flex items-center gap-2">
          <Plus size={16}/> Add Image
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-[#D4A373]/20">
        {loading ? <div>Loading…</div> : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {items.map(it => (
              <div key={it._id || it.id} className="border rounded-lg overflow-hidden bg-[#FAF6E6]">
                <img src={it.src?.startsWith('data:') ? it.src : (it.src ? (it.src.startsWith('/') ? it.src : `/${it.src}`) : '/placeholder.svg')} alt={it.alt || it.title} className="w-full h-40 object-cover" />
                <div className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{it.title}</div>
                      <div className="text-xs text-[#8D6E63]">{it.category}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(it)} className="p-2 bg-white/60 rounded"><Edit size={14}/></button>
                      <button onClick={() => handleDelete(it._id || it.id)} className="p-2 bg-white/60 rounded"><Trash2 size={14}/></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* form modal simple */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl w-full max-w-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">{editing ? 'Edit Image' : 'Add Image'}</h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-sm text-[#8D6E63]">Close</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1">Title</label>
                <input name="title" defaultValue={editing?.title || ''} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-xs mb-1">Category</label>
                <input name="category" defaultValue={editing?.category || ''} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-xs mb-1">Badge</label>
                <input name="badge" defaultValue={editing?.badge || ''} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-xs mb-1">Price</label>
                <input name="price" defaultValue={editing?.price || ''} className="w-full p-2 border rounded" />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs mb-1">Description</label>
              <textarea name="desc" defaultValue={editing?.desc || ''} className="w-full p-2 border rounded" />
            </div>

            <div className="mt-3 flex items-center gap-4">
              <div>
                <label className="block text-xs mb-1">Image</label>
                <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files ? e.target.files[0] : undefined)} />
              </div>
              {preview && <img src={preview} className="w-32 h-20 object-cover rounded" alt="preview" />}
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded border">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-[#1A2744] text-white rounded">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
