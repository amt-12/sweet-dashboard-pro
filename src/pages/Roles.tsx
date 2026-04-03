import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  X,
  Check,
  AlertCircle,
  Save,
  RefreshCw,
  Users,
  Lock,
  ChevronDown,
  Copy,
  Info,
  Shield,
  Search,
  Sparkles,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { fetchWithAuth } from '@/services/auth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Role = {
  _id: string;
  name: string;
  description: string;
  permissions: string[];
  usersCount?: number;
  isSystem?: boolean;
};

type Permission = {
  _id: string;
  name: string;
  url: string;
  group?: string;
};

const SYSTEM_ROLES = ['superadmin', 'admin'];

const RoleIcon = ({ roleType }: { roleType: string }) => {
  const iconProps = 'w-5 h-5';
  switch (roleType) {
    case 'superadmin':
      return <Lock className={iconProps + ' text-strawberry'} />;
    case 'admin':
      return <ShieldCheck className={iconProps + ' text-chocolate'} />;
    default:
      return <Users className={iconProps + ' text-gray-400'} />;
  }
};

const Roles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>('main');
  const [searchQuery, setSearchQuery] = useState("");

  // Load roles and permissions
  const loadRoles = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('https://bakery-bakend.onrender.com/api/roles');
      if (!res.ok) throw new Error('Failed to load roles');
      const data = await res.json();
      setRoles(data.roles || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load roles');
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    setPermissionsLoading(true);
    try {
      const res = await fetchWithAuth('https://bakery-bakend.onrender.com/api/permissions');
      if (!res.ok) throw new Error('Failed to load permissions');
      const data = await res.json();
      setPermissions(data.permissions || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load permissions');
      setPermissions([]);
    } finally {
      setPermissionsLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
    loadPermissions();
  }, []);

  // Open modal for creating new role
  const openNewRoleModal = () => {
    setEditingRole(null);
    setFormData({ name: '', description: '', permissions: [] });
    setShowModal(true);
  };

  // Open modal for editing role
  const openEditRoleModal = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions || [],
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRole(null);
    setFormData({ name: '', description: '', permissions: [] });
  };

  // Save role (create or update)
  const saveRole = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Role name is required');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingRole ? `https://bakery-bakend.onrender.com/api/roles/${editingRole._id}` : 'https://bakery-bakend.onrender.com/api/roles';
      const method = editingRole ? 'PATCH' : 'POST';

      const res = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          permissions: formData.permissions,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save role');
      }

      toast.success(editingRole ? 'Role updated successfully!' : 'Role created successfully!');
      closeModal();
      await loadRoles();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save role');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete role
  const deleteRole = async (role: Role) => {
    if (!confirm(`Delete role "${role.name}"? This cannot be undone.`)) return;

    try {
      const res = await fetchWithAuth(`https://bakery-bakend.onrender.com/api/roles/${role._id}`, { method: 'DELETE' });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to delete role');
      }

      toast.success('Role deleted successfully');
      setRoles((prev) => prev.filter((r) => r._id !== role._id));
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete role');
    }
  };

  // Toggle permission
  const togglePermission = (permUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permUrl)
        ? prev.permissions.filter((p) => p !== permUrl)
        : [...prev.permissions, permUrl],
    }));
  };

  // Group permissions by group
  const groupedPermissions = React.useMemo(() => {
    return permissions.reduce((acc: Record<string, Permission[]>, perm) => {
      const group = perm.group || 'custom';
      if (!acc[group]) acc[group] = [];
      acc[group].push(perm);
      return acc;
    }, {});
  }, [permissions]);

  const permissionGroups = Object.keys(groupedPermissions).sort();

  const filteredRoles = roles.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-lora p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-chocolate text-white flex items-center justify-center shadow-bakery transform rotate-3">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h2 className="text-4xl font-bold font-dancing text-chocolate">Role Configuration</h2>
            <p className="text-sm text-chocolate-light font-medium mt-1">
              Manage security roles and access permissions.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={loadRoles}
            className="p-3 bg-white border border-chocolate/10 rounded-full text-chocolate hover:bg-strawberry/5 transition-all shadow-sm group"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
          </button>
          <button
            onClick={openNewRoleModal}
            className="px-6 py-3 bg-chocolate text-white rounded-full flex items-center gap-2 shadow-bakery hover:shadow-bakery-lg hover:bg-strawberry transition-all duration-300"
          >
            <Plus size={18} />
            <span className="font-bold text-xs uppercase tracking-widest text-[#F5ECD7]">Create Role</span>
          </button>
        </div>
      </div>

      {/* Search/Filter Section */}
      <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-[2rem] shadow-bakery border border-chocolate/5">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-chocolate/30 group-focus-within:text-strawberry transition-colors w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles..."
            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-[#FAF6E6]/50 text-chocolate outline-none border border-transparent focus:border-strawberry/20 focus:bg-white focus:ring-8 focus:ring-strawberry/5 transition-all font-medium placeholder:text-chocolate/20"
          />
        </div>
      </div>

      {/* Roles Table */}
      <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-chocolate/5 shadow-bakery overflow-hidden">
        <Table>
          <TableHeader className="bg-cream/30">
            <TableRow className="border-chocolate/5 hover:bg-transparent">
              <TableHead className="w-20 pl-8 h-16 font-bold text-chocolate italic uppercase tracking-widest text-[10px]">Icon</TableHead>
              <TableHead className="h-16 font-bold text-chocolate/80 uppercase tracking-widest text-[10px]">Role Name</TableHead>
              <TableHead className="h-16 font-bold text-chocolate/80 uppercase tracking-widest text-[10px] hidden md:table-cell">Description</TableHead>
              <TableHead className="h-16 font-bold text-chocolate/80 uppercase tracking-widest text-[10px]">Users</TableHead>
              <TableHead className="h-16 font-bold text-chocolate/80 uppercase tracking-widest text-[10px]">Permissions</TableHead>
              <TableHead className="pr-8 h-16 font-bold text-chocolate italic uppercase tracking-widest text-[10px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="no-scrollbar">
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-24 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <RefreshCw size={32} className="animate-spin text-chocolate/20" />
                    <p className="text-chocolate/40 font-medium italic">Consulting the archives...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredRoles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-24 text-center">
                  <div className="w-16 h-16 bg-chocolate/5 rounded-full flex items-center justify-center mx-auto text-chocolate/10 mb-4">
                    <Shield size={32} />
                  </div>
                  <p className="text-chocolate-light font-medium italic">No roles found in the records.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredRoles.map((role) => (
                <TableRow key={role._id} className="group border-chocolate/5 hover:bg-cream/20 transition-colors">
                  <TableCell className="pl-8 py-6">
                    <div className="w-12 h-12 rounded-xl bg-chocolate text-white flex items-center justify-center shadow-sm transform group-hover:rotate-3 transition-transform duration-300">
                      {role.name.toLowerCase() === 'superadmin' ? <Lock size={20} /> : <Shield size={20} />}
                    </div>
                  </TableCell>
                  <TableCell className="py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-chocolate text-lg tracking-tight group-hover:text-strawberry transition-colors">
                        {role.name}
                      </span>
                      {role.isSystem && (
                        <span className="text-[9px] font-bold text-strawberry uppercase tracking-tighter">System Protected</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-6 hidden md:table-cell max-w-sm">
                    <p className="text-sm text-chocolate/40 font-medium italic line-clamp-1 leading-relaxed">
                      {role.description || "No description provided."}
                    </p>
                  </TableCell>
                  <TableCell className="py-6">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-chocolate/5 rounded-full border border-chocolate/5 flex items-center gap-1.5">
                        <Users size={12} className="text-chocolate/30" />
                        <span className="text-[10px] font-bold text-chocolate/60">
                          {role.usersCount || 0}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-6">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-chocolate/5 rounded-full border border-chocolate/5 text-[10px] font-bold uppercase tracking-widest text-chocolate/40 italic">
                        {role.permissions?.length || 0} Perms
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-6 pr-8 text-right">
                    <div className="flex items-center justify-end gap-2 shrink-0 transition-all">
                      <button
                        onClick={() => openEditRoleModal(role)}
                        disabled={role.isSystem}
                        className="p-2.5 bg-white border border-chocolate/10 rounded-full text-chocolate hover:bg-chocolate hover:text-white transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => deleteRole(role)}
                        disabled={role.isSystem || (role.usersCount || 0) > 0}
                        className="p-2.5 bg-white border border-red-100 rounded-full text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal for Create/Edit Role */}
      <Dialog open={showModal} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-3xl bg-[#FAFBFD] p-0 border-none overflow-hidden rounded-[2.5rem] shadow-2xl">
          <DialogHeader className="p-8 bg-white border-b border-chocolate/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-strawberry/5 rounded-full -mr-24 -mt-24 blur-3xl" />
            <div className="relative flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-chocolate text-white flex items-center justify-center shadow-bakery transform rotate-3 hover:rotate-0 transition-transform">
                <ShieldCheck size={24} />
              </div>
              <div>
                <DialogTitle className="text-3xl font-bold text-chocolate font-dancing">
                  {editingRole ? `Edit Role: ${editingRole.name}` : 'Create New Role'}
                </DialogTitle>
                <DialogDescription className="text-chocolate-light font-medium mt-1">
                  {editingRole ? 'Update the role details and permissions' : 'Define a new role with specific permissions'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form id="role-form" onSubmit={saveRole} className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar max-h-[65vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                {/* Role Name */}
                <div className="space-y-2 group">
                  <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Role Name</label>
                  <div className="relative">
                    <Sparkles size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
                    <input
                      required
                      id="roleName"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Manager"
                      disabled={submitting}
                      className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-medium placeholder:text-chocolate/10"
                    />
                  </div>
                </div>

                {/* Role Description */}
                <div className="space-y-2 group">
                  <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Description</label>
                  <div className="relative">
                    <Info size={18} className="absolute left-4 top-5 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
                    <textarea
                      id="roleDesc"
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description..."
                      rows={5}
                      disabled={submitting}
                      className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-medium placeholder:text-chocolate/10 resize-none leading-relaxed italic"
                    />
                  </div>
                </div>
              </div>

              {/* Permissions Selection */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <Lock size={12} />
                  Assign Permissions
                </label>

                {permissionsLoading ? (
                  <div className="text-center py-12 bg-white/40 rounded-2xl border border-dashed border-chocolate/10">
                    <RefreshCw size={24} className="animate-spin mx-auto text-chocolate/20 mb-2" />
                    <p className="text-xs text-chocolate/40 italic">Syncing with server...</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                    {permissionGroups.map((group) => (
                      <div key={group} className="space-y-2">
                        <button
                          type="button"
                          onClick={() => setExpandedGroup(expandedGroup === group ? null : group)}
                          className="flex items-center gap-2 w-full px-4 py-3 rounded-xl font-bold text-[10px] text-chocolate/70 bg-white border border-chocolate/5 hover:bg-strawberry/5 transition-all uppercase tracking-widest"
                        >
                          <ChevronRight
                            className={`w-3 h-3 transition-transform duration-300 ${expandedGroup === group ? 'rotate-90 text-strawberry' : ''
                              }`}
                          />
                          {group}
                          <span className="ml-auto bg-chocolate/5 px-2 py-0.5 rounded-full text-[8px]">
                            {groupedPermissions[group].length}
                          </span>
                        </button>

                        {expandedGroup === group && (
                          <div className="space-y-1.5 pl-4 animate-in slide-in-from-top-2 duration-300">
                            {groupedPermissions[group].map((perm) => (
                              <label
                                key={perm._id}
                                className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-white border border-transparent hover:border-chocolate/5 transition-all group"
                              >
                                <Checkbox
                                  checked={formData.permissions.includes(perm.url)}
                                  onCheckedChange={() => togglePermission(perm.url)}
                                  disabled={submitting}
                                  className="border-chocolate/20 data-[state=checked]:bg-strawberry data-[state=checked]:border-strawberry"
                                />
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-chocolate/80 group-hover:text-chocolate transition-colors">{perm.name}</span>
                                  <span className="text-[8px] text-chocolate/20 italic tracking-wider">{perm.url}</span>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {formData.permissions.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-strawberry/5 rounded-full border border-strawberry/10 w-fit">
                    <Sparkles size={10} className="text-strawberry" />
                    <span className="text-[9px] font-bold text-strawberry uppercase">
                      {formData.permissions.length} Authorized Actions
                    </span>
                  </div>
                )}
              </div>
            </div>
          </form>

          <DialogFooter className="p-8 bg-white border-t border-chocolate/5 flex flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={closeModal}
              disabled={submitting}
              className="px-8 py-3 rounded-full text-xs font-bold text-chocolate/60 bg-white border border-chocolate/10 hover:bg-chocolate/5 transition-all uppercase tracking-widest font-lora"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="role-form"
              disabled={submitting}
              className="px-10 py-4 bg-chocolate text-white rounded-full font-bold shadow-bakery hover:bg-strawberry transition-all disabled:opacity-50 flex items-center gap-3 uppercase tracking-widest"
            >
              {submitting ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {editingRole ? 'Update Role' : 'Create Role'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Roles;
