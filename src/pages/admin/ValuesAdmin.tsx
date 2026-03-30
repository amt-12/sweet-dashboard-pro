import { useEffect, useState } from 'react';
import axiosInstance from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { Plus, Save, ArrowLeft, Trash2, Heart, Sparkles, Star, History, Hash, Terminal, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function ValuesAdmin() {
  const [values, setValues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    axiosInstance.get('/values').then(res => {
      if (!mounted) return;
      const data = res?.data || {};
      setValues(data.values || []);
    }).catch(() => {
      toast.error('Failed to load values');
    }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const addValue = () => {
    setValues(prev => [...prev, { icon: '✨', title: 'New Principle', desc: '', accent: '#B46060', bg: '#FFF4F4', border: '#FFDEDE' }]);
  };

  const updateAt = (idx: number, key: string, val: string) => {
    setValues(prev => prev.map((v, i) => i === idx ? { ...v, [key]: val } : v));
  };

  const removeAt = (idx: number) => {
    if (confirm('Remove this value from your brand identity?')) {
      setValues(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await axiosInstance.put('/values', { values });
      toast.success('Brand values saved successfully!');
    } catch (err) {
      toast.error('Failed to save values.');
    } finally { setSaving(false); }
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
            className="p-3 bg-white border border-chocolate/10 rounded-full text-chocolate hover:bg-strawberry/5 transition-all shadow-sm group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={addValue}
            className="px-6 py-3 bg-white text-chocolate border border-chocolate/10 rounded-full flex items-center gap-2 shadow-bakery hover:shadow-bakery-lg transition-all duration-300 font-bold text-xs uppercase tracking-widest text-chocolate active:scale-95"
          >
            <Plus size={18} className="text-strawberry" />
            New Value
          </button>
          <button 
            onClick={save} 
            disabled={saving}
            className="px-8 py-3 bg-chocolate text-white rounded-full flex items-center gap-3 shadow-bakery hover:shadow-bakery-lg hover:bg-strawberry transition-all duration-300 font-bold text-xs uppercase tracking-widest active:scale-95"
          >
            {saving ? <Sparkles className="animate-spin text-white" size={18} /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Values'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white/50 backdrop-blur-sm rounded-[3rem] border border-chocolate/5 shadow-bakery p-32 flex flex-col items-center justify-center gap-6 animate-pulse">
          <div className="w-16 h-16 border-4 border-chocolate/10 border-t-strawberry rounded-full animate-spin" />
          <p className="text-chocolate-light font-bold uppercase tracking-widest text-xs italic">Consulting the heritage...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-4">
          {values.map((v, idx) => (
            <div key={idx} className="group relative bg-white/60 backdrop-blur-md rounded-[3rem] p-10 border border-chocolate/5 shadow-bakery hover:shadow-bakery-lg transition-all duration-500 overflow-hidden flex flex-col h-full hover:-translate-y-1">
               <div className="absolute top-0 right-0 w-48 h-48 bg-strawberry/5 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-strawberry/10 transition-all duration-700" />
               
               <div className="relative space-y-8 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-6 pb-6 border-b border-chocolate/5">
                    <div className="flex items-center gap-6 flex-1">
                      <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-bakery border border-chocolate/5 group-hover:scale-110 transition-transform transform rotate-3">
                        <input 
                          value={v.icon || '✨'} 
                          onChange={(e) => updateAt(idx, 'icon', e.target.value)} 
                          className="w-full bg-transparent text-center border-none focus:ring-0 cursor-default font-serif"
                        />
                      </div>
                      <div className="flex-1">
                        <input 
                            value={v.title || ''} 
                            onChange={(e) => updateAt(idx, 'title', e.target.value)} 
                            className="w-full text-3xl font-bold font-playfair text-chocolate border-none bg-transparent focus:ring-0 p-0 placeholder:text-chocolate/10 italic leading-tight"
                            placeholder="Value Headline"
                        />
                        <div className="h-0.5 w-12 bg-strawberry/20 mt-1" />
                      </div>
                    </div>
                    <button 
                      onClick={() => removeAt(idx)}
                      className="p-3.5 text-red-400 hover:text-white hover:bg-red-500 rounded-full transition-all border border-red-50 hover:shadow-lg active:scale-90"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="space-y-6 flex-1 flex flex-col">
                    <div className="space-y-2 flex-1 flex flex-col">
                       <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                           <History size={12} />
                           The Philosophy
                       </label>
                       <textarea 
                         value={v.desc || ''} 
                         onChange={(e) => updateAt(idx, 'desc', e.target.value)} 
                         className="w-full px-6 py-5 rounded-[2rem] bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 outline-none transition-all shadow-inner text-sm text-chocolate-light font-medium min-h-[160px] resize-none leading-relaxed italic placeholder:text-chocolate/10 flex-1"
                         placeholder="Deepen the story behind this guiding principle..."
                       />
                    </div>

                    <div className="grid grid-cols-3 gap-6 pt-6 border-t border-chocolate/5 bg-[#FAF6E6]/20 -mx-10 -mb-10 p-10 mt-auto">
                       <div className="space-y-2">
                          <span className="text-[9px] font-bold text-chocolate/30 uppercase tracking-[0.1em] block ml-1 text-center">Accent</span>
                          <div className="relative">
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: v.accent }} />
                            <input 
                                value={v.accent || ''} 
                                onChange={(e) => updateAt(idx, 'accent', e.target.value)} 
                                className="w-full px-3 py-3 rounded-xl border border-chocolate/10 bg-white text-[10px] font-mono focus:border-strawberry focus:ring-4 focus:ring-strawberry/5 outline-none text-center"
                                placeholder="#HEX"
                            />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <span className="text-[9px] font-bold text-chocolate/30 uppercase tracking-[0.1em] block ml-1 text-center">Essence</span>
                          <div className="relative">
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: v.bg }} />
                            <input 
                                value={v.bg || ''} 
                                onChange={(e) => updateAt(idx, 'bg', e.target.value)} 
                                className="w-full px-3 py-3 rounded-xl border border-chocolate/10 bg-white text-[10px] font-mono focus:border-strawberry focus:ring-4 focus:ring-strawberry/5 outline-none text-center"
                                placeholder="#HEX"
                            />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <span className="text-[9px] font-bold text-chocolate/30 uppercase tracking-[0.1em] block ml-1 text-center">Halo</span>
                          <div className="relative">
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: v.border }} />
                            <input 
                                value={v.border || ''} 
                                onChange={(e) => updateAt(idx, 'border', e.target.value)} 
                                className="w-full px-3 py-3 rounded-xl border border-chocolate/10 bg-white text-[10px] font-mono focus:border-strawberry focus:ring-4 focus:ring-strawberry/5 outline-none text-center"
                                placeholder="#HEX"
                            />
                          </div>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          ))}
          
          {values.length === 0 && !loading && (
             <div className="col-span-full py-40 text-center space-y-6">
                <div className="w-24 h-24 bg-chocolate/5 rounded-full flex items-center justify-center mx-auto text-chocolate/10 transform -rotate-12">
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
