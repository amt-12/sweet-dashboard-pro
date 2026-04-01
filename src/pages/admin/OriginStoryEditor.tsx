import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '@/services/auth';
import { BookOpen, User, Calendar, ImageIcon, Quote, FileText, Save, X, RefreshCw, History, Sparkles, PenTool, Hash, ArrowLeft, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function OriginStoryEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [story, setStory] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const apiBase = (import.meta.env && import.meta.env.VITE_API_URL) || 'https://bakery-bakend.onrender.com';
    fetch(`${apiBase}/api/origin-story`)
      .then((res) => res.ok ? res.json() : Promise.reject(new Error('Failed')))
      
      .then((data) => { if (!mounted) return; if (data && data.ok) setStory(data.story); })
      .catch(() => {
        toast.error("Failed to load heritage");
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  function updateField(path: string, value: any) {
    setStory((s: any) => {
      const copy = { ...(s || {}) };
      const keys = path.split('.');
      let cur: any = copy;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!cur[k]) cur[k] = {};
        cur = cur[k];
      }
      cur[keys[keys.length - 1]] = value;
      return copy;
    });
  }

  function save() {
    setSaving(true);
    const apiBase = (import.meta.env && import.meta.env.VITE_API_URL) || 'https://bakery-bakend.onrender.com';
    fetchWithAuth(`${apiBase}/api/origin-story`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(story || {}),
    })
      .then((res) => res.ok ? res.json() : res.json().then((r) => Promise.reject(r)))
      .then(() => { 
        toast.success('Heritage saved successfully!');
        navigate('/admin/about'); 
      })
      .catch((err) => { 
        toast.error('Failed to save heritage');
      })
      .finally(() => setSaving(false));
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] animate-pulse">
        <RefreshCw size={48} className="animate-spin text-chocolate/20 mb-4" />
        <p className="text-chocolate-light font-medium italic">Unfolding your story...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 font-lora pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold font-dancing text-chocolate">Brand Heritage</h2>
          <p className="text-sm text-chocolate-light font-medium mt-1">
            Edit the historical narrative and vision of your artisanal bakery.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/about')}
            className="px-6 py-3 bg-white border border-chocolate/10 rounded-full text-chocolate hover:bg-chocolate/5 transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm"
          >
            <ArrowLeft size={16} />
            Cancel
          </button>
          <button 
            onClick={save} 
            disabled={saving}
            className="px-8 py-3 bg-chocolate text-white rounded-full flex items-center gap-3 shadow-bakery hover:shadow-bakery-lg hover:bg-strawberry transition-all duration-300 disabled:opacity-50"
          >
            {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
            <span className="font-bold text-xs uppercase tracking-widest text-[#F5ECD7]">Finalize Heritage</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 bg-white/60 backdrop-blur-md p-10 rounded-[2.5rem] shadow-bakery border border-chocolate/5 space-y-10">
          <div className="flex items-center gap-4 mb-4 border-b border-chocolate/5 pb-6">
            <div className="w-12 h-12 bg-chocolate text-white rounded-2xl flex items-center justify-center shadow-bakery transform rotate-3">
                <History size={24} />
            </div>
            <h3 className="text-2xl font-bold font-playfair text-chocolate">Narrative Details</h3>
          </div>
          
          <div className="space-y-8">
            <div className="space-y-2 group">
                <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Main Headline</label>
                <div className="relative">
                    <PenTool size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
                    <input 
                        className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-medium placeholder:text-chocolate/10" 
                        value={story?.title || ''} 
                        onChange={(e) => updateField('title', e.target.value)} 
                    />
                </div>
            </div>

            <div className="space-y-2 group">
                <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Elegant Subtitle</label>
                <div className="relative">
                    <Sparkles size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
                    <input 
                        className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-medium placeholder:text-chocolate/10" 
                        value={story?.subtitle || ''} 
                        onChange={(e) => updateField('subtitle', e.target.value)} 
                    />
                </div>
            </div>

            <div className="space-y-2 group">
                <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">The Narrative (Content)</label>
                <div className="relative">
                    <FileText size={18} className="absolute left-4 top-6 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
                    <textarea 
                        className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-medium min-h-[400px] resize-none leading-relaxed italic" 
                        value={(story?.paragraphs || []).join('\n')} 
                        onChange={(e) => updateField('paragraphs', e.target.value.split(/\r?\n/))} 
                        placeholder="Weave your history here..."
                    />
                </div>
                <p className="text-[9px] text-chocolate/30 font-bold uppercase tracking-widest mt-2 ml-1 italic opacity-60 flex items-center gap-2">
                    <Info size={12} /> Use one line per paragraph for visual elegance.
                </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-10">
          <div className="bg-white/60 backdrop-blur-md p-10 rounded-[2.5rem] shadow-bakery border border-chocolate/5 flex flex-col h-fit">
            <div className="flex items-center gap-4 mb-10 border-b border-chocolate/5 pb-6">
                <div className="w-12 h-12 bg-strawberry text-white rounded-2xl flex items-center justify-center shadow-bakery transform -rotate-3">
                    <User size={24} />
                </div>
                <h3 className="text-2xl font-bold font-playfair text-chocolate">The Founder</h3>
            </div>
            
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div className="space-y-2 group">
                    <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Founder Name</label>
                    <div className="relative">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
                        <input className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-medium" value={story?.founder?.name || ''} onChange={(e) => updateField('founder.name', e.target.value)} />
                    </div>
                </div>
                <div className="space-y-2 group">
                    <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Est. Year</label>
                    <div className="relative">
                        <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
                        <input className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-medium" value={story?.founder?.since || ''} onChange={(e) => updateField('founder.since', e.target.value)} placeholder="e.g. 2012" />
                    </div>
                </div>
                </div>

                <div className="space-y-2 group">
                <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Portrait Image URL</label>
                <div className="relative">
                    <ImageIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
                    <input className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-medium" value={story?.founder?.img || ''} onChange={(e) => updateField('founder.img', e.target.value)} />
                </div>
                </div>

                <div className="space-y-2 group">
                <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Signature Quote</label>
                <div className="relative">
                    <Quote size={18} className="absolute left-4 top-6 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
                    <textarea className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-medium min-h-[140px] resize-none leading-relaxed italic" value={story?.founder?.quote || ''} onChange={(e) => updateField('founder.quote', e.target.value)} />
                </div>
                </div>
            </div>
          </div>
          
          <div className="bg-chocolate p-10 rounded-[2.5rem] shadow-bakery relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-strawberry/10 rounded-full -mr-24 -mt-24 blur-3xl transition-all group-hover:scale-150 duration-700" />
            
            <h4 className="text-xl font-bold font-playfair text-[#F5ECD7] mb-6 flex items-center gap-3">
              <Sparkles size={24} className="text-strawberry" />
              Visionary Guide
            </h4>
            <div className="space-y-4">
              <div className="h-2 bg-white/5 rounded-full w-3/4"></div>
              <div className="h-2 bg-white/5 rounded-full w-full"></div>
              <div className="h-2 bg-white/5 rounded-full w-5/6"></div>
            </div>
            <p className="text-sm text-[#FAF6E6]/60 font-medium italic mt-8 leading-relaxed">
              "Your story is the aroma that draws patrons to your door. Keep it warm, authentic, and evocative of the craftsmanship in every loaf."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
