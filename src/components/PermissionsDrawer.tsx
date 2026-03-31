import React, { useEffect, useMemo, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { RefreshCw, Lock } from 'lucide-react';
import { ALL_FEATURES, FEATURE_GROUPS } from '@/utils/menuConfig';

interface PermissionsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (permissions: string[]) => Promise<void>;
  currentPermissions?: string[];
  memberName?: string;
}

export const PermissionsDrawer: React.FC<PermissionsDrawerProps> = ({
  open,
  onOpenChange,
  onSave,
  currentPermissions = [],
  memberName = 'Team Member',
}) => {
  const [permissions, setPermissions] = useState<string[]>(currentPermissions);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPermissions(currentPermissions);
  }, [currentPermissions, open]);

  const groupedFeatures = useMemo(
    () => [
      { label: 'Main Features', items: FEATURE_GROUPS.main },
      { label: 'Product Details', items: FEATURE_GROUPS.productDetails },
      { label: 'About Pages', items: FEATURE_GROUPS.about },
    ],
    []
  );

  const handleToggle = (feature: string) => {
    setPermissions((prev) =>
      prev.includes(feature)
        ? prev.filter((p) => p !== feature)
        : [...prev, feature]
    );
  };

  const handleSelectAll = () => {
    setPermissions(ALL_FEATURES);
  };

  const handleDeselectAll = () => {
    setPermissions([]);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(permissions);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col h-full bg-[#FAFBFD] p-0 border-l border-chocolate/10 w-full max-w-lg">
        <SheetHeader className="p-10 bg-white border-b border-chocolate/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-strawberry/5 rounded-full -mr-24 -mt-24 blur-3xl" />
          <div className="relative flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-chocolate text-white flex items-center justify-center shadow-bakery transform -rotate-3">
              <Lock size={28} />
            </div>
            <div>
              <SheetTitle className="text-4xl font-bold text-chocolate font-dancing">
                Permissions
              </SheetTitle>
              <SheetDescription className="text-chocolate-light font-medium italic">
                Assign dashboard access for {memberName}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-10 space-y-8">
          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={handleSelectAll}
                className="flex-1 px-4 py-3 bg-chocolate text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-strawberry transition-all shadow-sm"
              >
                Select All
              </button>
              <button
                onClick={handleDeselectAll}
                className="flex-1 px-4 py-3 bg-white text-chocolate border border-chocolate/10 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-chocolate/5 transition-all"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {groupedFeatures.map((group) => (
              <div key={group.label}>
                <h4 className="text-[10px] font-bold text-chocolate/40 uppercase tracking-widest mb-4">{group.label}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.items.map((feature) => (
                    <label
                      key={feature}
                      className="flex items-center gap-3 p-4 bg-white border border-chocolate/5 rounded-2xl hover:border-strawberry/30 cursor-pointer transition-all group"
                    >
                      <Checkbox
                        checked={permissions.includes(feature)}
                        onCheckedChange={() => handleToggle(feature)}
                        className="w-5 h-5 border-chocolate/20 accent-chocolate"
                      />
                      <span className="text-sm font-medium text-chocolate group-hover:text-strawberry transition-colors">
                        {feature}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="p-6 bg-chocolate/5 rounded-2xl border border-chocolate/10">
              <p className="text-xs font-medium text-chocolate-light italic">
                {permissions.length === 0
                  ? 'No permissions selected. This member will have no access to the dashboard.'
                  : permissions.length === ALL_FEATURES.length
                  ? 'Full access granted. This member can access all features.'
                  : `${permissions.length} permission${permissions.length !== 1 ? 's' : ''} selected for this member.`}
              </p>
            </div>
          </div>
        </div>

        <SheetFooter className="p-10 bg-white border-t border-chocolate/5 flex flex-row justify-between items-center gap-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-8 py-3 rounded-full text-xs font-bold text-chocolate bg-white border border-chocolate/10 hover:bg-chocolate/5 transition-all uppercase tracking-widest"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-10 py-4 bg-chocolate text-white rounded-full font-bold shadow-bakery hover:bg-strawberry transition-all disabled:opacity-50 flex items-center gap-3 uppercase tracking-widest text-xs"
          >
            {loading && <RefreshCw size={16} className="animate-spin" />}
            {loading ? 'Saving...' : 'Save Permissions'}
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
