import { useEffect, useState } from 'react';
import axiosInstance from '@/services/api';
import { useNavigate } from 'react-router-dom';

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
    }).catch(() => {}).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const addValue = () => {
    setValues(prev => [...prev, { icon: '🌱', title: 'New Value', desc: '', accent: '#000000', bg: '#FFFFFF', border: '#EEEEEE' }]);
  };

  const updateAt = (idx: number, key: string, val: string) => {
    setValues(prev => prev.map((v, i) => i === idx ? { ...v, [key]: val } : v));
  };

  const removeAt = (idx: number) => setValues(prev => prev.filter((_, i) => i !== idx));

  const save = async () => {
    setSaving(true);
    try {
      await axiosInstance.put('/values', { values });
      alert('Saved');
    } catch (err) {
      alert('Save failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Manage Our Values</h1>
      <p className="mb-6 text-sm text-gray-600">Edit the values shown on the About page. Only superadmin may access this page in production.</p>
      <div className="mb-4">
        <button onClick={addValue} className="px-3 py-2 bg-green-500 text-white rounded mr-2">Add</button>
        <button onClick={save} disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">{saving ? 'Saving…' : 'Save'}</button>
        <button onClick={() => navigate('/admin')} className="px-3 py-2 bg-gray-200 text-black rounded ml-2">Back</button>
      </div>
      {loading ? <div>Loading…</div> : (
        <div className="space-y-4">
          {values.map((v, idx) => (
            <div key={idx} className="border p-4 rounded">
              <div className="flex gap-2 mb-2 items-center">
                {/* show icon (not editable) - keep the existing icon only */}
                <div className="w-12 h-8 flex items-center justify-center text-xl">{v.icon || '•'}</div>
                <input value={v.title || ''} onChange={(e) => updateAt(idx, 'title', e.target.value)} className="flex-1" />
                <button onClick={() => removeAt(idx)} className="px-2 py-1 bg-red-500 text-white rounded">Remove</button>
              </div>
              <textarea value={v.desc || ''} onChange={(e) => updateAt(idx, 'desc', e.target.value)} className="w-full h-20 mb-2" />
              <div className="flex gap-2">
                <input value={v.accent || ''} onChange={(e) => updateAt(idx, 'accent', e.target.value)} placeholder="accent hex" />
                <input value={v.bg || ''} onChange={(e) => updateAt(idx, 'bg', e.target.value)} placeholder="bg hex" />
                <input value={v.border || ''} onChange={(e) => updateAt(idx, 'border', e.target.value)} placeholder="border hex" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
