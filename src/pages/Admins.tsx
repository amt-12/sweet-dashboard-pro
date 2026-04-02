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
  Phone,
  ArrowLeft,
  Search,
  LayoutGrid,
  List,
  Star,
  Sparkles,
  FileText,
  Award
} from 'lucide-react';
import { fetchWithAuth } from '@/services/auth';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PermissionsDrawer } from '@/components/PermissionsDrawer';
import { useNavigate } from 'react-router-dom';

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
  main: 'Core Realms',
  productDetails: 'Creations & Details',
  about: 'Legacy Pages',
  custom: 'Artisan Permissions',
};

const RoleBadge = ({ role }: { role: string }) => {
  const isManager = role === 'superadmin';
  const isAdmin = role === 'admin';
  
  let bgColor = 'bg-orange-100 text-orange-700 border-orange-200';
  let icon = <Shield size={10} />;
  let displayText = role?.charAt(0).toUpperCase() + role?.slice(1).replace(/([A-Z])/g, ' $1').trim() || 'Artisan';

  if (isManager) {
    bgColor = 'bg-chocolate text-white border-chocolate/10';
    icon = <Crown size={10} className="text-strawberry" />;
    displayText = 'Custodian';
  } else if (isAdmin) {
    bgColor = 'bg-cream text-chocolate border-chocolate/10 border-dashed';
    icon = <Shield size={10} className="text-strawberry/60" />;
    displayText = 'Master';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-sm border ${bgColor} italic`}>
      {icon}
      {displayText}
    </span>
  );
};

const Avatar = ({ name, size = 'md' }: { name?: string; size?: 'sm' | 'md' | 'lg' }) => {
  const letter = (name || '?').charAt(0).toUpperCase();
  const dims = size === 'lg' ? 'w-20 h-20 text-3xl' : size === 'sm' ? 'w-10 h-10 text-sm' : 'w-14 h-14 text-xl';
  return (
    <div className={`${dims} rounded-[1.25rem] bg-chocolate flex items-center justify-center text-white font-dancing font-bold shadow-bakery transform rotate-3 hover:rotate-0 transition-all duration-500`}>
      {letter}
    </div>
  );
};

const Admins = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '', phone: '', role: 'admin' });
  const [showForm, setShowForm] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any | null>(null);
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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [searchQuery, setSearchQuery] = useState("");
  const [permissionSearch, setPermissionSearch] = useState("");
  const [roleSearch, setRoleSearch] = useState("");
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('https://bakery-bakend.onrender.com/api/admins');
      if (!res.ok) throw new Error('Failed to load circle members');
      const data = await res.json();
      setAdmins(data.users || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load circle members');
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    setPermissionsLoading(true);
    try {
      const res = await fetchWithAuth('https://bakery-bakend.onrender.com/api/permissions');
      if (!res.ok) throw new Error('Failed to load permission realms');
      const data = await res.json().catch(() => ({}));
      setPermissionCatalog(data.permissions || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load permissions');
      setPermissionCatalog([]);
    } finally {
      setPermissionsLoading(false);
    }
  };

  const loadRoles = async () => {
    setRolesLoading(true);
    try {
      const res = await fetchWithAuth('https://bakery-bakend.onrender.com/api/roles');
      if (!res.ok) throw new Error('Failed to load circle roles');
      const data = await res.json();
      setRoles(data.roles || []);
    } catch (err: any) {
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
    if (!permissionForm.name.trim() || !permissionForm.url.trim()) {
      toast.error('Identity and Realm are required');
      return;
    }

    setPermissionSubmitting(true);
    try {
      const res = await fetchWithAuth('https://bakery-bakend.onrender.com/api/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: permissionForm.name.trim(), url: permissionForm.url.trim(), group: permissionForm.group }),
      });

      if (!res.ok) throw new Error('Failed to add realm');
      toast.success('Permission realm expanded');
      setPermissionForm({ name: '', url: '', group: permissionForm.group });
      await loadPermissions();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setPermissionSubmitting(false);
    }
  };

  const deletePermission = async (permission: PermissionItem) => {
    if (!confirm(`Revoke permissionrealm \"${permission.name}\"? This affects the entire circle.`)) return;
    try {
      const res = await fetchWithAuth(`https://bakery-bakend.onrender.com/api/permissions/${permission._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to revoke');
      toast.success('Realm revoked');
      await loadPermissions();
      await load(); // Admins permissions may have changed
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetchWithAuth('https://bakery-bakend.onrender.com/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to enroll member');
      toast.success('New member welcomed to the Master Circle!');
      setForm({ email: '', password: '', name: '', phone: '', role: 'admin' });
      setShowForm(false);
      load();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Exile this member from the circle? Access vanishes instantly.')) return;
    try {
      const res = await fetchWithAuth(`https://bakery-bakend.onrender.com/api/admins/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Exile failed');
      setAdmins((prev) => prev.filter((a) => a._id !== id));
      toast.success('Member removed from records.');
      if (selectedAdmin?._id === id) setShowProfile(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const savePermissions = async (permissions: string[]) => {
    if (!selectedAdmin?._id) return;
    try {
      const res = await fetchWithAuth(`https://bakery-bakend.onrender.com/api/admins/${selectedAdmin._id}/permissions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions }),
      });
      if (!res.ok) throw new Error('Update failed');
      const updatedUser = await res.json();
      setAdmins((prev) => prev.map((a) => (a._id === selectedAdmin._id ? updatedUser : a)));
      setSelectedAdmin(updatedUser);
      toast.success('Permissions re-aligned.');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const assignRole = async (roleData: RoleItem) => {
    if (!selectedAdmin?._id) return;
    setUpdatingRole(true);
    try {
      const res = await fetchWithAuth(`https://bakery-bakend.onrender.com/api/admins/${selectedAdmin._id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleName: roleData.name, permissions: roleData.permissions }),
      });
      if (!res.ok) throw new Error('Role assignment failed');
      const updatedUser = await res.json();
      setAdmins((prev) => prev.map((a) => (a._id === selectedAdmin._id ? updatedUser : a)));
      setSelectedAdmin(updatedUser);
      toast.success(`Member has been designated as ${roleData.name}`);
      setShowRoleSelector(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUpdatingRole(false);
    }
  };

  const filteredAdmins = admins.filter(a => 
    (a.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPermissionCatalog = permissionCatalog.filter(p =>
    (p.name || '').toLowerCase().includes(permissionSearch.toLowerCase()) ||
    (p.url || '').toLowerCase().includes(permissionSearch.toLowerCase())
  );
  
  const filteredRoles = roles.filter(r =>
    (r.name || '').toLowerCase().includes(roleSearch.toLowerCase()) ||
    (r.description || '').toLowerCase().includes(roleSearch.toLowerCase())
  );
  
  const groupedFeatures = React.useMemo(() => {
    const grouped = permissionCatalog.reduce((acc: Record<string, { name: string; url: string }[]>, item) => {
      const key = item.group && item.group.trim() ? item.group.trim() : 'custom';
      if (!acc[key]) acc[key] = [];
      acc[key].push({ name: item.name, url: item.url });
      return acc;
    }, {});
    return Object.keys(grouped).map((key) => ({ label: GROUP_LABELS[key] || key, items: grouped[key] }));
  }, [permissionCatalog]);

  const allFeatures = React.useMemo(() => permissionCatalog.map((item) => item.url), [permissionCatalog]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 font-lora max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div>
          <h2 className="text-4xl font-bold font-dancing text-chocolate">Master Circle</h2>
          <p className="text-sm text-chocolate-light font-medium mt-1">
            Orchestrate the elite custodians and master artisans of your bakery.
          </p>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={() => navigate('/admin')} className="p-3 bg-white border border-chocolate/5 rounded-full text-chocolate hover:bg-strawberry/5 transition-all shadow-sm group hidden md:flex">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            </button>
           <div className="flex bg-white rounded-full p-1 border border-chocolate/5 shadow-sm">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-chocolate text-white shadow-md' : 'text-chocolate hover:bg-strawberry/5'}`} title="Portraits"><LayoutGrid size={18} /></button>
                <button onClick={() => setViewMode('table')} className={`p-2 rounded-full transition-all ${viewMode === 'table' ? 'bg-chocolate text-white shadow-md' : 'text-chocolate hover:bg-strawberry/5'}`} title="Registry"><List size={18} /></button>
           </div>
          <button onClick={load} className="p-3 bg-white border border-chocolate/5 rounded-full text-chocolate hover:bg-strawberry/5 transition-all shadow-sm group">
            <RefreshCw size={18} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
          </button>
          <button onClick={() => setShowForm(true)} className="px-8 py-3 bg-chocolate text-white rounded-full flex items-center gap-3 shadow-bakery hover:shadow-bakery-lg hover:bg-strawberry transition-all duration-300 font-bold text-xs uppercase tracking-widest active:scale-95">
            <Plus size={20} />
            Enroll Member
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
        <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] shadow-bakery border border-chocolate/5 flex items-center gap-6 group hover:translate-y-[-4px] transition-all duration-500">
           <div className="w-16 h-16 rounded-2xl bg-chocolate text-white flex items-center justify-center shadow-bakery transform -rotate-3 group-hover:rotate-0 transition-transform">
             <Users size={30} />
           </div>
           <div>
             <p className="text-[9px] font-bold text-chocolate/40 uppercase tracking-widest mb-1 italic">The Circle</p>
             <h3 className="text-3xl font-bold font-playfair text-chocolate">{admins.length}</h3>
           </div>
        </div>
        <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] shadow-bakery border border-chocolate/5 flex items-center gap-6 group hover:translate-y-[-4px] transition-all duration-500">
           <div className="w-16 h-16 rounded-2xl bg-strawberry text-white flex items-center justify-center shadow-bakery transform rotate-3 group-hover:rotate-0 transition-transform">
             <Crown size={30} />
           </div>
           <div>
             <p className="text-[9px] font-bold text-chocolate/40 uppercase tracking-widest mb-1 italic">Custodians</p>
             <h3 className="text-3xl font-bold font-playfair text-chocolate">{admins.filter(a => a.role === 'superadmin').length}</h3>
           </div>
        </div>
        <div className="md:col-span-2 bg-cream/40 border border-chocolate/5 rounded-[2.5rem] p-8 flex items-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-strawberry/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-strawberry/10 transition-colors" />
            <p className="text-sm text-chocolate-light font-medium italic leading-relaxed relative z-10">
              "Excellence is not a skill, but a collective spirit." Ensure every master has the perfect realm of influence to preserve our bakery's soul.
            </p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-chocolate/5 shadow-bakery p-10 space-y-8 mx-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold font-playfair text-chocolate italic flex items-center gap-3">
                Permission Catalog
                <Sparkles size={18} className="text-strawberry/40" />
            </h3>
            <p className="text-xs text-chocolate-light font-medium italic">Define the realms of influence available across the Master Circle.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsCatalogOpen(!isCatalogOpen)} 
              className={`px-6 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${isCatalogOpen ? 'bg-strawberry text-white shadow-bakery' : 'bg-chocolate/5 text-chocolate hover:bg-chocolate/10'}`}
            >
              {isCatalogOpen ? <X size={14} /> : <Plus size={14} />}
              {isCatalogOpen ? 'Close Catalog' : 'Expand Influence Catalog'}
            </button>
            <button onClick={loadPermissions} className="p-3 bg-white border border-chocolate/5 rounded-full text-chocolate hover:bg-strawberry/5 transition-all shadow-sm">
              <RefreshCw size={16} className={permissionsLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {isCatalogOpen && (
          <div className="space-y-8 animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-4">
              <input value={permissionSearch} onChange={e => setPermissionSearch(e.target.value)} placeholder="Search permission realms..." className="flex-1 px-6 py-3 bg-[#FAFBFD] border border-chocolate/5 rounded-2xl text-sm outline-none transition-all font-bold text-chocolate italic placeholder:text-chocolate/30" />
              <button onClick={() => setPermissionSearch('')} className="px-4 py-3 bg-white border border-chocolate/5 rounded-2xl text-chocolate hover:bg-strawberry/5">Clear</button>
            </div>
            <form onSubmit={addPermission} className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <input value={permissionForm.name} onChange={e => setPermissionForm(p => ({ ...p, name: e.target.value }))} placeholder="Identity (e.g. Analytics Viewer)" className="w-full px-6 py-4 bg-[#FAFBFD] border border-chocolate/5 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-bold text-chocolate italic placeholder:text-chocolate/20" />
              <input value={permissionForm.url} onChange={e => setPermissionForm(p => ({ ...p, url: e.target.value }))} placeholder="Realm Route (e.g. /admin/analytics)" className="md:col-span-2 w-full px-6 py-4 bg-[#FAFBFD] border border-chocolate/5 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-mono font-bold text-chocolate italic placeholder:text-chocolate/20" />
              <div className="flex gap-3">
                 <select value={permissionForm.group} onChange={e => setPermissionForm(p => ({ ...p, group: e.target.value }))} className="flex-1 px-4 py-4 bg-[#FAFBFD] border border-chocolate/5 focus:border-strawberry rounded-2xl text-xs font-bold uppercase tracking-widest text-chocolate italic appearance-none outline-none">
                     <option value="main">Core Realms</option>
                     <option value="productDetails">Creation Details</option>
                     <option value="about">Legacy Pages</option>
                     <option value="custom">Bespoke</option>
                 </select>
                 <button type="submit" disabled={permissionSubmitting} className="px-8 py-4 bg-chocolate text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-strawberry transition-all disabled:opacity-50 active:scale-95">Add</button>
              </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {filteredPermissionCatalog.map((p) => (
                 <div key={p._id} className="group flex items-center justify-between gap-4 p-4 rounded-2xl border border-chocolate/5 bg-[#FAFBFD] hover:border-strawberry/20 hover:bg-white transition-all duration-300">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-cream flex items-center justify-center text-chocolate/40 group-hover:bg-strawberry/10 group-hover:text-strawberry transition-colors"><ShieldCheck size={14} /></div>
                       <div>
                          <p className="text-xs font-bold text-chocolate italic">{p.name}</p>
                          <p className="text-[9px] font-mono font-medium text-chocolate/30">{p.url}</p>
                       </div>
                    </div>
                    <button type="button" onClick={() => deletePermission(p)} className="p-2.5 rounded-full text-red-300 border border-transparent hover:border-red-100 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={12} /></button>
                 </div>
               ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-[2.5rem] shadow-bakery border border-chocolate/5 mx-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-chocolate/30 group-focus-within:text-strawberry transition-colors w-5 h-5" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Identify members in the Master Circle..." className="w-full pl-14 pr-6 py-4 rounded-2xl bg-[#FAF6E6]/50 text-chocolate outline-none border border-transparent focus:border-strawberry/20 focus:bg-white focus:ring-8 focus:ring-strawberry/5 transition-all font-medium placeholder:text-chocolate/20 italic" />
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] shadow-bakery border border-chocolate/5 overflow-hidden mx-4">
           <Table>
              <TableHeader>
                <TableRow className="border-chocolate/5 hover:bg-transparent">
                  <TableHead className="w-20 pl-8 h-16 font-bold text-chocolate italic uppercase tracking-widest text-[10px]">Portal</TableHead>
                  <TableHead className="h-16 font-bold text-chocolate/80 uppercase tracking-widest text-[10px]">Identity & Account</TableHead>
                  <TableHead className="h-16 font-bold text-chocolate/80 uppercase tracking-widest text-[10px] hidden md:table-cell">Role Badge</TableHead>
                  <TableHead className="h-16 font-bold text-chocolate/80 uppercase tracking-widest text-[10px] hidden lg:table-cell">Influence</TableHead>
                  <TableHead className="h-16 font-bold text-chocolate italic uppercase tracking-widest text-[10px] text-right pr-8">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmins.map((a) => (
                  <TableRow key={a._id} className="group border-chocolate/5 hover:bg-strawberry/[0.02] transition-colors duration-500">
                    <TableCell className="py-6 pl-8">
                       <Avatar name={a.name || a.email} size="sm" />
                    </TableCell>
                    <TableCell className="py-6">
                       <div>
                          <span className="font-bold text-chocolate text-lg tracking-tight group-hover:text-strawberry transition-colors block italic">{a.name || 'Unnamed Artisan'}</span>
                          <p className="text-[10px] text-chocolate-light/60 font-medium italic mt-0.5">{a.email}</p>
                       </div>
                    </TableCell>
                    <TableCell className="py-6 hidden md:table-cell">
                       <RoleBadge role={a.role || 'admin'} />
                    </TableCell>
                    <TableCell className="py-6 hidden lg:table-cell">
                       <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-chocolate/20 uppercase tracking-widest mb-1 italic">Realms of influence</span>
                          <span className="text-[10px] font-bold text-chocolate-light italic">{a.role === 'superadmin' ? 'Universal Access' : `${Array.isArray(a.permissions) ? a.permissions.length : 0} Realms Defined`}</span>
                       </div>
                    </TableCell>
                    <TableCell className="py-6 pr-8 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button onClick={() => { setSelectedAdmin(a); setShowProfile(true); }} className="p-3 bg-white border border-chocolate/5 rounded-full text-chocolate hover:bg-chocolate hover:text-white transition-all shadow-sm"><Eye size={16} /></button>
                          <button onClick={() => { setSelectedAdmin(a); setShowPermissionsDrawer(true); }} className="p-3 bg-white border border-chocolate/5 rounded-full text-chocolate hover:bg-strawberry hover:text-white transition-all shadow-sm"><Lock size={16} /></button>
                          <button onClick={() => remove(a._id)} className="p-3 bg-white border border-red-50 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash2 size={16} /></button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
           </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-4">
           {filteredAdmins.map((a) => (
             <div key={a._id} className="group relative bg-white rounded-[3rem] p-10 border border-chocolate/5 shadow-bakery hover:shadow-bakery-lg transition-all duration-500 overflow-hidden text-center transform hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-strawberry/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-strawberry/10 transition-all duration-700" />
                
                <div className="flex flex-col items-center">
                   <div className="relative mb-8">
                     <Avatar name={a.name || a.email} size="lg" />
                     <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
                        <RoleBadge role={a.role || 'admin'} />
                     </div>
                   </div>
                   
                   <div className="space-y-2 mb-10 pt-4">
                      <h3 className="text-2xl font-bold font-playfair text-chocolate group-hover:text-strawberry transition-colors italic">{a.name || 'Unnamed Artisan'}</h3>
                      <p className="text-xs text-chocolate-light font-medium italic">{a.email}</p>
                   </div>

                   <div className="w-full pt-8 border-t border-chocolate/5 flex items-center justify-between">
                      <div className="flex flex-col items-start translate-x-1">
                         <span className="text-[8px] font-bold uppercase tracking-widest text-chocolate/20 mb-1">Circle Rank</span>
                         <span className="text-[10px] font-mono font-bold text-chocolate-light italic">#{String(a._id || '').slice(-6).toUpperCase()}</span>
                      </div>
                      <div className="flex gap-2">
                         <button onClick={() => { setSelectedAdmin(a); setShowProfile(true); }} className="p-3 bg-white border border-chocolate/5 rounded-full text-chocolate hover:bg-chocolate hover:text-white transition-all shadow-sm"><Eye size={16} /></button>
                         <button onClick={() => { setSelectedAdmin(a); setShowPermissionsDrawer(true); }} className="p-3 bg-white border border-chocolate/5 rounded-full text-chocolate hover:bg-strawberry hover:text-white transition-all shadow-sm"><Lock size={16} /></button>
                         <button onClick={() => remove(a._id)} className="p-3 bg-white border border-red-50 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash2 size={16} /></button>
                      </div>
                   </div>
                </div>
             </div>
           ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-[95vw] md:max-w-xl h-[90vh] flex flex-col p-0 bg-[#FAFBFD] border-none overflow-hidden rounded-[2.5rem]">
          <DialogHeader className="p-10 bg-white border-b border-chocolate/5 relative shrink-0">
             <div className="absolute top-0 right-0 w-64 h-64 bg-strawberry/5 rounded-full -mr-32 -mt-32 blur-3xl" />
             <div className="relative flex items-center gap-6">
                <div className="w-16 h-16 bg-chocolate text-white rounded-2xl flex items-center justify-center shadow-bakery transform rotate-3">
                   <Users size={28} />
                </div>
                <div>
                   <DialogTitle className="text-4xl font-bold text-chocolate font-dancing">Enroll Master</DialogTitle>
                   <DialogDescription className="text-chocolate-light font-medium italic">Invite a new visionary soul to the bakery's elite circle.</DialogDescription>
                </div>
             </div>
          </DialogHeader>

          <form id="enroll-form" onSubmit={create} className="flex-1 overflow-y-auto p-10 space-y-8 no-scrollbar">
             <div className="space-y-6">
                <div className="space-y-2 group">
                   <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1 italic">Master Name</label>
                   <div className="relative">
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry" />
                      <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Enter full name..." className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-chocolate/5 outline-none focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 transition-all text-sm font-bold text-chocolate italic placeholder:text-chocolate/10" />
                   </div>
                </div>

                <div className="space-y-2 group">
                   <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1 italic">Email Account</label>
                   <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry" />
                      <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="master@thebakery.in" className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-chocolate/5 outline-none focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 transition-all text-sm font-bold text-chocolate italic placeholder:text-chocolate/10" />
                   </div>
                </div>

                <div className="space-y-2 group">
                   <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1 italic">Secure Word</label>
                   <div className="relative">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry" />
                      <input required type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-chocolate/5 outline-none focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 transition-all text-sm font-bold text-chocolate" />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1 italic">Designation & Role</label>
                   <div className="grid grid-cols-2 gap-4">
                      {roles.map(r => {
                        const isSelected = form.role?.toLowerCase() === r.name.toLowerCase();
                        return (
                          <button key={r._id} type="button" onClick={() => setForm({...form, role: r.name})} className={`py-4 px-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest border transition-all ${isSelected ? 'bg-chocolate text-white border-chocolate shadow-bakery' : 'bg-white text-chocolate/40 border-chocolate/5 hover:border-strawberry/30 hover:text-chocolate hover:bg-strawberry/5'}`}>
                            {r.name}
                          </button>
                        );
                      })}
                   </div>
                </div>
             </div>
          </form>

          <DialogFooter className="p-10 bg-white border-t border-chocolate/5 flex flex-row items-center justify-between shrink-0">
             <button type="button" onClick={() => setShowForm(false)} className="px-10 py-4 rounded-full border border-chocolate/10 font-bold text-chocolate bg-white hover:bg-chocolate/5 transition-all text-xs uppercase tracking-[0.2em] italic">Cancel</button>
             <button type="submit" form="enroll-form" disabled={loading} className="px-12 py-4 bg-chocolate text-white rounded-full font-bold shadow-bakery hover:bg-strawberry transition-all text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3">
               {loading && <RefreshCw size={16} className="animate-spin" />}
               Enroll Member
             </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile & Roles Dialogs (simplified as Dialogs instead of Sheets for space) */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="max-w-[95vw] md:max-w-2xl h-[90vh] flex flex-col p-0 bg-[#FAFBFD] border-none overflow-hidden rounded-[2.5rem]">
           <DialogHeader className="p-16 bg-chocolate text-white relative shrink-0 overflow-hidden text-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
              <div className="relative flex flex-col items-center gap-8">
                 <Avatar name={selectedAdmin?.name || selectedAdmin?.email} size="lg" />
                 <div>
                    <DialogTitle className="text-5xl font-bold font-dancing text-white mb-2">{selectedAdmin?.name || 'Unnamed'}</DialogTitle>
                    <RoleBadge role={selectedAdmin?.role || 'admin'} />
                 </div>
              </div>
           </DialogHeader>

           <div className="flex-1 overflow-y-auto p-12 space-y-12 no-scrollbar">
              <div className="space-y-6">
                  <h4 className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.3em] border-b border-chocolate/5 pb-2 ml-1 italic">Circle Dossier</h4>
                  <div className="space-y-4">
                     <div className="flex items-center gap-4 bg-white p-5 rounded-3xl border border-chocolate/5 shadow-sm">
                        <div className="p-4 bg-chocolate/5 text-chocolate rounded-2xl"><Mail size={20} /></div>
                        <div className="flex-1">
                           <p className="text-[9px] font-bold text-chocolate/20 uppercase tracking-widest italic mb-1">Email Account</p>
                           <p className="text-base font-bold text-chocolate italic">{selectedAdmin?.email}</p>
                        </div>
                        <button onClick={() => { navigator.clipboard.writeText(selectedAdmin?.email); toast.success('Account copied'); }} className="p-3 text-chocolate/10 hover:text-strawberry transition-colors"><Copy size={18} /></button>
                     </div>
                     <div className="flex items-center gap-4 bg-white p-5 rounded-3xl border border-chocolate/5 shadow-sm">
                        <div className="p-4 bg-chocolate/5 text-chocolate rounded-2xl"><Calendar size={20} /></div>
                        <div className="flex-1">
                           <p className="text-[9px] font-bold text-chocolate/20 uppercase tracking-widest italic mb-1">Enrollment Date</p>
                           <p className="text-base font-bold text-chocolate italic">{selectedAdmin?.createdAt ? new Date(selectedAdmin.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Ancient Artifact'}</p>
                        </div>
                     </div>
                  </div>
              </div>

              <div className="p-10 bg-cream/40 rounded-[2.5rem] border border-chocolate/5 space-y-4 relative overflow-hidden group">
                  <ShieldCheck size={48} className="absolute -bottom-4 -right-4 text-chocolate/5 transform rotate-12 transition-transform group-hover:scale-110" />
                  <h4 className="text-[10px] font-bold text-chocolate uppercase tracking-widest flex items-center gap-2 italic">Influence Insight</h4>
                  <p className="text-sm text-chocolate-light font-medium italic leading-relaxed relative z-10">
                    {selectedAdmin?.role === 'superadmin' 
                      ? 'Possesses universal dominion over the bakery realms. Can orchestrate team enrollment, observe financial shadows, and redefine the core essence of the atelier.'
                      : 'Holds specialized stewardship over curated bakery sectors. Tasked with preserving the harmony between creation and client.'}
                  </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <button onClick={() => setShowRoleSelector(true)} className="p-6 bg-white rounded-3xl border border-chocolate/5 hover:border-strawberry/30 transition-all text-left shadow-sm group">
                    <div className="flex items-center justify-between mb-2">
                       <Award size={20} className="text-chocolate/20 group-hover:text-strawberry" />
                       <ChevronDown size={16} className="text-chocolate/20" />
                    </div>
                    <p className="text-[9px] font-bold text-chocolate/30 uppercase tracking-widest mb-1 italic">Redefine Rank</p>
                    <p className="text-sm font-bold text-chocolate italic">Change Member Role</p>
                 </button>
                 <button onClick={() => setShowPermissionsDrawer(true)} className="p-6 bg-white rounded-3xl border border-chocolate/5 hover:border-strawberry/30 transition-all text-left shadow-sm group">
                    <div className="flex items-center justify-between mb-2">
                       <Lock size={20} className="text-chocolate/20 group-hover:text-strawberry" />
                       <ChevronDown size={16} className="text-chocolate/20" />
                    </div>
                    <p className="text-[9px] font-bold text-chocolate/30 uppercase tracking-widest mb-1 italic">Tailor Influence</p>
                    <p className="text-sm font-bold text-chocolate italic">Manage Permissions</p>
                 </button>
              </div>
           </div>

           <DialogFooter className="p-10 bg-white border-t border-chocolate/5 flex flex-row items-center justify-between shrink-0">
              <button onClick={() => setShowProfile(false)} className="px-10 py-4 font-bold text-chocolate bg-white border border-chocolate/10 rounded-full hover:bg-chocolate/5 transition-all text-[10px] uppercase tracking-widest italic">Close Portal</button>
              <button onClick={() => remove(selectedAdmin?._id)} className="px-10 py-4 bg-red-50 text-red-500 rounded-full border border-red-100 hover:bg-red-500 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                 <X size={16} /> Exile Member
              </button>
           </DialogFooter>
        </DialogContent>
      </Dialog>

      <PermissionsDrawer
        open={showPermissionsDrawer}
        onOpenChange={setShowPermissionsDrawer}
        onSave={savePermissions}
        currentPermissions={selectedAdmin?.permissions || []}
        memberName={selectedAdmin?.name || selectedAdmin?.email || 'Circle Member'}
        groupedFeatures={groupedFeatures}
        allFeatures={allFeatures}
      />

      {/* Role Selection Dialog */}
      <Dialog open={showRoleSelector} onOpenChange={setShowRoleSelector}>
         <DialogContent className="max-w-md bg-[#FAFBFD] border-none rounded-[2.5rem] overflow-hidden p-0">
            <DialogHeader className="p-10 bg-chocolate text-white">
               <DialogTitle className="text-3xl font-bold font-dancing text-white">Designate Rank</DialogTitle>
               <DialogDescription className="text-cream font-medium italic">Adjust the hierarchy for {selectedAdmin?.name || 'Member'}</DialogDescription>
            </DialogHeader>
            <div className="p-10 space-y-4">
               <div className="mb-4">
                 <input value={roleSearch} onChange={e => setRoleSearch(e.target.value)} placeholder="Filter roles..." className="w-full px-4 py-3 bg-[#FAFBFD] border border-chocolate/5 rounded-2xl text-sm outline-none transition-all font-bold text-chocolate italic placeholder:text-chocolate/30" />
               </div>
               {filteredRoles.map(r => (
                 <button key={r._id} onClick={() => assignRole(r)} disabled={updatingRole} className="w-full p-6 bg-white rounded-2xl border border-chocolate/5 hover:border-strawberry hover:translate-y-[-2px] transition-all flex items-center justify-between group shadow-sm">
                    <div className="text-left">
                       <p className="text-xs font-bold text-chocolate uppercase tracking-widest italic mb-1">{r.name}</p>
                       <p className="text-[10px] text-chocolate-light font-medium italic line-clamp-1">{r.description || `Designate member as a ${r.name}`}</p>
                    </div>
                    <UserCheck size={20} className="text-chocolate/10 group-hover:text-strawberry" />
                 </button>
               ))}
            </div>
         </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admins;
