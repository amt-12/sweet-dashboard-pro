import React, { useEffect, useState } from 'react';
import { Users, Plus, Trash, MoreVertical, Eye, UserCheck, Copy, ChevronDown } from 'lucide-react';
import { fetchWithAuth } from '@/services/auth';

const Admins = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'admin' });
  const [openId, setOpenId] = useState<string | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<any | null>(null);
  const [openRoleFor, setOpenRoleFor] = useState<string | null>(null);

  // Accessible dropdown (used for per-admin actions)
  const Dropdown: React.FC<{ id: string; open: boolean; onToggle: (id: string) => void; children: React.ReactNode }> = ({ id, open, onToggle, children }) => {
    useEffect(() => {
      const onDoc = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const btn = document.getElementById(`dd-btn-${id}`);
        const menu = document.getElementById(`dd-menu-${id}`);
        if (!btn || !menu) return;
        if (!btn.contains(target) && !menu.contains(target)) onToggle('');
      };
      document.addEventListener('mousedown', onDoc);
      return () => document.removeEventListener('mousedown', onDoc);
    }, [id, onToggle]);

    return (
      <div className="relative">
        <button id={`dd-btn-${id}`} onClick={() => onToggle(open ? '' : id)} className="p-2 rounded hover:bg-[#F5ECD7]">
          <MoreVertical />
        </button>
        <div id={`dd-menu-${id}`} className={`absolute right-0 top-full mt-2 w-44 bg-white border border-[#E5E7EB] rounded-lg shadow-lg z-200 overflow-hidden transition-transform origin-top-right ${open ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
          {children}
        </div>
      </div>
    );
  };

  // RoleSelect — better looking select used in create form
  const RoleSelect: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = React.useRef<HTMLDivElement | null>(null);
    useEffect(() => {
      const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
      document.addEventListener('mousedown', onDoc);
      return () => document.removeEventListener('mousedown', onDoc);
    }, []);

    return (
      <div ref={ref} className="relative">
        <button type="button" onClick={() => setOpen(s => !s)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F5ECD7]/20 border border-[#D4A373]/20">
          <span className="text-sm font-medium">{value === 'superadmin' ? 'Superadmin' : 'Admin'}</span>
          <ChevronDown className="w-4 h-4" />
        </button>
        <div className={`absolute mt-2 right-0 w-40 bg-white border rounded-lg shadow z-50 overflow-hidden ${open ? '' : 'hidden'}`}>
          <button onClick={() => { onChange('admin'); setOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-[#F9FAFB]">Admin</button>
          <button onClick={() => { onChange('superadmin'); setOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-[#F9FAFB]">Superadmin</button>
        </div>
      </div>
    );
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/api/admins');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setAdmins(data.users || []);
    } catch (err) {
      console.error(err);
      alert('Failed to load admins');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchWithAuth('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Create failed');
      }
      setForm({ email: '', password: '', name: '', role: 'admin' });
      load();
    } catch (err: any) {
      alert(err.message || 'Failed');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this admin?')) return;
    try {
      const res = await fetchWithAuth(`/api/admins/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      load();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const toggleMenu = (id: string) => {
    setOpenId(prev => prev === id ? null : id);
  };

  const viewAdmin = (a: any) => {
    setSelectedAdmin(a);
    setOpenId(null);
  };

  const closeModal = () => setSelectedAdmin(null);

  const copyEmail = (email?: string) => {
    if (!email) return;
    navigator.clipboard?.writeText(email).then(() => alert('Email copied'));
  };

  return (
    <div className="space-y-8 animate-fade-in font-lora">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-playfair font-bold text-[#1A2744]">Admins <span className="text-[#D4A373]">👑</span></h2>
          <p className="text-[#8D6E63] mt-1">Superadmin can create and manage admin accounts.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-[#D4A373]/20 shadow-sm">
        <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" className="p-3 rounded-xl bg-[#F5ECD7]/20" />
          <input required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Password" type="password" className="p-3 rounded-xl bg-[#F5ECD7]/20" />
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name (optional)" className="p-3 rounded-xl bg-[#F5ECD7]/20" />
          <div className="flex gap-2 items-center">
            <RoleSelect value={form.role} onChange={(v) => setForm({ ...form, role: v })} />
            <button className="px-4 py-2 bg-[#D4A373] text-white rounded-xl flex items-center gap-2" type="submit"><Plus size={16} />Create</button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-[#D4A373]/20 shadow-sm overflow-hidden">
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {loading ? <div>Loading…</div> : (
            admins.map(a => (
              <div key={a._id} className="p-3 bg-[#FAF6E6] rounded-xl border border-[#D4A373]/10 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#1A2744]">{a.name || a.email}</div>
                  <div className="text-xs text-[#8D6E63]">{a.email} • {a.role}</div>
                </div>
                <div className="relative flex items-center gap-2">
                  <Dropdown id={a._id} open={openId === a._id} onToggle={(id) => setOpenId(id || null)}>
                    <button onClick={() => viewAdmin(a)} className="w-full text-left px-3 py-2 hover:bg-[#F9FAFB] flex items-center gap-2"><Eye /> View</button>
                    <div className="border-t" />
                    <button onClick={() => { setOpenId(null); remove(a._id); }} className="w-full text-left px-3 py-2 hover:bg-[#FFF1F0] text-red-600 flex items-center gap-2"><Trash /> Delete</button>
                  </Dropdown>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedAdmin && (
        <div className="fixed inset-0 z-50 grid place-items-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-md p-6 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#F5ECD7] flex items-center justify-center text-[#D4A373] font-bold"><UserCheck /></div>
                <div>
                  <div className="font-bold text-lg text-[#1A2744]">{selectedAdmin.name || selectedAdmin.email}</div>
                  <div className="text-sm text-[#8D6E63]">ID: {selectedAdmin._id}</div>
                </div>
              </div>
              <button onClick={closeModal} className="text-sm text-[#6B7280]">Close</button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-[#6D4C41]">
              <div className="flex items-center justify-between">
                <div className="font-medium">Email</div>
                <div className="flex items-center gap-2">
                  <div className="text-[#1A2744]">{selectedAdmin.email}</div>
                  <button onClick={() => copyEmail(selectedAdmin.email)} className="p-1 rounded hover:bg-[#F5ECD7]"><Copy size={14} /></button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="font-medium">Role</div>
                <div className={`px-2 py-1 rounded-full text-xs font-semibold ${selectedAdmin.role === 'superadmin' ? 'bg-[#FDE68A] text-[#92400E]' : 'bg-[#E6F6F1] text-[#065F46]'}`}>
                  {selectedAdmin.role}
                </div>
              </div>
              {selectedAdmin.createdAt && (
                <div className="flex items-center justify-between">
                  <div className="font-medium">Created</div>
                  <div className="text-sm text-[#8D6E63]">{new Date(selectedAdmin.createdAt).toLocaleString()}</div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={closeModal} className="px-4 py-2 rounded-xl border">Close</button>
              <button onClick={() => { copyEmail(selectedAdmin.email); }} className="px-4 py-2 rounded-xl bg-[#D4A373] text-white">Copy Email</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admins;
