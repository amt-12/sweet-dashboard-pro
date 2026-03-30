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
  RefreshCw,
  Hash,
  Crown
} from 'lucide-react';
import { fetchWithAuth } from '@/services/auth';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "../components/ui/sheet";
import { PermissionsDrawer } from '@/components/PermissionsDrawer';

const RoleBadge = ({ role }: { role: string }) => {
  const isManager = role === 'superadmin';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm border ${
        isManager
          ? 'bg-chocolate text-white border-chocolate/10'
          : 'bg-white text-chocolate border-chocolate/10'
      }`}
    >
      {isManager ? <Crown size={12} className="text-strawberry" /> : <Shield size={12} className="text-strawberry/60" />}
      {isManager ? 'Manager' : 'Staff'}
    </span>
  );
};

const Avatar = ({ name, size = 'md' }: { name?: string; size?: 'sm' | 'md' | 'lg' }) => {
  const letter = (name || '?').charAt(0).toUpperCase();
  const dims =
    size === 'lg' ? 'w-24 h-24 text-4xl' : size === 'sm' ? 'w-10 h-10 text-sm' : 'w-16 h-16 text-xl';
  return (
    <div
      className={`${dims} rounded-[1.5rem] bg-chocolate flex items-center justify-center text-white font-dancing font-bold shadow-bakery transform rotate-3 hover:rotate-0 transition-all duration-500`}
    >
      {letter}
    </div>
  );
};

const Admins = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'admin' });
  const [creating, setCreating] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any | null>(null);
  const [showSheet, setShowSheet] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showPermissionsDrawer, setShowPermissionsDrawer] = useState(false);
  const [permissionsLoading, setPermissionsLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/api/admins');
      if (!res.ok) throw new Error('Failed to load team members');
      const data = await res.json();
      setAdmins(data.users || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load team members');
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
        throw new Error(err.error || 'Failed to add member');
      }
      toast.success('New team member added!');
      setForm({ email: '', password: '', name: '', role: 'admin' });
      setShowSheet(false);
      load();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add member');
    } finally {
      setCreating(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Remove this team member? Access will be revoked immediately.')) return;
    try {
      const res = await fetchWithAuth(`/api/admins/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove member');
      setAdmins((prev) => prev.filter((a) => a._id !== id));
      toast.success('Team member removed.');
      if (selectedAdmin?._id === id) setShowProfile(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove member');
    }
  };

  const copyEmail = (email?: string) => {
    if (!email) return;
    navigator.clipboard?.writeText(email).then(() => {
      toast.success('Email copied to clipboard');
    });
  };

  const savePermissions = async (permissions: string[]) => {
    if (!selectedAdmin?._id) return;
    try {
      const res = await fetchWithAuth(`/api/admins/${selectedAdmin._id}/permissions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update permissions');
      }
      const updatedUser = await res.json();
      setAdmins((prev) =>
        prev.map((a) => (a._id === selectedAdmin._id ? updatedUser : a))
      );
      setSelectedAdmin(updatedUser);
      toast.success('Permissions updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update permissions');
    }
  };

  const managerCount = admins.filter((a) => a.role === 'superadmin').length;
  const staffCount = admins.filter((a) => a.role === 'admin').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-lora">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold font-dancing text-chocolate">Team Members</h2>
          <p className="text-sm text-chocolate-light font-medium mt-1">
            Manage your bakery's administrative team and permissions.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={load}
            className="p-3 bg-white border border-chocolate/10 rounded-full text-chocolate hover:bg-strawberry/5 transition-all shadow-sm group"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
          </button>
          <button 
            onClick={() => setShowSheet(true)} 
            className="px-6 py-3 bg-chocolate text-white rounded-full flex items-center gap-2 shadow-bakery hover:shadow-bakery-lg hover:bg-strawberry transition-all duration-300"
          >
            <Plus size={18} />
            <span className="font-bold text-xs uppercase tracking-widest text-[#F5ECD7]">Add Member</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2rem] shadow-bakery border border-chocolate/5 flex items-center justify-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-chocolate text-white flex items-center justify-center shadow-bakery transform -rotate-3">
            <Users size={32} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-chocolate/40 uppercase tracking-widest mb-1 ml-1">Total Team</p>
            <h3 className="text-3xl font-bold font-playfair text-chocolate">{admins.length}</h3>
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2rem] shadow-bakery border border-chocolate/5 flex items-center justify-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-strawberry text-white flex items-center justify-center shadow-bakery transform rotate-3">
            <Crown size={32} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-chocolate/40 uppercase tracking-widest mb-1 ml-1">Managers</p>
            <h3 className="text-3xl font-bold font-playfair text-chocolate">{managerCount}</h3>
          </div>
        </div>
        <div className="md:col-span-2 bg-[#F5ECD7]/30 border border-[#D4A373]/10 rounded-[2rem] p-8 flex items-center">
            <p className="text-sm text-chocolate-light font-medium italic leading-relaxed">
              "Great things in business are never done by one person. They're done by a team of people." — Standardize access levels to keep your bakery secure.
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {admins.map((a) => (
          <div key={a._id} className="group relative bg-white rounded-[2.5rem] p-10 border border-chocolate/5 shadow-bakery hover:shadow-bakery-lg transition-all duration-500 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-strawberry/5 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-strawberry/10" />
            
            <div className="flex flex-col items-center text-center">
              <Avatar name={a.name || a.email} size="lg" />
              <div className="mt-8 space-y-2">
                <h3 className="text-2xl font-bold font-playfair text-chocolate group-hover:text-strawberry transition-colors italic">
                  {a.name || 'Unnamed Member'}
                </h3>
                <p className="text-xs text-chocolate-light font-medium">{a.email}</p>
                <div className="pt-4 flex justify-center">
                  <RoleBadge role={a.role || 'admin'} />
                </div>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-chocolate/5 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-widest text-chocolate/30 mb-1">ID Code</span>
                <span className="font-mono text-[10px] font-bold text-chocolate/40 italic">#{String(a._id || '').slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setSelectedAdmin(a); setShowProfile(true); }}
                  className="p-3 bg-white border border-chocolate/10 rounded-full text-chocolate hover:bg-chocolate hover:text-white transition-all shadow-sm"
                >
                  <Eye size={16} />
                </button>
                <button 
                  onClick={() => { setSelectedAdmin(a); setShowPermissionsDrawer(true); }}
                  className="p-3 bg-white border border-chocolate/10 rounded-full text-chocolate hover:bg-strawberry hover:border-strawberry hover:text-white transition-all shadow-sm"
                >
                  <Lock size={16} />
                </button>
                <button 
                  onClick={() => remove(a._id)}
                  className="p-3 bg-white border border-red-100 rounded-full text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Sheet open={showSheet} onOpenChange={setShowSheet}>
        <SheetContent side="right" className="flex flex-col h-full bg-[#FAFBFD] p-0 border-l border-chocolate/10">
          <SheetHeader className="p-10 bg-white border-b border-chocolate/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-strawberry/5 rounded-full -mr-24 -mt-24 blur-3xl" />
            <div className="relative flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-chocolate text-white flex items-center justify-center shadow-bakery transform rotate-3">
                <Users size={28} />
              </div>
              <div>
                <SheetTitle className="text-4xl font-bold text-chocolate font-dancing">
                  Add Member
                </SheetTitle>
                <SheetDescription className="text-chocolate-light font-medium italic">
                  Invite a new soul to your bakery's team.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <form id="team-form" onSubmit={create} className="flex-1 overflow-y-auto p-10 space-y-8">
            <div className="space-y-6">
              <div className="space-y-2 group">
                <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
                  <input 
                    value={form.name} 
                    onChange={(e) => setForm({ ...form, name: e.target.value })} 
                    placeholder="Enter name..."
                    className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-medium placeholder:text-chocolate/10"
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
                  <input 
                    required
                    type="email"
                    value={form.email} 
                    onChange={(e) => setForm({ ...form, email: e.target.value })} 
                    placeholder="email@example.com"
                    className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-medium placeholder:text-chocolate/10 italic"
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Access Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
                  <input 
                    required
                    type="password"
                    value={form.password} 
                    onChange={(e) => setForm({ ...form, password: e.target.value })} 
                    placeholder="••••••••"
                    className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-medium placeholder:text-chocolate/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Assign Role</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button" 
                    onClick={() => setForm({...form, role: 'admin'})}
                    className={`py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest border transition-all ${form.role === 'admin' ? 'bg-chocolate text-white border-chocolate shadow-bakery' : 'bg-white text-chocolate/40 border-chocolate/10 hover:border-strawberry/30'}`}
                  >
                    Staff
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setForm({...form, role: 'superadmin'})}
                    className={`py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest border transition-all ${form.role === 'superadmin' ? 'bg-chocolate text-white border-chocolate shadow-bakery' : 'bg-white text-chocolate/40 border-chocolate/10 hover:border-strawberry/30'}`}
                  >
                    Manager
                  </button>
                </div>
              </div>
            </div>
          </form>

          <SheetFooter className="p-10 bg-white border-t border-chocolate/5 flex flex-row justify-between items-center">
            <button type="button" onClick={() => setShowSheet(false)} className="px-8 py-3 rounded-full text-xs font-bold text-chocolate bg-white border border-chocolate/10 hover:bg-chocolate/5 transition-all uppercase tracking-widest">
              Cancel
            </button>
            <button type="submit" form="team-form" disabled={creating} className="px-10 py-4 bg-chocolate text-white rounded-full font-bold shadow-bakery hover:bg-strawberry transition-all disabled:opacity-50 flex items-center gap-3 uppercase tracking-widest">
              {creating && <RefreshCw size={16} className="animate-spin" />}
              Create Member
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={showProfile} onOpenChange={setShowProfile}>
        <SheetContent side="right" className="flex flex-col h-full bg-[#FAFBFD] p-0 border-l border-chocolate/10">
          <SheetHeader className="p-10 bg-chocolate text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl" />
            <div className="relative flex flex-col items-center gap-6 py-10">
                <Avatar name={selectedAdmin?.name || selectedAdmin?.email} size="lg" />
                <div className="text-center">
                    <SheetTitle className="text-4xl font-bold text-white font-dancing mb-2">
                        {selectedAdmin?.name || 'Unnamed Member'}
                    </SheetTitle>
                    <div className="flex justify-center">
                        <RoleBadge role={selectedAdmin?.role || 'admin'} />
                    </div>
                </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-10 space-y-10">
            <div className="space-y-6">
                <h4 className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] border-b border-chocolate/5 pb-2">Member Details</h4>
                
                <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-chocolate/5">
                        <div className="p-3 bg-chocolate/5 text-chocolate rounded-xl">
                            <Mail size={18} />
                        </div>
                        <div className="flex-1">
                            <p className="text-[9px] font-bold text-chocolate/20 uppercase tracking-widest">Email Address</p>
                            <p className="text-sm font-bold text-chocolate italic">{selectedAdmin?.email}</p>
                        </div>
                        <button onClick={() => copyEmail(selectedAdmin?.email)} className="p-2 text-chocolate/20 hover:text-strawberry transition-colors">
                            <Copy size={16} />
                        </button>
                    </div>

                    <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-chocolate/5">
                        <div className="p-3 bg-chocolate/5 text-chocolate rounded-xl">
                            <Hash size={18} />
                        </div>
                        <div className="flex-1">
                            <p className="text-[9px] font-bold text-chocolate/20 uppercase tracking-widest">Identification Code</p>
                            <p className="text-sm font-mono font-bold text-chocolate">#{String(selectedAdmin?._id || '').toUpperCase()}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-chocolate/5">
                        <div className="p-3 bg-chocolate/5 text-chocolate rounded-xl">
                            <Calendar size={18} />
                        </div>
                        <div className="flex-1">
                            <p className="text-[9px] font-bold text-chocolate/20 uppercase tracking-widest">Joined Team</p>
                            <p className="text-sm font-bold text-chocolate">
                                {selectedAdmin?.createdAt ? new Date(selectedAdmin.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Joining date unknown'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="p-8 bg-strawberry/5 rounded-[2rem] border border-strawberry/10 space-y-4">
                <h4 className="text-[10px] font-bold text-strawberry uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={14} /> Permissions Overview
                </h4>
                <p className="text-xs text-chocolate-light font-medium italic leading-relaxed">
                    This user has {selectedAdmin?.role === 'superadmin' ? 'unrestricted' : 'limited staff'} access to the dashboard. They can {selectedAdmin?.role === 'superadmin' ? 'manage team members, access financial reports, and edit store settings' : 'manage products, view orders, and update inventory'}.
                </p>
            </div>
          </div>

          <SheetFooter className="p-10 bg-white border-t border-chocolate/5 flex flex-row justify-between items-center">
            <button onClick={() => setShowProfile(false)} className="px-8 py-3 rounded-full text-xs font-bold text-chocolate bg-white border border-chocolate/10 hover:bg-chocolate/5 transition-all uppercase tracking-widest">
              Close Profile
            </button>
            <button 
                onClick={() => remove(selectedAdmin?._id)} 
                className="px-8 py-3 bg-red-50 text-red-500 rounded-full flex items-center gap-2 border border-red-100 hover:bg-red-500 hover:text-white transition-all text-xs font-bold uppercase tracking-widest"
            >
              <Trash2 size={16} />
              Remove Member
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <PermissionsDrawer
        open={showPermissionsDrawer}
        onOpenChange={setShowPermissionsDrawer}
        onSave={savePermissions}
        currentPermissions={selectedAdmin?.permissions || []}
        memberName={selectedAdmin?.name || selectedAdmin?.email || 'Team Member'}
      />
    </div>
  );
};

export default Admins;
