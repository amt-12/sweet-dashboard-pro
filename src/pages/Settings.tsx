import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Lock, Globe } from "lucide-react";

const Settings = () => {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-10">
      <div>
        <h2 className="text-2xl font-bold font-dancing text-foreground">Settings ⚙️</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>
      
      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-card p-6 rounded-bakery shadow-sm border border-border">
            <div className="flex items-center gap-2 mb-4">
                <User className="text-chocolate" />
                <h3 className="text-lg font-semibold">Profile Information</h3>
            </div>
            <Separator className="mb-4" />
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="name">Bakery Name</Label>
                    <Input id="name" defaultValue="Sweet Bake" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" defaultValue="admin@sweetbake.com" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" defaultValue="+1 234 567 890" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" defaultValue="123 Baker Street, London" />
                </div>
            </div>
            <div className="mt-4 flex justify-end">
                <Button className="bg-chocolate hover:bg-chocolate-light">Save Changes</Button>
            </div>
        </div>

        {/* Notifications */}
        <div className="bg-card p-6 rounded-bakery shadow-sm border border-border">
            <div className="flex items-center gap-2 mb-4">
                <Bell className="text-chocolate" />
                <h3 className="text-lg font-semibold">Notifications</h3>
            </div>
             <Separator className="mb-4" />
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-base">Order Alerts</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications for new orders.</p>
                    </div>
                    <Switch defaultChecked />
                </div>
                 <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-base">Low Stock Alerts</Label>
                        <p className="text-sm text-muted-foreground">Get notified when ingredients are running low.</p>
                    </div>
                    <Switch defaultChecked />
                </div>
                 <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-base">Promotional Emails</Label>
                        <p className="text-sm text-muted-foreground">Receive emails about new features and offers.</p>
                    </div>
                    <Switch />
                </div>
             </div>
        </div>

        {/* Security */}
        <div className="bg-card p-6 rounded-bakery shadow-sm border border-border">
            <div className="flex items-center gap-2 mb-4">
                <Lock className="text-chocolate" />
                <h3 className="text-lg font-semibold">Security</h3>
            </div>
            <Separator className="mb-4" />
            <div className="space-y-4">
                 <div className="flex items-center justify-between">
                     <span className="text-sm">Two-Factor Authentication</span>
                     <Button variant="outline" size="sm">Enable</Button>
                 </div>
                 <div className="flex items-center justify-between">
                     <span className="text-sm">Change Password</span>
                     <Button variant="outline" size="sm">Update</Button>
                 </div>
            </div>
        </div>

          {/* Regional */}
        <div className="bg-card p-6 rounded-bakery shadow-sm border border-border">
            <div className="flex items-center gap-2 mb-4">
                <Globe className="text-chocolate" />
                <h3 className="text-lg font-semibold">Regional Settings</h3>
            </div>
            <Separator className="mb-4" />
             <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Input id="currency" defaultValue="USD ($)" disabled />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input id="timezone" defaultValue="(GMT-05:00) Eastern Time" disabled />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
