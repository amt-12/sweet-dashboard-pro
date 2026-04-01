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
} from 'lucide-react';
import { fetchWithAuth } from '@/services/auth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';

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
  const [showSheet, setShowSheet] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>('main');

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

  // Open sheet for creating new role
  const openNewRoleSheet = () => {
    setEditingRole(null);
    setFormData({ name: '', description: '', permissions: [] });
    setShowSheet(true);
  };

  // Open sheet for editing role
  const openEditRoleSheet = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions || [],
    });
    setShowSheet(true);
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
      const url = editingRole ? `/api/roles/${editingRole._id}` : '/api/roles';
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
      setShowSheet(false);
      setFormData({ name: '', description: '', permissions: [] });
      setEditingRole(null);
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
      const res = await fetchWithAuth(`/api/roles/${role._id}`, { method: 'DELETE' });

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

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-chocolate" />
          <div>
            <h1 className="text-3xl font-bold text-chocolate">Role Configuration</h1>
            <p className="text-sm text-gray-600">Manage roles and their permissions</p>
          </div>
        </div>
        <Button onClick={openNewRoleSheet} className="bg-strawberry hover:bg-strawberry/90">
          <Plus className="w-5 h-5 mr-2" />
          Create Role
        </Button>
      </div>

      {/* Roles List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-chocolate/50 mb-2" />
            <p className="text-gray-600">Loading roles...</p>
          </div>
        ) : roles.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
            <ShieldCheck className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-600 font-medium">No roles created yet</p>
            <p className="text-sm text-gray-500 mb-4">Create your first role to get started</p>
            <Button onClick={openNewRoleSheet} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create Role
            </Button>
          </div>
        ) : (
          roles.map((role) => (
            <div
              key={role._id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <RoleIcon roleType={role.name.toLowerCase()} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{role.name}</h3>
                      {role.isSystem && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                          System
                        </span>
                      )}
                    </div>
                    {role.description && (
                      <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                    )}
                    {role.usersCount !== undefined && (
                      <p className="text-xs text-gray-500 mt-2">
                        Assigned to {role.usersCount} user{role.usersCount !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => openEditRoleSheet(role)}
                    variant="ghost"
                    size="sm"
                    disabled={role.isSystem}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => deleteRole(role)}
                    variant="ghost"
                    size="sm"
                    disabled={role.isSystem || (role.usersCount || 0) > 0}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Permissions Preview */}
              {role.permissions && role.permissions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.slice(0, 5).map((permUrl) => {
                      const perm = permissions.find((p) => p.url === permUrl);
                      return (
                        <span
                          key={permUrl}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-chocolate/10 text-chocolate"
                        >
                          <Check className="w-3 h-3" />
                          {perm?.name || permUrl}
                        </span>
                      );
                    })}
                    {role.permissions.length > 5 && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-gray-600">
                        +{role.permissions.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Sheet for Create/Edit Role */}
      <Sheet open={showSheet} onOpenChange={setShowSheet}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingRole ? `Edit Role: ${editingRole.name}` : 'Create New Role'}
            </SheetTitle>
            <SheetDescription>
              {editingRole
                ? 'Update the role details and permissions'
                : 'Define a new role with specific permissions'}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={saveRole} className="space-y-6 py-6">
            {/* Role Name */}
            <div className="space-y-2">
              <Label htmlFor="roleName" className="text-sm font-medium">
                Role Name *
              </Label>
              <Input
                id="roleName"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Content Manager, Inventory Admin"
                disabled={submitting}
              />
            </div>

            {/* Role Description */}
            <div className="space-y-2">
              <Label htmlFor="roleDesc" className="text-sm font-medium">
                Description
              </Label>
              <textarea
                id="roleDesc"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Brief description of this role's purpose"
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-chocolate focus:border-transparent"
                disabled={submitting}
              />
            </div>

            {/* Permissions Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Assign Permissions
              </Label>

              {permissionsLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-chocolate/50" />
                </div>
              ) : permissions.length === 0 ? (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">No permissions available</p>
                      <p className="text-xs text-blue-700 mt-1">
                        No permissions have been configured yet. Create permissions in the Admins
                        section first.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
                  {permissionGroups.map((group) => (
                    <div key={group}>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedGroup(expandedGroup === group ? null : group)
                        }
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-md font-medium text-sm text-chocolate hover:bg-chocolate/10 transition-colors"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            expandedGroup === group ? 'rotate-180' : ''
                          }`}
                        />
                        {group.charAt(0).toUpperCase() + group.slice(1)}
                        <span className="ml-auto text-xs text-gray-600">
                          ({groupedPermissions[group].length})
                        </span>
                      </button>

                      {expandedGroup === group && (
                        <div className="space-y-2 pl-6 mt-2">
                          {groupedPermissions[group].map((perm) => (
                            <label
                              key={perm._id}
                              className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-white transition-colors"
                            >
                              <Checkbox
                                checked={formData.permissions.includes(perm.url)}
                                onCheckedChange={() => togglePermission(perm.url)}
                                disabled={submitting}
                              />
                              <span className="text-sm text-gray-700">{perm.name}</span>
                              <span className="ml-auto text-xs text-gray-500">{perm.url}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {formData.permissions.length > 0 && (
                <p className="text-xs text-gray-600">
                  {formData.permissions.length} permission{formData.permissions.length !== 1 ? 's' : ''}{' '}
                  selected
                </p>
              )}
            </div>

            {/* Form Actions */}
            <SheetFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSheet(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-chocolate hover:bg-chocolate/90">
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {editingRole ? 'Update Role' : 'Create Role'}
                  </>
                )}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Roles;
