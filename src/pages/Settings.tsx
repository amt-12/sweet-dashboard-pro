import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Lock, Globe, Save } from "lucide-react";

const Settings = () => {
  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12 font-lora">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-playfair text-[#1A2744]">
            Settings{" "}
            <span className="inline-block animate-spin-slow">⚙️</span>
          </h2>
          <p className="text-[#8D6E63] mt-1">
            Manage your account settings and preferences.
          </p>
        </div>
        <Button className="bg-[#D4A373] hover:bg-[#c49265] text-white rounded-full px-6 font-bold shadow-md transition-all flex items-center gap-2">
          <Save size={18} /> Save All Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Section */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#D4A373]/20 col-span-1 md:col-span-2 hover:shadow-bakery-lg transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#F5ECD7] rounded-full text-[#D4A373]">
              <User size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold font-playfair text-[#1A2744]">
                Profile Information
              </h3>
              <p className="text-xs text-[#8D6E63]">
                Update your bakery's public details
              </p>
            </div>
          </div>
          <Separator className="mb-6 bg-[#D4A373]/20" />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-[#1A2744] font-bold"
              >
                Bakery Name
              </Label>
              <Input
                id="name"
                defaultValue="Sweet Bake"
                className="border-[#D4A373]/30 focus:border-[#D4A373] focus:ring-[#D4A373]/20 rounded-xl bg-[#F5ECD7]/10"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-[#1A2744] font-bold"
              >
                Email Address
              </Label>
              <Input
                id="email"
                defaultValue="admin@sweetbake.com"
                className="border-[#D4A373]/30 focus:border-[#D4A373] focus:ring-[#D4A373]/20 rounded-xl bg-[#F5ECD7]/10"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="text-[#1A2744] font-bold"
              >
                Phone Number
              </Label>
              <Input
                id="phone"
                defaultValue="+1 234 567 890"
                className="border-[#D4A373]/30 focus:border-[#D4A373] focus:ring-[#D4A373]/20 rounded-xl bg-[#F5ECD7]/10"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="address"
                className="text-[#1A2744] font-bold"
              >
                Address
              </Label>
              <Input
                id="address"
                defaultValue="123 Baker Street, London"
                className="border-[#D4A373]/30 focus:border-[#D4A373] focus:ring-[#D4A373]/20 rounded-xl bg-[#F5ECD7]/10"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#D4A373]/20 hover:shadow-bakery-lg transition-shadow h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#F5ECD7] rounded-full text-[#D4A373]">
              <Bell size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold font-playfair text-[#1A2744]">
                Notifications
              </h3>
              <p className="text-xs text-[#8D6E63]">
                Choose what you want to hear about
              </p>
            </div>
          </div>
          <Separator className="mb-6 bg-[#D4A373]/20" />
          <div className="space-y-6">
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F5ECD7]/20 transition-colors">
              <div className="space-y-0.5">
                <Label className="text-base font-bold text-[#1A2744]">
                  Order Alerts
                </Label>
                <p className="text-xs text-[#8D6E63]">
                  Receive notifications for new orders.
                </p>
              </div>
              <Switch
                defaultChecked
                className="data-[state=checked]:bg-[#D4A373]"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F5ECD7]/20 transition-colors">
              <div className="space-y-0.5">
                <Label className="text-base font-bold text-[#1A2744]">
                  Low Stock Alerts
                </Label>
                <p className="text-xs text-[#8D6E63]">
                  Get notified when ingredients are running low.
                </p>
              </div>
              <Switch
                defaultChecked
                className="data-[state=checked]:bg-[#D4A373]"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F5ECD7]/20 transition-colors">
              <div className="space-y-0.5">
                <Label className="text-base font-bold text-[#1A2744]">
                  Promotional Emails
                </Label>
                <p className="text-xs text-[#8D6E63]">
                  Receive emails about new features and offers.
                </p>
              </div>
              <Switch className="data-[state=checked]:bg-[#D4A373]" />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#D4A373]/20 hover:shadow-bakery-lg transition-shadow h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#F5ECD7] rounded-full text-[#D4A373]">
              <Lock size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold font-playfair text-[#1A2744]">
                Security
              </h3>
              <p className="text-xs text-[#8D6E63]">Keep your account safe</p>
            </div>
          </div>
          <Separator className="mb-6 bg-[#D4A373]/20" />
          <div className="space-y-6">
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F5ECD7]/20 transition-colors border border-transparent hover:border-[#D4A373]/10">
              <span className="text-sm font-bold text-[#1A2744]">
                Two-Factor Authentication
              </span>
              <Button
                variant="outline"
                size="sm"
                className="border-[#D4A373] text-[#D4A373] hover:bg-[#D4A373] hover:text-white rounded-full"
              >
                Enable
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F5ECD7]/20 transition-colors border border-transparent hover:border-[#D4A373]/10">
              <span className="text-sm font-bold text-[#1A2744]">
                Change Password
              </span>
              <Button
                variant="outline"
                size="sm"
                className="border-[#D4A373] text-[#D4A373] hover:bg-[#D4A373] hover:text-white rounded-full"
              >
                Update
              </Button>
            </div>
            <div className="bg-[#F5ECD7]/30 p-4 rounded-xl text-xs text-[#8D6E63] border border-[#D4A373]/10 mt-4">
              Last login: Today at 9:42 AM from Windows PC
            </div>
          </div>
        </div>

        {/* Regional */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#D4A373]/20 col-span-1 md:col-span-2 hover:shadow-bakery-lg transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#F5ECD7] rounded-full text-[#D4A373]">
              <Globe size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold font-playfair text-[#1A2744]">
                Regional Settings
              </h3>
              <p className="text-xs text-[#8D6E63]">
                Configure your regional preferences
              </p>
            </div>
          </div>
          <Separator className="mb-6 bg-[#D4A373]/20" />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="currency"
                className="text-[#1A2744] font-bold"
              >
                Currency
              </Label>
              <Input
                id="currency"
                defaultValue="USD ($)"
                disabled
                className="bg-[#F5ECD7]/10 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="timezone"
                className="text-[#1A2744] font-bold"
              >
                Timezone
              </Label>
              <Input
                id="timezone"
                defaultValue="(GMT-05:00) Eastern Time"
                disabled
                className="bg-[#F5ECD7]/10 cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
