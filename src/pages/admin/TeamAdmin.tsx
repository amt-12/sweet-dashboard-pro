import React, { useEffect, useState } from 'react';
import { getToken } from '@/services/auth';

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

export default function TeamAdmin(): JSX.Element {
  const [items, setItems] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [showForm, setShowForm] = useState(false);

  const emptyForm: TeamMember = { name: '', role: '', since: '', quote: '', desc: '', img: '', badge: '', badgeBg: '', order: 0 };
  const [form, setForm] = useState<TeamMember>(emptyForm);

  // New: file input + preview
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const apiBase = (import.meta.env && (import.meta.env.VITE_API_URL as string)) || 'https://bakery-bakend.onrender.com';
  const token = getToken();
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const resolveImageUrl = (src?: string | null) => {
    if (!src) return '/about-baker.png';
    // allow object URLs (preview) and absolute URLs
    if (src.startsWith('blob:')) return src;
    if (src.startsWith('http://') || src.startsWith('https://')) return src;
    // backend-served uploads should be prefixed with apiBase
    if (src.startsWith('/uploads')) return apiBase + src;
    // local front-end assets (like '/about-baker.png') should remain as-is
    if (src.startsWith('/')) return src;
    return src;
  };

  const fetchTeam = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/api/team`);
      if (!res.ok) {
        const text = await res.text().catch(() => 'no body');
        throw new Error(`Failed to fetch team: ${res.status} ${res.statusText} - ${text}`);
      }
      const data = await res.json();
      if (data && data.ok && Array.isArray(data.team)) {
        setItems(data.team);
      } else {
        setItems([]);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
    // cleanup preview URL on unmount
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (preview) {
      try { URL.revokeObjectURL(preview); } catch (e) {}
    }
    if (!f) {
      setFile(null);
      setPreview(null);
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submitForm = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    try {
      const isEdit = !!(editing && editing._id);
      const url = isEdit ? `${apiBase}/api/team/${editing!._id}` : `${apiBase}/api/team`;

      // If a file is selected, send multipart/form-data
      if (file) {
        const fd = new FormData();
        fd.append('image', file);
        // append allowed fields
        fd.append('name', form.name || '');
        if (form.role) fd.append('role', form.role);
        if (form.since) fd.append('since', form.since);
        if (form.quote) fd.append('quote', form.quote);
        if (form.desc) fd.append('desc', form.desc);
        if (form.badge) fd.append('badge', form.badge);
        fd.append('order', String(form.order ?? 0));

        const res = await fetch(url, {
          method: isEdit ? 'PUT' : 'POST',
          headers: {
            ...authHeader,
            // NOTE: don't set Content-Type for FormData
          },
          body: fd,
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || `Request failed ${res.status}`);
        }
      } else {
        // send JSON (using image URL if provided)
        const payload = { ...form } as any;
        delete payload.badgeBg;
        const res = await fetch(url, {
          method: isEdit ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader,
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || `Request failed ${res.status}`);
        }
      }

      // refresh list
      await fetchTeam();
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      if (preview) {
        try { URL.revokeObjectURL(preview); } catch (e) {}
      }
      setFile(null);
      setPreview(null);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to save');
    }
  };

  const removeItem = async (id?: string) => {
    if (!id) return;
    if (!confirm('Delete this team member?')) return;
    setError(null);
    try {
      const res = await fetch(`${apiBase}/api/team/${id}`, {
        method: 'DELETE',
        headers: { ...authHeader },
      });
      if (!res.ok) throw new Error(`Delete failed ${res.status}`);
      setItems((s) => s.filter((x) => x._id !== id));
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to delete');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Team Management</h1>
        <div className="flex items-center gap-2">
          <button onClick={fetchTeam} className="px-3 py-2 bg-gray-200 rounded">Refresh</button>
          <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white rounded">Add Member</button>
        </div>
      </div>

      {error && <div className="mb-4 text-red-600">{error}</div>}
      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((m) => (
            <div key={m._id} className="border rounded p-4 bg-white shadow-sm">
              <div className="flex gap-3">
                <img src={resolveImageUrl(m.img)} alt={m.name} className="w-20 h-20 object-cover rounded" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold">{m.name}</div>
                      <div className="text-sm text-gray-600">{m.role}</div>
                    </div>
                    <div className="text-xs text-gray-500">{m.since}</div>
                  </div>
                  <div className="mt-2 text-sm text-gray-700">{m.desc}</div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button onClick={() => openEdit(m)} className="px-3 py-1 bg-yellow-400 rounded">Edit</button>
                <button onClick={() => removeItem(m._id)} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal / panel */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center p-6 z-50">
          <form onSubmit={submitForm} className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editing ? 'Edit Member' : 'Add Member'}</h2>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm); if (preview) { try { URL.revokeObjectURL(preview); } catch (e) {} } setFile(null); setPreview(null); }} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="block">
                <div className="text-sm font-medium">Name</div>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full border rounded px-2 py-1" required />
              </label>

              <label className="block">
                <div className="text-sm font-medium">Role</div>
                <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="mt-1 w-full border rounded px-2 py-1" />
              </label>

              <label className="block">
                <div className="text-sm font-medium">Since</div>
                <input value={form.since} onChange={(e) => setForm({ ...form, since: e.target.value })} className="mt-1 w-full border rounded px-2 py-1" />
              </label>

              <label className="block">
                <div className="text-sm font-medium">Order</div>
                <input type="number" value={form.order ?? 0} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="mt-1 w-full border rounded px-2 py-1" />
              </label>

              <label className="block md:col-span-2">
                <div className="text-sm font-medium">Quote</div>
                <input value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} className="mt-1 w-full border rounded px-2 py-1" />
              </label>

              <label className="block md:col-span-2">
                <div className="text-sm font-medium">Description</div>
                <textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} className="mt-1 w-full border rounded px-2 py-1" rows={3} />
              </label>

              <div className="md:col-span-2 grid grid-cols-1 gap-2">
                <label className="block">
                  <div className="text-sm font-medium">Image URL (optional)</div>
                  <input value={form.img} onChange={(e) => setForm({ ...form, img: e.target.value })} className="mt-1 w-full border rounded px-2 py-1" />
                </label>

                <div>
                  <div className="text-sm font-medium mb-1">Or choose image file</div>
                  <input type="file" accept="image/*" onChange={(ev) => {
                    const f = ev.target.files && ev.target.files[0] ? ev.target.files[0] : null;
                    handleFileChange(f);
                  }} />
                  {preview && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-500 mb-1">Preview</div>
                      <img src={resolveImageUrl(preview)} alt="preview" className="w-32 h-32 object-cover rounded" />
                    </div>
                  )}
                </div>
              </div>

              <label className="block">
                <div className="text-sm font-medium">Badge</div>
                <input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} className="mt-1 w-full border rounded px-2 py-1" />
              </label>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm); if (preview) { try { URL.revokeObjectURL(preview); } catch (e) {} } setFile(null); setPreview(null); }} className="px-4 py-2 bg-gray-200 rounded">Close</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
