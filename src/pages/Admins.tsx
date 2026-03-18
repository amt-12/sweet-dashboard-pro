import React, { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Eye,
  UserCheck,
  Copy,
  ChevronDown,
  Mail,
  Lock,
  User,
  Shield,
  ShieldCheck,
  Calendar,
  X,
  CheckCircle2,
} from 'lucide-react';
import { fetchWithAuth } from '@/services/auth';

// ── Role badge ────────────────────────────────────────────────────────────────
const RoleBadge = ({ role }: { role: string }) => {
  const isSuperadmin = role === 'superadmin';
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
        isSuperadmin
          ? 'bg-amber-50 text-amber-700 border-amber-200'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
      }`}
    >
      {isSuperadmin ? <ShieldCheck size={10} /> : <Shield size={10} />}
      {isSuperadmin ? 'Superadmin' : 'Admin'}
    </span>
  );
};

// ── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({ name, size = 'md' }: { name?: string; size?: 'sm' | 'md' | 'lg' }) => {
  const letter = (name || '?').charAt(0).toUpperCase();
  const dims =
    size === 'lg' ? 'w-16 h-16 text-2xl' : size === 'sm' ? 'w-8 h-8 text-sm' : 'w-11 h-11 text-base';
  return (
    <div
      className={`${dims} rounded-2xl bg-gradient-to-br from-[#D4A373] to-[#c49265] flex items-center justify-center text-white font-playfair font-bold shadow-md border border-white flex-shrink-0`}
    >
      {letter}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const Admins = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'admin' });
  const [creating, setCreating] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  // ── Data ──────────────────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/api/admins');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setAdmins(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
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
    } finally {
      setCreating(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this admin? This action cannot be undone.')) return;
    try {
      const res = await fetchWithAuth(`/api/admins/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setAdmins((prev) => prev.filter((a) => a._id !== id));
    } catch {
      alert('Failed to delete admin');
    }
  };

  const closeModal = () => setSelectedAdmin(null);

  const copyEmail = (email?: string) => {
    if (!email) return;
    navigator.clipboard?.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const superadminCount = admins.filter((a) => a.role === 'superadmin').length;
  const adminCount = admins.filter((a) => a.role === 'admin').length;

  return (
    <div className="space-y-8 animate-fade-in font-inter">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-playfair text-[#1A2744]">
            Admins <span className="inline-block animate-bounce text-[#D4A373]">👑</span>
          </h2>
          <p className="text-[#8D6E63] mt-1 font-medium">
            Manage admin accounts and access roles for the bakery dashboard.
          </p>
        </div>

        {/* Stats pills */}
        {!loading && admins.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
              <ShieldCheck size={15} />
              <span className="text-sm font-bold">{superadminCount} Superadmin{superadminCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
              <Shield size={15} />
              <span className="text-sm font-bold">{adminCount} Admin{adminCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Create Admin Form ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#D4A373]/20 shadow-sm overflow-hidden">
        {/* Form header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#FAF6E6] to-white border-b border-[#D4A373]/15 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1A2744] flex items-center justify-center text-white">
            <Plus size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold font-playfair text-[#1A2744]">Add New Admin</h3>
            <p className="text-xs text-[#8D6E63] font-medium">Fill in the details to create a new admin account.</p>
          </div>
        </div>

        <form onSubmit={create} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Name */}
            <div className="space-y-1.5 group">
              <label className="text-xs font-bold text-[#1A2744] uppercase tracking-wider ml-1">Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1A2744]/30 group-focus-within:text-[#D4A373] transition-colors" />
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Full name (optional)"
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF6E6]/50 border border-[#D4A373]/20 focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/15 rounded-xl text-sm outline-none transition-all font-medium placeholder:text-[#1A2744]/30 placeholder:font-normal"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5 group">
              <label className="text-xs font-bold text-[#1A2744] uppercase tracking-wider ml-1">
                Email <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1A2744]/30 group-focus-within:text-[#D4A373] transition-colors" />
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF6E6]/50 border border-[#D4A373]/20 focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/15 rounded-xl text-sm outline-none transition-all font-medium placeholder:text-[#1A2744]/30 placeholder:font-normal"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5 group">
              <label className="text-xs font-bold text-[#1A2744] uppercase tracking-wider ml-1">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1A2744]/30 group-focus-within:text-[#D4A373] transition-colors" />
                <input
                  required
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Create a password"
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF6E6]/50 border border-[#D4A373]/20 focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/15 rounded-xl text-sm outline-none transition-all font-medium placeholder:text-[#1A2744]/30 placeholder:font-normal"
                />
              </div>
            </div>

            {/* Role + Submit */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A2744] uppercase tracking-wider ml-1">Role</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Shield size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1A2744]/30 pointer-events-none" />
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full pl-10 pr-8 py-3 bg-[#FAF6E6]/50 border border-[#D4A373]/20 focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/15 rounded-xl text-sm outline-none transition-all font-medium appearance-none"
                  >
                    <option value="admin">Admin</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1A2744]/40 pointer-events-none" />
                </div>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-3 bg-[#1A2744] hover:bg-[#D4A373] hover:text-[#1A2744] text-[#F5ECD7] rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {creating ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )}
                  {creating ? '' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* ── Admins List ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#D4A373]/20 shadow-sm overflow-hidden">
        {/* List header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#FAF6E6] to-white border-b border-[#D4A373]/15 flex items-center gap-2">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#D4A373] to-[#F5ECD7]" />
          <Users size={16} className="text-[#D4A373]" />
          <h3 className="text-sm font-bold text-[#1A2744] uppercase tracking-wider">
            All Admins {!loading && `(${admins.length})`}
          </h3>
        </div>

        {/* Loading */}
        {loading && (
          <div className="p-16 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-[#D4A373]/20 border-t-[#D4A373] rounded-full animate-spin" />
            <p className="text-[#8D6E63] font-semibold animate-pulse text-sm">Loading admins...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && admins.length === 0 && (
          <div className="p-16 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4A373]/20 to-[#D4A373]/5 flex items-center justify-center">
              <Users size={28} className="text-[#D4A373]" />
            </div>
            <div className="text-center">
              <p className="text-base font-bold font-playfair text-[#1A2744]">No Admins Yet</p>
              <p className="text-sm text-[#8D6E63] mt-1">Create an admin account using the form above.</p>
            </div>
          </div>
        )}

        {/* Admin Cards Grid */}
        {!loading && admins.length > 0 && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {admins.map((a) => (
              <div
                key={a._id}
                className="relative bg-white rounded-2xl border border-[#D4A373]/20 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
              >
                {/* Top accent */}
                <div
                  className={`absolute top-0 left-0 w-full h-1 ${
                    a.role === 'superadmin'
                      ? 'bg-gradient-to-r from-amber-400 to-amber-200'
                      : 'bg-gradient-to-r from-[#D4A373] to-[#F5ECD7]'
                  }`}
                />

                <div className="p-5">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={a.name || a.email} />
                      <div className="min-w-0">
                        <p className="font-bold text-[#1A2744] text-sm truncate group-hover:text-[#D4A373] transition-colors">
                          {a.name || 'Unnamed'}
                        </p>
                        <p className="text-xs text-[#8D6E63] truncate font-medium">{a.email}</p>
                      </div>
                    </div>
                    <RoleBadge role={a.role || 'admin'} />
                  </div>

                  {/* ID + Date */}
                  <div className="mt-4 pt-4 border-t border-[#D4A373]/10 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[9px] font-bold text-[#8D6E63]/70 uppercase tracking-widest">Admin ID</p>
                      <p className="text-[10px] font-mono font-bold text-[#1A2744]/60">
                        #{String(a._id || '').slice(-8).toUpperCase()}
                      </p>
                    </div>
                    {a.createdAt && (
                      <div className="text-right">
                        <p className="text-[9px] font-bold text-[#8D6E63]/70 uppercase tracking-widest">Joined</p>
                        <p className="text-[10px] font-medium text-[#8D6E63]">
                          {new Date(a.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedAdmin(a)}
                      className="flex-1 px-3 py-2 rounded-xl text-xs font-bold text-[#D4A373] bg-[#D4A373]/10 hover:bg-[#D4A373] hover:text-white transition-all flex items-center justify-center gap-1.5 border border-[#D4A373]/20"
                    >
                      <Eye size={12} />
                      View Profile
                    </button>
                    <button
                      onClick={() => remove(a._id)}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-all flex items-center gap-1.5 border border-red-100"
                    >
                      <Trash2 size={12} />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Profile Modal ────────────────────────────────────────────────── */}
      {selectedAdmin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header background */}
            <div className="relative h-32 bg-gradient-to-br from-[#1A2744] to-[#2c3e50] flex items-end p-5">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full" />
              {/* Close */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
              >
                <X size={15} />
              </button>
              {/* Floating avatar */}
              <div className="absolute -bottom-8 left-6 p-1 bg-white rounded-2xl shadow-xl">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#D4A373] to-[#c49265] flex items-center justify-center text-white font-playfair font-bold text-2xl">
                  {(selectedAdmin.name || selectedAdmin.email || '?').charAt(0).toUpperCase()}
                </div>
              </div>
            </div>

            {/* Modal body */}
            <div className="px-6 pt-12 pb-6 space-y-5">
              {/* Name + role */}
              <div>
                <h3 className="text-xl font-bold font-playfair text-[#1A2744]">
                  {selectedAdmin.name || 'Unnamed Admin'}
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <RoleBadge role={selectedAdmin.role || 'admin'} />
                  <span className="text-[10px] font-mono text-[#8D6E63]">
                    #{String(selectedAdmin._id || '').slice(-8).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Info rows */}
              <div className="space-y-3">
                {/* Email */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF6E6]/80 border border-[#D4A373]/10">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#D4A373]/20 flex items-center justify-center text-[#D4A373]">
                      <Mail size={13} />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-[#8D6E63] uppercase tracking-wider">Email</p>
                      <p className="text-xs font-bold text-[#1A2744]">{selectedAdmin.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => copyEmail(selectedAdmin.email)}
                    className="p-1.5 rounded-lg hover:bg-[#D4A373]/10 text-[#8D6E63] hover:text-[#D4A373] transition-colors"
                    title="Copy email"
                  >
                    {copied ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>

                {/* Role full row */}
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FAF6E6]/80 border border-[#D4A373]/10">
                  <div className="w-7 h-7 rounded-lg bg-[#D4A373]/20 flex items-center justify-center text-[#D4A373]">
                    <ShieldCheck size={13} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-[#8D6E63] uppercase tracking-wider">Access Role</p>
                    <p className="text-xs font-bold text-[#1A2744] capitalize">{selectedAdmin.role || 'admin'}</p>
                  </div>
                </div>

                {/* Created */}
                {selectedAdmin.createdAt && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FAF6E6]/80 border border-[#D4A373]/10">
                    <div className="w-7 h-7 rounded-lg bg-[#D4A373]/20 flex items-center justify-center text-[#D4A373]">
                      <Calendar size={13} />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-[#8D6E63] uppercase tracking-wider">Member Since</p>
                      <p className="text-xs font-bold text-[#1A2744]">
                        {new Date(selectedAdmin.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-[#1A2744] border border-[#D4A373]/20 hover:bg-[#FAF6E6] transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    remove(selectedAdmin._id);
                    closeModal();
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 border border-red-100 bg-red-50 hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admins;
