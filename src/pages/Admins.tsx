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
  Crown,
  Phone
} from 'lucide-react';
import { fetchWithAuth } from '@/services/auth';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "../components/ui/sheet";
import { PermissionsDrawer } from '@/components/PermissionsDrawer';

type PermissionItem = {
  _id: string;
  name: string;
  url: string;
  group?: string;
};

type RoleItem = {
  _id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem?: boolean;
};

const DEFAULT_PERMISSION_GROUPS: Record<string, { name: string; url: string }[]> = {};

const GROUP_LABELS: Record<string, string> = {
  main: 'Main Features',
  productDetails: 'Product Details',
  about: 'About Pages',
  custom: 'Custom Permissions',
};

const RoleBadge = ({ role }: { role: string }) => {
  const isManager = role === 'superadmin';
  const isAdmin = role === 'admin';
  
  // Determine colors and icon based on role
  let bgColor = 'bg-orange-100 text-orange-700 border-orange-200';
  let icon = <Shield size={12} />;
  let displayText = role?.charAt(0).toUpperCase() + role?.slice(1).replace(/([A-Z])/g, ' $1').trim() || 'User';

  if (isManager) {
    bgColor = 'bg-chocolate text-white border-chocolate/10';
    icon = <Crown size={12} className="text-strawberry" />;
    displayText = 'Manager';
  } else if (isAdmin) {
    bgColor = 'bg-white text-chocolate border-chocolate/10';
    icon = <Shield size={12} className="text-strawberry/60" />;
    displayText = 'Staff';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm border ${bgColor}`}
    >
      {icon}
      {displayText}
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
  const [form, setForm] = useState({ email: '', password: '', name: '', phone: '', role: 'admin' });
  const [creating, setCreating] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any | null>(null);
  const [showSheet, setShowSheet] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showPermissionsDrawer, setShowPermissionsDrawer] = useState(false);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [permissionCatalog, setPermissionCatalog] = useState<PermissionItem[]>([]);
  const [permissionForm, setPermissionForm] = useState({ name: '', url: '', group: 'custom' });
  const [permissionSubmitting, setPermissionSubmitting] = useState(false);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('https://bakery-bakend.onrender.com/api/admins');
      if (!res.ok) throw new Error('Failed to load team members');
      const data = await res.json();
      setAdmins(data.users || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    setPermissionsLoading(true);
    try {
      const res = await fetchWithAuth('https://bakery-bakend.onrender.com/api/permissions');
      if (!res.ok) throw new Error('Failed to load permissions catalog');
      const data = await res.json().catch(() => ({}));
      setPermissionCatalog(data.permissions || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load permissions catalog');
      setPermissionCatalog([]);
    } finally {
      setPermissionsLoading(false);
    }
  };

  const loadRoles = async () => {
    setRolesLoading(true);
    try {
      const res = await fetchWithAuth('https://bakery-bakend.onrender.com/api/roles');
      if (!res.ok) throw new Error('Failed to load roles');
      const data = await res.json();
      setRoles(data.roles || []);
    } catch (err: any) {
      console.warn('Failed to load roles:', err.message);
      setRoles([]);
    } finally {
      setRolesLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadPermissions();
    loadRoles();
  }, []);

  const addPermission = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = permissionForm.name.trim();
    const trimmedUrl = permissionForm.url.trim();
    if (!trimmedName) {
      toast.error('Permission name is required');
      return;
    }
    if (!trimmedUrl) {
      toast.error('Permission URL is required');
      return;
    }

    setPermissionSubmitting(true);
    try {
      const res = await fetchWithAuth('/api/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, url: trimmedUrl, group: permissionForm.group }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to add permission');
      }

      toast.success('Permission added to catalog');
  setPermissionForm({ name: '', url: '', group: permissionForm.group });
      await loadPermissions();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add permission');
    } finally {
      setPermissionSubmitting(false);
    }
  };

  const deletePermission = async (permission: PermissionItem) => {
    if (!confirm(`Delete permission \"${permission.name}\"? This will remove it from assigned users too.`)) return;

    try {
      const res = await fetchWithAuth(`/api/permissions/${permission._id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to delete permission');
      }

      toast.success('Permission deleted');
      setPermissionCatalog((prev) => prev.filter((item) => item._id !== permission._id));
      setAdmins((prev) =>
        prev.map((admin) => ({
          ...admin,
          permissions: Array.isArray(admin.permissions)
            ? admin.permissions.filter((p: string) => p !== permission.url)
            : [],
        }))
      );
      if (selectedAdmin) {
        setSelectedAdmin((prev: any) =>
          prev
            ? {
                ...prev,
                permissions: Array.isArray(prev.permissions)
                  ? prev.permissions.filter((p: string) => p !== permission.url)
                  : [],
              }
            : prev
        );
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete permission');
    }
  };

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
      setForm({ email: '', password: '', name: '', phone: '', role: 'admin' });
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

  const assignRole = async (roleData: RoleItem) => {
    if (!selectedAdmin?._id) return;
    
    setUpdatingRole(true);
    try {
      const res = await fetchWithAuth(`/api/admins/${selectedAdmin._id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleName: roleData.name, permissions: roleData.permissions }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to assign role');
      }

      const updatedUser = await res.json();
      setAdmins((prev) =>
        prev.map((a) => (a._id === selectedAdmin._id ? updatedUser : a))
      );
      setSelectedAdmin(updatedUser);
      toast.success(`Role updated to ${roleData.name}`);
      setShowRoleSelector(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign role');
    } finally {
      setUpdatingRole(false);
    }
  };

  const managerCount = admins.filter((a) => a.role === 'superadmin').length;
  const staffCount = admins.filter((a) => a.role === 'admin').length;

  const groupedFeatures = React.useMemo(() => {
    const grouped = permissionCatalog.reduce((acc: Record<string, { name: string; url: string }[]>, item) => {
      const key = item.group && item.group.trim() ? item.group.trim() : 'custom';
      if (!acc[key]) acc[key] = [];
      acc[key].push({ name: item.name, url: item.url });
      return acc;
    }, {});

    const withFallback = Object.keys(grouped).length > 0
      ? grouped
      : DEFAULT_PERMISSION_GROUPS;

    return Object.keys(withFallback).map((key) => ({
      label: GROUP_LABELS[key] || key,
      items: withFallback[key],
    }));
  }, [permissionCatalog]);

  const allFeatures = React.useMemo(() => {
    const fromCatalog = permissionCatalog.map((item) => item.url);
    if (fromCatalog.length > 0) return fromCatalog;
    return Object.values(DEFAULT_PERMISSION_GROUPS).flat().map((item) => item.url);
  }, [permissionCatalog]);

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

      <div className="bg-white rounded-[2rem] border border-chocolate/10 shadow-bakery p-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold font-playfair text-chocolate italic">Permission Catalog</h3>
            <p className="text-xs text-chocolate-light font-medium">Create or remove dashboard permissions used in role assignment.</p>
          </div>
          <button
            onClick={loadPermissions}
            className="p-3 bg-white border border-chocolate/10 rounded-full text-chocolate hover:bg-strawberry/5 transition-all shadow-sm group"
          >
            <RefreshCw size={16} className={permissionsLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
          </button>
        </div>

        <form onSubmit={addPermission} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            value={permissionForm.name}
            onChange={(e) => setPermissionForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Permission name (e.g. Coupons)"
            className="w-full px-4 py-3 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-medium placeholder:text-chocolate/20"
          />
          <input
            value={permissionForm.url}
            onChange={(e) => setPermissionForm((prev) => ({ ...prev, url: e.target.value }))}
            placeholder="Route URL (e.g. /admin/coupons)"
            className="md:col-span-2 w-full px-4 py-3 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-medium placeholder:text-chocolate/20"
          />
          <div className="flex gap-3">
            <select
              value={permissionForm.group}
              onChange={(e) => setPermissionForm((prev) => ({ ...prev, group: e.target.value }))}
              className="flex-1 px-4 py-3 bg-white border border-chocolate/10 focus:border-strawberry rounded-2xl text-sm outline-none font-medium text-chocolate"
            >
              <option value="main">Main Features</option>
              <option value="productDetails">Product Details</option>
              <option value="about">About Pages</option>
              <option value="custom">Custom</option>
            </select>
            <button
              type="submit"
              disabled={permissionSubmitting}
              className="px-6 py-3 bg-chocolate text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-strawberry transition-all disabled:opacity-50"
            >
              {permissionSubmitting ? 'Saving...' : 'Add'}
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(permissionCatalog.length > 0 ? permissionCatalog : Object.values(DEFAULT_PERMISSION_GROUPS).flat().map((item, index) => ({ _id: `fallback-${index}`, name: item.name, url: item.url, group: 'main' }))).map((permission) => (
            <div key={permission._id} className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-chocolate/10 bg-[#FAFBFD]">
              <div>
                <p className="text-sm font-bold text-chocolate">{permission.name}</p>
                <p className="text-[11px] text-chocolate/50 font-mono">{permission.url}</p>
                <p className="text-[10px] uppercase tracking-widest text-chocolate/40">{GROUP_LABELS[permission.group || 'custom'] || permission.group || 'custom'}</p>
              </div>
              {permissionCatalog.length > 0 && (
                <button
                  type="button"
                  onClick={() => deletePermission(permission)}
                  className="p-2 rounded-full text-red-400 border border-red-100 bg-white hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
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

              <div className="space-y-2 group">
                <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Phone Number <span className="text-orange-400 font-medium">(Optional)</span></label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
                  <input 
                    type="tel"
                    value={form.phone} 
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                    placeholder="e.g., +91-9876543210"
                    className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-medium placeholder:text-chocolate/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Assign Role</label>
                {rolesLoading ? (
                  <div className="text-center py-4">
                    <RefreshCw className="w-4 h-4 animate-spin mx-auto text-chocolate/50" />
                  </div>
                ) : roles.length === 0 ? (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700">No roles available. Create roles first.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {roles.map((role) => {
                      const isSelected = form.role?.toLowerCase() === role.name.toLowerCase();
                      return (
                      <button
                        key={role._id}
                        type="button"
                        onClick={() => setForm({ ...form, role: role.name })}
                        className={`py-4 px-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest border transition-all ${
                          isSelected
                            ? 'bg-chocolate text-white border-chocolate shadow-bakery'
                            : 'bg-white text-chocolate/40 border-chocolate/10 hover:border-strawberry/30'
                        }`}
                      >
                        {role.name}
                      </button>
                      );
                    })}
                  </div>
                )}
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
                    {selectedAdmin?.role === 'superadmin' 
                      ? 'This user has unrestricted access to the dashboard. They can manage team members, access financial reports, and edit store settings.'
                      : selectedAdmin?.role === 'admin'
                      ? 'This user has standard admin access. They can manage products, view orders, and update inventory.'
                      : `This user has "${selectedAdmin?.role}" role with ${selectedAdmin?.permissions?.length || 0} assigned permission${selectedAdmin?.permissions?.length !== 1 ? 's' : ''}.`
                    }
                </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] border-b border-chocolate/5 pb-2">Manage Role</h4>
              <button
                onClick={() => setShowRoleSelector(true)}
                className="w-full p-4 bg-white rounded-2xl border border-chocolate/10 hover:border-chocolate/30 transition-colors flex items-center justify-between"
              >
                <span className="text-sm font-semibold text-chocolate capitalize">
                  Current: {selectedAdmin?.role?.charAt(0).toUpperCase() + selectedAdmin?.role?.slice(1).replace(/([A-Z])/g, ' $1').trim() || 'admin'}
                </span>
                <ChevronDown size={18} className="text-chocolate/40" />
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] border-b border-chocolate/5 pb-2">Direct Permissions</h4>
              <button
                onClick={() => setShowPermissionsDrawer(true)}
                className="w-full p-4 bg-white rounded-2xl border border-chocolate/10 hover:border-chocolate/30 transition-colors flex items-center justify-between"
              >
                <span className="text-sm font-semibold text-chocolate">
                  Manage Permissions
                </span>
                <ChevronDown size={18} className="text-chocolate/40" />
              </button>
              <p className="text-xs text-chocolate/60 italic">
                Assign or remove specific permissions independently from the role
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
        groupedFeatures={groupedFeatures}
        allFeatures={allFeatures}
      />

      <Sheet open={showRoleSelector} onOpenChange={setShowRoleSelector}>
        <SheetContent side="right" className="flex flex-col h-full bg-white p-0">
          <SheetHeader className="p-6 bg-chocolate text-white">
            <SheetTitle className="text-white">Assign Role to {selectedAdmin?.name || 'Member'}</SheetTitle>
            <SheetDescription className="text-chocolate-light">
              Select a role to assign to this team member
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {rolesLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-chocolate/50 mb-2" />
                <p className="text-sm text-chocolate/60">Loading roles...</p>
              </div>
            ) : roles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-chocolate/60">No roles available</p>
              </div>
            ) : (
              roles.map((role) => {
                const isCurrentRole = selectedAdmin?.role?.toLowerCase() === role.name.toLowerCase();
                return (
                <button
                  key={role._id}
                  onClick={() => assignRole(role)}
                  disabled={updatingRole || isCurrentRole}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    isCurrentRole
                      ? 'bg-chocolate/10 border-chocolate text-chocolate'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-chocolate hover:bg-orange-50'
                  } ${updatingRole ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold capitalize">{role.name}</h4>
                      {role.description && (
                        <p className="text-xs mt-1 opacity-75">{role.description}</p>
                      )}
                      <p className="text-xs mt-2 opacity-60">
                        {role.permissions?.length || 0} permission{role.permissions?.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    {isCurrentRole && (
                      <CheckCircle2 className="w-5 h-5 text-chocolate flex-shrink-0" />
                    )}
                    {updatingRole && isCurrentRole && (
                      <RefreshCw className="w-5 h-5 animate-spin text-chocolate flex-shrink-0" />
                    )}
                  </div>
                </button>
                );
              })
            )}
          </div>

          <SheetFooter className="p-6 bg-gray-50 border-t">
            <button
              onClick={() => setShowRoleSelector(false)}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Admins;
