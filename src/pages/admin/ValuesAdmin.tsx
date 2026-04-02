import { useEffect, useState } from 'react';
import axiosInstance from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, Trash2, Sparkles, Star, Edit, RefreshCw, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ValuesAdmin() {
  const [values, setValues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<any>({ icon: '✨', title: '', desc: '', accent: '#B46060', bg: '#FFF4F4', border: '#FFDEDE' });
  const navigate = useNavigate();

  const fetchValues = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/values');
      const data = res?.data || {};
      setValues(data.values || []);
    } catch (err) {
      toast.error('Failed to load values');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchValues();
  }, []);

  const openCreate = () => {
    setForm({ icon: '✨', title: '', desc: '', accent: '#B46060', bg: '#FFF4F4', border: '#FFDEDE' });
    setEditingIndex(null);
    setShowModal(true);
  };

  const openEdit = (idx: number) => {
    setForm({ ...values[idx] });
    setEditingIndex(idx);
    setShowModal(true);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let newValues = [...values];
    if (editingIndex !== null) {
      newValues[editingIndex] = form;
    } else {
      newValues.push(form);
    }
    
    setSaving(true);
    try {
      await axiosInstance.put('/values', { values: newValues });
      setValues(newValues);
      setShowModal(false);
      toast.success('Brand values updated!');
    } catch (err) {
      toast.error('Failed to save values.');
    } finally {
      setSaving(false);
    }
  };

  const removeAt = async (idx: number) => {
    if (!confirm('Remove this value from your brand identity?')) return;
    const newValues = values.filter((_, i) => i !== idx);
    setSaving(true);
    try {
      await axiosInstance.put('/values', { values: newValues });
      setValues(newValues);
      toast.success('Value removed.');
    } catch (err) {
      toast.error('Failed to remove value.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 font-lora max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div>
          <h2 className="text-4xl font-bold font-dancing text-chocolate">Brand Values</h2>
          <p className="text-sm text-chocolate-light font-medium mt-1">
            Curate the guiding principles that define your artisanal legacy.
          </p>
        </div>
        <div className="flex items-center gap-4">
           <button 
            onClick={() => navigate('/admin')} 
            className="p-3 bg-white border border-chocolate/5 rounded-full text-chocolate hover:bg-strawberry/5 transition-all shadow-sm group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={fetchValues}
            className="p-3 bg-white border border-chocolate/5 rounded-full text-chocolate hover:bg-strawberry/5 transition-all shadow-sm group"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
          </button>
          <button 
            onClick={openCreate}
            className="px-8 py-3 bg-chocolate text-white rounded-full flex items-center gap-3 shadow-bakery hover:shadow-bakery-lg hover:bg-strawberry transition-all duration-300 font-bold text-xs uppercase tracking-widest active:scale-95"
          >
            <Plus size={20} />
            New Value
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white/50 backdrop-blur-sm rounded-[3rem] border border-chocolate/5 shadow-bakery p-32 flex flex-col items-center justify-center gap-6 animate-pulse">
          <div className="w-16 h-16 border-4 border-chocolate/10 border-t-strawberry rounded-full animate-spin" />
          <p className="text-chocolate-light font-bold uppercase tracking-widest text-xs italic">Consulting the heritage...</p>
        </div>
      ) : (
        <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] shadow-bakery border border-chocolate/5 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-chocolate/5 hover:bg-transparent">
                <TableHead className="w-20 pl-8 h-16 font-bold text-chocolate italic uppercase tracking-widest text-[10px]">Icon</TableHead>
                <TableHead className="h-16 font-bold text-chocolate/80 uppercase tracking-widest text-[10px]">Pillar Title</TableHead>
                <TableHead className="h-16 font-bold text-chocolate/80 uppercase tracking-widest text-[10px] hidden lg:table-cell">The Philosophy</TableHead>
                <TableHead className="pr-8 h-16 font-bold text-chocolate italic uppercase tracking-widest text-[10px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {values.map((v, idx) => (
                <TableRow key={idx} className="group border-chocolate/5 hover:bg-strawberry/[0.02] transition-colors duration-500">
                  <TableCell className="py-6 pl-8">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm border border-chocolate/5 group-hover:scale-110 transition-transform transform rotate-3">
                      {v.icon}
                    </div>
                  </TableCell>
                  <TableCell className="py-6">
                    <span className="font-bold text-chocolate text-lg tracking-tight group-hover:text-strawberry transition-colors leading-none italic pb-1 block border-b-2 border-strawberry/20 w-fit">
                      {v.title}
                    </span>
                  </TableCell>
                  <TableCell className="py-6 hidden lg:table-cell">
                    <p className="text-sm text-chocolate-light/60 font-medium italic line-clamp-1 max-w-md">
                      {v.desc}
                    </p>
                  </TableCell>
                  <TableCell className="py-6 pr-8 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(idx)}
                        className="p-3 bg-white border border-chocolate/10 rounded-full text-chocolate hover:bg-chocolate hover:text-white transition-all shadow-sm active:scale-95"
                        title="Edit Pillar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => removeAt(idx)}
                        className="p-3 bg-white border border-red-100 rounded-full text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
                        title="Delete Pillar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {values.length === 0 && (
            <div className="py-32 text-center space-y-6">
              <div className="w-24 h-24 bg-cream/50 rounded-full flex items-center justify-center mx-auto text-chocolate/10 transform -rotate-12 shadow-inner">
                <Star size={48} />
              </div>
              <div>
                <h3 className="text-2xl font-bold font-playfair text-chocolate">Legacy Discovery</h3>
                <p className="text-chocolate-light font-medium italic mt-2">Start by defining the first pillar of your brand heritage.</p>
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={showModal} onOpenChange={(open) => !open && setShowModal(false)}>
        <DialogContent className="max-w-[95vw] md:max-w-2xl h-[90vh] flex flex-col p-0 bg-[#FAFBFD] border-none overflow-hidden rounded-[2.5rem]">
          <DialogHeader className="p-10 bg-white border-b border-chocolate/5 relative shrink-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-strawberry/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="relative flex items-center gap-6">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-bakery border border-chocolate/5 transform rotate-3">
                {form.icon || '✨'}
              </div>
              <div>
                <DialogTitle className="text-4xl font-bold text-chocolate font-dancing">
                  {editingIndex !== null ? "Refine Pillar" : "New Principle"}
                </DialogTitle>
                <DialogDescription className="text-chocolate-light font-medium italic">
                  {editingIndex !== null ? "Deepen the philosophy behind this value." : "Envision a new guiding star for your artisanal circle."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form id="values-form" onSubmit={handleSave} className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-2 group">
                  <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Symbol</label>
                  <input 
                    value={form.icon} 
                    onChange={e => setForm({ ...form, icon: e.target.value })} 
                    className="w-full h-[58px] text-center text-2xl bg-white border border-chocolate/5 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl outline-none" 
                  />
                </div>
                <div className="md:col-span-3 space-y-2 group">
                  <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Headline</label>
                  <input 
                    required
                    value={form.title} 
                    onChange={e => setForm({ ...form, title: e.target.value })} 
                    className="w-full px-6 py-4 bg-white border border-chocolate/5 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm italic font-bold text-chocolate outline-none placeholder:text-chocolate/10" 
                    placeholder="e.g. Handmade Heritage"
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">The Philosophy</label>
                <textarea 
                  required
                  value={form.desc} 
                  onChange={e => setForm({ ...form, desc: e.target.value })} 
                  className="w-full px-6 py-5 rounded-[2rem] bg-white border border-chocolate/5 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 outline-none text-sm text-chocolate-light font-medium min-h-[160px] resize-none leading-relaxed italic placeholder:text-chocolate/10"
                  placeholder="Tell the story of how this value shapes your craft..."
                />
              </div>

              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-chocolate/5">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-chocolate/30 uppercase tracking-widest block text-center">Accent</label>
                  <div className="relative">
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-white" style={{ backgroundColor: form.accent }} />
                    <input 
                      value={form.accent} 
                      onChange={e => setForm({ ...form, accent: e.target.value })} 
                      className="w-full px-3 py-3 rounded-xl border border-chocolate/5 bg-white text-[10px] font-mono focus:border-strawberry outline-none text-center" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-chocolate/30 uppercase tracking-widest block text-center">Essence</label>
                  <div className="relative">
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-white" style={{ backgroundColor: form.bg }} />
                    <input 
                      value={form.bg} 
                      onChange={e => setForm({ ...form, bg: e.target.value })} 
                      className="w-full px-3 py-3 rounded-xl border border-chocolate/5 bg-white text-[10px] font-mono focus:border-strawberry outline-none text-center" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-chocolate/30 uppercase tracking-widest block text-center">Halo</label>
                  <div className="relative">
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-white" style={{ backgroundColor: form.border }} />
                    <input 
                      value={form.border} 
                      onChange={e => setForm({ ...form, border: e.target.value })} 
                      className="w-full px-3 py-3 rounded-xl border border-chocolate/5 bg-white text-[10px] font-mono focus:border-strawberry outline-none text-center" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>

          <DialogFooter className="p-10 bg-white border-t border-chocolate/5 flex flex-row gap-4 items-center justify-between shrink-0">
            <button type="button" onClick={() => setShowModal(false)} className="px-10 py-4 rounded-full border border-chocolate/10 font-bold text-chocolate bg-white hover:bg-chocolate/5 transition-all text-xs uppercase tracking-[0.2em] italic">
              Cancel
            </button>
            <button type="submit" form="values-form" disabled={saving} className="px-12 py-4 bg-chocolate text-white rounded-full font-bold shadow-bakery hover:bg-strawberry transition-all text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3">
              {saving && <Sparkles className="animate-spin" size={16} />}
              {editingIndex !== null ? "Refine Pillar" : "Seal Principle"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="px-4 mt-20">
        <div className="bg-chocolate p-12 rounded-[3.5rem] shadow-bakery relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-strawberry/10 rounded-full -mr-48 -mt-48 blur-3xl transition-all group-hover:scale-125 duration-1000" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                <div className="w-24 h-24 bg-strawberry rounded-3xl flex items-center justify-center text-white shadow-2xl transform rotate-12 group-hover:rotate-0 transition-transform duration-700">
                    <Sparkles size={48} />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h4 className="text-3xl font-bold font-playfair text-[#F5ECD7] mb-4">Values define our Soul</h4>
                    <p className="text-[#FAF6E6]/60 font-medium italic leading-relaxed max-w-2xl">
                        "In the realm of artisanal brilliance, values are not just words—they are the secret ingredients that breathe life into every croissant, every cake, and every smile we serve."
                    </p>
                </div>
                <div className="flex items-center gap-2 text-strawberry/40">
                    <Star size={24} />
                    <Star size={32} />
                    <Star size={24} />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
