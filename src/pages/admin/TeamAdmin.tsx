import React, { useEffect, useState } from 'react';
import { getToken } from '@/services/auth';
import { Plus, Edit, Trash2, Camera, User, Quote, RefreshCw, X, Award, Sparkles, Star, History, Image as ImageIcon, ArrowLeft, FileText } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { toast } from 'sonner';

type TeamMember = {
  _id?: string;
  name: string;
  role?: string;
  since?: string;
  quote?: string;
  desc?: string;
  img?: string;
  badge?: string;
  badgeBg?: string;
  order?: number;
};

const MAX_IMAGE_SIZE_BYTES = 500 * 1024; // 500KB

export default function TeamAdmin(): JSX.Element {
  const [items, setItems] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [showForm, setShowForm] = useState(false);

  const emptyForm: TeamMember = { name: '', role: '', since: '', quote: '', desc: '', img: '', badge: '', badgeBg: '', order: 0 };
  const [form, setForm] = useState<TeamMember>(emptyForm);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const apiBase = (import.meta.env && (import.meta.env.VITE_API_URL as string)) || 'http://localhost:5000';
  const token = getToken();
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const resolveImageUrl = (src?: string | null) => {
    if (!src) return '/about-baker.png';
    if (src.startsWith('blob:')) return src;
    if (src.startsWith('http://') || src.startsWith('https://')) return src;
    if (src.startsWith('/uploads')) return apiBase + src;
    if (src.startsWith('/')) return src;
    return src;
  };

  const fetchTeam = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/api/team`);
      if (!res.ok) throw new Error(`Failed to fetch team: ${res.status}`);
      const data = await res.json();
      if (data && data.ok && Array.isArray(data.team)) {
        setItems(data.team.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)));
      } else {
        setItems([]);
      }
    } catch (err: any) {
      toast.error('Failed to load artisan collective');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
    return () => { if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview); };
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditing(null);
    setFile(null);
    setPreview(null);
    setShowForm(true);
  };

  const openEdit = (m: TeamMember) => {
    setForm({ ...m });
    setEditing(m);
    setFile(null);
    setPreview(resolveImageUrl(m.img || null));
    setShowForm(true);
  };

  const handleFileChange = (f?: File | null) => {
    if (preview && preview.startsWith('blob:')) {
      try { URL.revokeObjectURL(preview); } catch (e) {}
    }
    if (!f) {
      setFile(null);
      setPreview(null);
      return;
    }
    if (f.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error('Portrait image must be 500KB or smaller');
      setFile(null);
      setPreview(null);
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submitForm = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const isEdit = !!(editing && editing._id);
      const url = isEdit ? `${apiBase}/api/team/${editing!._id}` : `${apiBase}/api/team`;

      if (file) {
        const fd = new FormData();
        fd.append('image', file);
        fd.append('name', form.name || '');
        if (form.role) fd.append('role', form.role);
        if (form.since) fd.append('since', form.since);
        if (form.quote) fd.append('quote', form.quote);
        if (form.desc) fd.append('desc', form.desc);
        if (form.badge) fd.append('badge', form.badge);
        fd.append('order', String(form.order ?? 0));

        const res = await fetch(url, {
          method: isEdit ? 'PUT' : 'POST',
          headers: { ...authHeader },
          body: fd,
        });
        if (!res.ok) throw new Error('Portrayal upload failed');
      } else {
        const payload = { ...form } as any;
        delete payload.badgeBg;
        const res = await fetch(url, {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeader },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Save failed');
      }

      await fetchTeam();
      setShowForm(false);
      toast.success(isEdit ? 'Artisan modified' : 'Artisan welcomed');
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (id?: string) => {
    if (!id) return;
    if (!confirm('Remove this artisan from your collective?')) return;
    try {
      const res = await fetch(`${apiBase}/api/team/${id}`, {
        method: 'DELETE',
        headers: { ...authHeader },
      });
      if (!res.ok) throw new Error('Removal failed');
      setItems((s) => s.filter((x) => x._id !== id));
      toast.success('Artisan removed.');
    } catch (err: any) {
      toast.error('Failed to remove artisan');
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 font-lora pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold font-dancing text-chocolate">Artisan Collective</h2>
          <p className="text-sm text-chocolate-light font-medium mt-1">
            Celebrating the master hands and visionary souls behind every creation.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchTeam}
            className="p-3 bg-white border border-chocolate/10 rounded-full text-chocolate hover:bg-strawberry/5 transition-all shadow-sm group"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
          </button>
          <button 
            onClick={openCreate}
            className="px-8 py-3 bg-chocolate text-white rounded-full flex items-center gap-3 shadow-bakery hover:shadow-bakery-lg hover:bg-strawberry transition-all duration-300"
          >
            <Plus size={20} />
            <span className="font-bold text-xs uppercase tracking-widest text-[#F5ECD7]">New Artisan</span>
          </button>
        </div>
      </div>

      {loading && items.length === 0 ? (
        <div className="bg-white/50 backdrop-blur-sm rounded-[3rem] border border-chocolate/5 shadow-bakery p-32 flex flex-col items-center justify-center gap-6 animate-pulse">
          <div className="w-16 h-16 border-4 border-chocolate/10 border-t-strawberry rounded-full animate-spin" />
          <p className="text-chocolate-light font-bold uppercase tracking-widest text-xs italic">Gathering the artisans...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {items.map((m) => (
            <div key={m._id} className="group relative bg-white rounded-[3rem] p-8 border border-chocolate/5 shadow-bakery hover:shadow-bakery-lg transition-all duration-500 overflow-hidden flex flex-col h-full">
               <div className="absolute top-0 right-0 w-32 h-32 bg-strawberry/5 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-strawberry/10" />
               
               <div className="relative flex flex-col items-center text-center flex-1">
                  <div className="relative mb-8 pt-4">
                    <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-[#FAF6E6] shadow-lg group-hover:scale-105 transition-transform duration-700 transform -rotate-3 group-hover:rotate-0">
                      <img src={resolveImageUrl(m.img)} alt={m.name} className="w-full h-full object-cover" />
                    </div>
                    {m.badge && (
                      <div className="absolute -bottom-2 -right-2 px-3 py-1 bg-strawberry text-white text-[8px] font-bold uppercase tracking-widest rounded-full shadow-lg border-2 border-white transform rotate-6">
                        <Sparkles size={8} className="inline mr-1" />
                        {m.badge}
                      </div>
                    )}
                  </div>

                  <div className="mb-6 space-y-1">
                    <h3 className="text-2xl font-bold font-playfair text-chocolate group-hover:text-strawberry transition-colors italic leading-tight">{m.name}</h3>
                    <div className="flex items-center justify-center gap-2">
                        <Star size={10} className="text-strawberry/40" />
                        <p className="text-[10px] font-bold text-chocolate-light uppercase tracking-widest">{m.role}</p>
                        <Star size={10} className="text-strawberry/40" />
                    </div>
                  </div>

                  {m.quote && (
                    <div className="relative px-8 py-6 mb-6 bg-[#FAF6E6]/40 rounded-[2rem] border border-chocolate/5 shadow-inner w-full">
                       <Quote className="absolute top-3 left-4 text-strawberry/10 w-6 h-6" />
                       <p className="text-sm text-chocolate-light italic font-medium leading-relaxed font-lora">
                         "{m.quote}"
                       </p>
                    </div>
                  )}

                  <p className="text-sm text-chocolate-light/60 line-clamp-4 leading-relaxed italic mb-8 flex-1">
                    {m.desc || "An artisan whose passion brings every sweet vision to life."}
                  </p>

                  <div className="w-full flex items-center justify-between pt-8 border-t border-chocolate/5">
                    <div className="flex flex-col items-start">
                        <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-chocolate/20">Legacy</span>
                        <span className="text-[10px] font-bold text-chocolate-light italic">{m.since ? `Since ${m.since}` : 'Pure Talent'}</span>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => openEdit(m)}
                        className="p-3 bg-white border border-chocolate/10 rounded-full text-chocolate hover:bg-chocolate hover:text-white transition-all shadow-sm active:scale-95"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => removeItem(m._id)}
                        className="p-3 bg-white border border-red-50 rounded-full text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
               </div>
            </div>
          ))}
          
          {items.length === 0 && !loading && (
             <div className="col-span-full py-32 text-center space-y-6">
                <div className="w-24 h-24 bg-chocolate/5 rounded-full flex items-center justify-center mx-auto text-chocolate/10 transform rotate-12">
                  <User size={48} />
                </div>
                <div>
                   <h3 className="text-2xl font-bold font-playfair text-chocolate">The Collective is Silent</h3>
                   <p className="text-chocolate-light font-medium italic mt-2">Begin building your team by enrolling your first master artisan.</p>
                </div>
             </div>
          )}
        </div>
      )}

      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent side="right" className="flex flex-col h-full bg-[#FAFBFD] p-0 border-l border-chocolate/10">
          <SheetHeader className="p-10 bg-white border-b border-chocolate/5 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-strawberry/5 rounded-full -mr-32 -mt-32 blur-3xl" />
             <div className="relative flex items-center gap-6">
                <div className="w-16 h-16 bg-chocolate text-white rounded-2xl flex items-center justify-center shadow-bakery transform rotate-3">
                  <User size={28} />
                </div>
                <div>
                  <SheetTitle className="text-4xl font-bold text-chocolate font-dancing">
                    {editing ? 'Artisan Story' : 'New Artisan'}
                  </SheetTitle>
                  <SheetDescription className="text-chocolate-light font-medium italic">
                    {editing ? `Refining the portrait of ${form.name}.` : 'Introducing a new visionary to the artisan circle.'}
                  </SheetDescription>
                </div>
             </div>
          </SheetHeader>

          <form id="team-form" onSubmit={submitForm} className="flex-1 overflow-y-auto p-10 space-y-10">
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 group">
                  <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Full Name</label>
                  <div className="relative">
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
                      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 outline-none transition-all font-medium placeholder:text-chocolate/10" required placeholder="e.g. Julian Artisan" />
                  </div>
                </div>

                <div className="space-y-2 group">
                  <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Artisan Role</label>
                  <div className="relative">
                      <Award size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
                      <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 outline-none transition-all font-medium placeholder:text-chocolate/10" placeholder="e.g. Master Chocolatier" />
                  </div>
                </div>

                <div className="space-y-2 group">
                  <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Member Since</label>
                  <div className="relative">
                      <History size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
                      <input value={form.since} onChange={(e) => setForm({ ...form, since: e.target.value })} className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 outline-none transition-all font-medium placeholder:text-chocolate/10" placeholder="e.g. Winter 2018" />
                  </div>
                </div>

                <div className="space-y-2 group">
                  <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Display Priority</label>
                  <div className="relative">
                      <Star size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
                      <input type="number" value={form.order ?? 0} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 outline-none transition-all font-medium" />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2 group">
                  <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Philosophy Quote</label>
                  <div className="relative">
                      <Quote size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
                      <input value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 outline-none transition-all font-medium italic placeholder:text-chocolate/10" placeholder="Words that inspire their craft..." />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2 group">
                  <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Artisan Narrative</label>
                  <div className="relative">
                      <FileText size={18} className="absolute left-4 top-6 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
                      <textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 outline-none transition-all font-medium min-h-[140px] resize-none leading-relaxed italic placeholder:text-chocolate/10" placeholder="Briefly weave the artisan's journey..." rows={3} />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-6 pt-6 border-t border-chocolate/5">
                  <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Artisan Portrait</label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="relative group/upload overflow-hidden rounded-[2.5rem] border-2 border-dashed border-chocolate/10 bg-white flex flex-col items-center justify-center p-10 transition-all hover:bg-strawberry/5 hover:border-strawberry/30 shadow-sm cursor-pointer">
                        {preview ? (
                            <div className="relative w-40 h-40 rounded-[2rem] overflow-hidden shadow-bakery border-4 border-white transform rotate-2">
                            <img src={preview} className="w-full h-full object-cover" alt="Artisan Preview" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center">
                                <button 
                                    type="button" 
                                    onClick={() => { setPreview(null); setFile(null); setForm({...form, img: ''}); }}
                                    className="p-3 bg-red-500 text-white rounded-full shadow-lg transform scale-90 group-hover/upload:scale-100 transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-16 h-16 bg-chocolate/5 rounded-full flex items-center justify-center text-chocolate/10">
                                <Camera size={32} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-chocolate/40 uppercase tracking-widest">Upload Portrait</p>
                                <p className="text-[9px] text-chocolate/20 italic mt-1 font-medium">Click or drag & drop</p>
                            </div>
                            </div>
                        )}
                        <input type="file" accept="image/*" onChange={(ev) => handleFileChange(ev.target.files?.[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>

                    <div className="flex flex-col justify-center space-y-6">
                        <div className="space-y-2 group">
                            <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Or Portrait URL</label>
                            <div className="relative">
                                <ImageIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
                                <input value={form.img} onChange={(e) => setForm({ ...form, img: e.target.value })} className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-chocolate/10 text-xs outline-none focus:border-strawberry transition-all" placeholder="https://..." disabled={!!file} />
                            </div>
                        </div>

                        <div className="space-y-2 group">
                            <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Artisan Badge</label>
                            <div className="relative">
                                <Award size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
                                <input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-chocolate/10 text-xs outline-none focus:border-strawberry transition-all" placeholder="e.g. Signature Artist" />
                            </div>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>

          <SheetFooter className="p-10 bg-white border-t border-chocolate/5 flex flex-row gap-4 items-center justify-between">
            <button 
              type="button" 
              onClick={() => setShowForm(false)} 
              className="px-10 py-4 rounded-full border border-chocolate/10 font-bold text-chocolate bg-white hover:bg-chocolate/5 transition-all text-xs uppercase tracking-[0.2em] italic active:scale-95"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              form="team-form"
              disabled={loading}
              className="px-12 py-4 bg-chocolate text-white rounded-full font-bold shadow-bakery hover:bg-strawberry transition-all text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95"
            >
              {loading && <RefreshCw size={18} className="animate-spin" />}
              {editing ? 'Save Changes' : 'Welcome Artisan'}
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
