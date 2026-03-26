import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '@/services/auth';

// Simple editor for origin story (title, subtitle, paragraphs, founder)
export default function OriginStoryEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [story, setStory] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const apiBase = (import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:5000';
    fetch(`${apiBase}/api/origin-story`)
      .then((res) => res.ok ? res.json() : Promise.reject(new Error('Failed')))
      .then((data) => { if (!mounted) return; if (data && data.ok) setStory(data.story); })
      .catch(() => {})
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
        cur[k] = cur[k] || {};
        cur = cur[k];
      }
      cur[keys[keys.length - 1]] = value;
      return copy;
    });
  }

  function save() {
    setSaving(true);
    const apiBase = (import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:5000';
    fetchWithAuth(`${apiBase}/api/origin-story`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(story || {}),
    })
      .then((res) => res.ok ? res.json() : res.json().then((r) => Promise.reject(r)))
      .then(() => { alert('Saved'); navigate('/admin/about'); })
      .catch((err) => { console.error(err); alert('Failed to save'); })
      .finally(() => setSaving(false));
  }

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Origin Story Editor</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Title</label>
        <input className="w-full rounded border p-2" value={story?.title || ''} onChange={(e) => updateField('title', e.target.value)} />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Subtitle</label>
        <input className="w-full rounded border p-2" value={story?.subtitle || ''} onChange={(e) => updateField('subtitle', e.target.value)} />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Founder Name</label>
        <input className="w-full rounded border p-2" value={story?.founder?.name || ''} onChange={(e) => updateField('founder.name', e.target.value)} />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Founder Since</label>
        <input className="w-full rounded border p-2" value={story?.founder?.since || ''} onChange={(e) => updateField('founder.since', e.target.value)} />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Founder Image URL</label>
        <input className="w-full rounded border p-2" value={story?.founder?.img || ''} onChange={(e) => updateField('founder.img', e.target.value)} />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Quote</label>
        <input className="w-full rounded border p-2" value={story?.founder?.quote || ''} onChange={(e) => updateField('founder.quote', e.target.value)} />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Paragraphs (one per line)</label>
        <textarea className="w-full rounded border p-2 h-40" value={(story?.paragraphs || []).join('\n')} onChange={(e) => updateField('paragraphs', e.target.value.split(/\r?\n/))} />
      </div>

      <div className="flex gap-3">
        <button onClick={save} disabled={saving} className="px-4 py-2 bg-amber-400 rounded text-white font-bold">{saving ? 'Saving…' : 'Save'}</button>
        <button onClick={() => navigate('/admin/about')} className="px-4 py-2 border rounded">Cancel</button>
      </div>
    </div>
  );
}
