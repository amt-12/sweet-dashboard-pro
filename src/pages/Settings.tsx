import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Lock, Globe, Save } from "lucide-react";
import axiosInstance from "@/services/api";
import { getRole, login as authLogin } from "@/services/auth";

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  // keep currency/timezone defaults but do not seed any contact dummy data
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    openingTime: "",
    closingTime: "",
    hours: "",
    currency: "USD ($)",
    timezone: "(GMT-05:00) Eastern Time",
  });
  const [userRole, setUserRole] = useState(null);

  const canEdit = userRole === 'superadmin';
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
    // determine role from auth service/localStorage
    try {
      const role = getRole();
      setUserRole(role || null);
    } catch (err) {
      console.warn("Unable to get role", err);
    }
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/store');
      const data = res.data || {};
      if (data.profile) {
        // merge returned profile (may contain openingTime/closingTime/hours)
        setProfile((p) => ({ ...p, ...data.profile }));
      } else {
        // no profile on backend -- clear contact fields but keep regional defaults
        setProfile((p) => ({
          ...p,
          name: '',
          email: '',
          phone: '',
          address: '',
          openingTime: '',
          closingTime: '',
          hours: '',
        }));
      }
    } catch (err) {
      console.error(err);
      alert('Unable to load store profile. Check backend.');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      // axiosInstance injects token from auth.getToken via interceptor
      const res = await axiosInstance.put('/store', profile);
      const data = res.data || {};
      setProfile((p) => ({ ...p, ...data.profile }));
      alert('Profile saved successfully.');
    } catch (err: unknown) {
      console.error(err);
      let status: number | undefined;
      if (typeof err === 'object' && err !== null) {
        const maybe = err as { response?: { status?: number } };
        status = maybe.response?.status;
      }
      if (status === 401) alert('Not authenticated. Please log in.');
      else if (status === 403) alert('Forbidden: only a superadmin can update the store profile.');
      else alert('Failed to save profile. Ensure backend is reachable and you have superadmin rights.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogin = async () => {
    setLoginLoading(true);
    try {
      const data = await authLogin(loginEmail, loginPassword);
      // authLogin stores token and role in localStorage via service
      const role = data.role || getRole();
      setUserRole(role || null);
      alert('Logged in successfully');
      // refetch profile now that token is available
      await fetchProfile();
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Login failed';
      alert(message);
    } finally {
      setLoginLoading(false);
    }
  };

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
        <div className="flex flex-col items-end gap-2">
          <Button
            onClick={saveProfile}
            disabled={saving || !canEdit}
            className="bg-[#D4A373] hover:bg-[#c49265] text-white rounded-full px-6 font-bold shadow-md transition-all flex items-center gap-2"
          >
            <Save size={18} /> {saving ? "Saving..." : "Save All Changes"}
          </Button>
          {!canEdit && (
            <div className="text-xs text-[#8D6E63]">Only a superadmin can update the store profile. Log in with a superadmin account.</div>
          )}
        </div>
      </div>

      {/* Login box for superadmin (visible if not superadmin) */}
      {!canEdit && (
        <div className="bg-white p-4 rounded-md shadow-sm border border-[#E5E7EB] max-w-md mx-auto">
          <h4 className="font-bold mb-2">Superadmin Login</h4>
          <div className="grid gap-2">
            <Input placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
            <Input placeholder="Password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
            <div className="flex items-center justify-end">
              <Button onClick={handleLogin} disabled={loginLoading || !loginEmail || !loginPassword}>
                {loginLoading ? 'Logging in...' : 'Login as Superadmin'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {!canEdit && (
        <div className="rounded-md p-3 bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">
          You can view store profile but only a superadmin may edit it. Authenticate as a superadmin to enable editing.
        </div>
      )}

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
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className={`border-[#D4A373]/30 focus:border-[#D4A373] focus:ring-[#D4A373]/20 rounded-xl bg-[#F5ECD7]/10 ${!canEdit ? 'opacity-70 cursor-not-allowed' : ''}`}
                placeholder={loading ? "Loading..." : "Your bakery name"}
                disabled={!canEdit}
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
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className={`border-[#D4A373]/30 focus:border-[#D4A373] focus:ring-[#D4A373]/20 rounded-xl bg-[#F5ECD7]/10 ${!canEdit ? 'opacity-70 cursor-not-allowed' : ''}`}
                placeholder="admin@yourbakery.com"
                disabled={!canEdit}
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
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className={`border-[#D4A373]/30 focus:border-[#D4A373] focus:ring-[#D4A373]/20 rounded-xl bg-[#F5ECD7]/10 ${!canEdit ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={!canEdit}
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
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className={`border-[#D4A373]/30 focus:border-[#D4A373] focus:ring-[#D4A373]/20 rounded-xl bg-[#F5ECD7]/10 ${!canEdit ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={!canEdit}
              />
            </div>
            {/* Opening/Closing times and hours */}
            <div className="space-y-2">
              <Label htmlFor="openingTime" className="text-[#1A2744] font-bold">Opening Time</Label>
              <Input id="openingTime" value={profile.openingTime} onChange={(e) => setProfile({ ...profile, openingTime: e.target.value })} placeholder="e.g. 7:00 AM" disabled={!canEdit} className={`border-[#D4A373]/30 focus:border-[#D4A373] focus:ring-[#D4A373]/20 rounded-xl bg-[#F5ECD7]/10 ${!canEdit ? 'opacity-70 cursor-not-allowed' : ''}`} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="closingTime" className="text-[#1A2744] font-bold">Closing Time</Label>
              <Input id="closingTime" value={profile.closingTime} onChange={(e) => setProfile({ ...profile, closingTime: e.target.value })} placeholder="e.g. 8:00 PM" disabled={!canEdit} className={`border-[#D4A373]/30 focus:border-[#D4A373] focus:ring-[#D4A373]/20 rounded-xl bg-[#F5ECD7]/10 ${!canEdit ? 'opacity-70 cursor-not-allowed' : ''}`} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="hours" className="text-[#1A2744] font-bold">Opening Hours (friendly)</Label>
              <Input id="hours" value={profile.hours} onChange={(e) => setProfile({ ...profile, hours: e.target.value })} placeholder={"Mon – Sat: 7 AM – 8 PM; Sun: 8 AM – 5 PM"} disabled={!canEdit} className={`border-[#D4A373]/30 focus:border-[#D4A373] focus:ring-[#D4A373]/20 rounded-xl bg-[#F5ECD7]/10 ${!canEdit ? 'opacity-70 cursor-not-allowed' : ''}`} />
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
              <Switch defaultChecked className="data-[state=checked]:bg-[#D4A373]" />
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
              <Switch defaultChecked className="data-[state=checked]:bg-[#D4A373]" />
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
                value={profile.currency}
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
                value={profile.timezone}
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
