import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Lock, Globe, Save, Store, Mail, Phone, MapPin, Clock, ShieldCheck, RefreshCw, AlertTriangle, Key } from "lucide-react";
import axiosInstance from "@/services/api";
import { getRole, login as authLogin } from "@/services/auth";
import { toast } from "sonner";

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    openingTime: "",
    closingTime: "",
    hours: "",
    currency: "CAD (CA$)",
    timezone: "(GMT-05:00) Eastern Time",
  });
  const [userRole, setUserRole] = useState<string | null>(null);

  const canEdit = userRole === 'superadmin';
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
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
        setProfile((p) => ({ ...p, ...data.profile }));
      } else {
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
      toast.error('Unable to load store profile.');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await axiosInstance.put('/store', profile);
      const data = res.data || {};
      setProfile((p) => ({ ...p, ...data.profile }));
      toast.success('Settings saved successfully!');
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 401) toast.error('Please log in as a manager.');
      else if (status === 403) toast.error('Only a manager can change these settings.');
      else toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const data = await authLogin(loginEmail, loginPassword);
      const role = data.role || getRole();
      setUserRole(role || null);
      toast.success('Manager access granted.');
      await fetchProfile();
    } catch (err: any) {
      toast.error(err.message || 'Access denied.');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 font-lora max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold font-dancing text-chocolate">Store Settings</h2>
          <p className="text-sm text-chocolate-light font-medium mt-1">
            Configure your bakery's profile and global preferences.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchProfile}
            className="p-3 bg-white border border-chocolate/10 rounded-full text-chocolate hover:bg-strawberry/5 transition-all shadow-sm group"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
          </button>
          <button 
            onClick={saveProfile}
            disabled={saving || !canEdit}
            className="px-8 py-3 bg-chocolate text-white rounded-full flex items-center gap-2 shadow-bakery hover:shadow-bakery-lg hover:bg-strawberry transition-all duration-300 disabled:opacity-50"
          >
            {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
            <span className="font-bold text-xs uppercase tracking-widest text-[#F5ECD7]">Save All</span>
          </button>
        </div>
      </div>

      {!canEdit && (
        <div className="bg-strawberry/5 border border-strawberry/20 rounded-[2rem] p-10 flex flex-col lg:flex-row items-center gap-10 shadow-bakery">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-strawberry text-white rounded-full text-[10px] font-bold uppercase tracking-widest">
              <ShieldCheck size={12} /> Restricted Access
            </div>
            <h3 className="text-3xl font-bold font-playfair text-chocolate">Manager Authentication</h3>
            <p className="text-sm text-chocolate-light font-medium italic leading-relaxed">
              To update the store profile, please authenticate with your manager credentials. Non-manager accounts can only view settings.
            </p>
          </div>
          <form onSubmit={handleLogin} className="w-full lg:w-96 space-y-4 bg-white/80 backdrop-blur-md p-8 rounded-[1.5rem] border border-chocolate/5 shadow-sm">
            <div className="space-y-2 group">
              <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-widest ml-1">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-all" />
                <input 
                  type="email"
                  value={loginEmail} 
                  onChange={(e) => setLoginEmail(e.target.value)} 
                  className="w-full pl-11 pr-4 py-3 bg-white border border-chocolate/10 rounded-xl text-sm outline-none focus:border-strawberry focus:ring-4 focus:ring-strawberry/5 transition-all" 
                  placeholder="manager@bakery.com"
                />
              </div>
            </div>
            <div className="space-y-2 group">
              <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-all" />
                <input 
                  type="password"
                  value={loginPassword} 
                  onChange={(e) => setLoginPassword(e.target.value)} 
                  className="w-full pl-11 pr-4 py-3 bg-white border border-chocolate/10 rounded-xl text-sm outline-none focus:border-strawberry focus:ring-4 focus:ring-strawberry/5 transition-all" 
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loginLoading}
              className="w-full py-4 bg-chocolate text-white rounded-xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-strawberry transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {loginLoading && <RefreshCw size={14} className="animate-spin" />}
              Grant Access
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Store Profile Section */}
        <div className="lg:col-span-8 bg-white/60 backdrop-blur-md p-10 rounded-[2.5rem] shadow-bakery border border-chocolate/5 space-y-8">
          <div className="flex items-center gap-4 border-b border-chocolate/5 pb-6">
            <div className="w-14 h-14 bg-chocolate rounded-2xl flex items-center justify-center text-[#F5ECD7] shadow-bakery transform rotate-3">
              <Store size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-bold font-playfair text-chocolate">Store Profile</h3>
              <p className="text-[10px] text-chocolate/40 font-bold uppercase tracking-widest">Public Branding & Identity</p>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-2 group">
              <Label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Bakery Name</Label>
              <div className="relative">
                <Store size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-all" />
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full pl-12 pr-6 py-6 bg-white border border-chocolate/10 rounded-2xl text-sm outline-none transition-all font-bold text-chocolate"
                  placeholder="The Grand Patisserie"
                  disabled={!canEdit}
                />
              </div>
            </div>
            <div className="space-y-2 group">
              <Label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Public Email</Label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-all" />
                <Input
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full pl-12 pr-6 py-6 bg-white border border-chocolate/10 rounded-2xl text-sm outline-none transition-all font-medium text-chocolate italic"
                  placeholder="hello@yourbakery.com"
                  disabled={!canEdit}
                />
              </div>
            </div>
            <div className="space-y-2 group">
              <Label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Phone Number</Label>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-all" />
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full pl-12 pr-6 py-6 bg-white border border-chocolate/10 rounded-2xl text-sm font-medium text-chocolate"
                  disabled={!canEdit}
                />
              </div>
            </div>
            <div className="space-y-2 group">
              <Label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Bakery Address</Label>
              <div className="relative">
                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-all" />
                <Input
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="w-full pl-12 pr-6 py-6 bg-white border border-chocolate/10 rounded-2xl text-sm font-medium text-chocolate"
                  disabled={!canEdit}
                />
              </div>
            </div>
            
            <div className="md:col-span-2 grid grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              <div className="space-y-2 group">
                <Label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Opens At</Label>
                <div className="relative">
                  <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20" />
                  <Input value={profile.openingTime} onChange={(e) => setProfile({ ...profile, openingTime: e.target.value })} placeholder="7:00 AM" disabled={!canEdit} className="w-full pl-11 py-5 bg-white border border-chocolate/10 rounded-xl text-xs font-bold" />
                </div>
              </div>
              <div className="space-y-2 group">
                <Label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Closes At</Label>
                <div className="relative">
                  <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20" />
                  <Input value={profile.closingTime} onChange={(e) => setProfile({ ...profile, closingTime: e.target.value })} placeholder="8:00 PM" disabled={!canEdit} className="w-full pl-11 py-5 bg-white border border-chocolate/10 rounded-xl text-xs font-bold" />
                </div>
              </div>
              <div className="space-y-2 group col-span-2 lg:col-span-1">
                <Label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Friendly Hours</Label>
                <Input value={profile.hours} onChange={(e) => setProfile({ ...profile, hours: e.target.value })} placeholder="Daily: 7am - 8pm" disabled={!canEdit} className="w-full py-5 bg-white border border-chocolate/10 rounded-xl text-xs" />
              </div>
            </div>
          </div>
        </div>

        {/* Side Panels */}
        <div className="lg:col-span-4 space-y-8">
          {/* Notifications Panel */}
          <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2rem] shadow-bakery border border-chocolate/5 space-y-6 group">
            <h3 className="text-xl font-bold font-playfair text-chocolate flex items-center gap-3">
              <Bell className="text-strawberry group-hover:rotate-12 transition-transform" size={24} />
              Alerts
            </h3>
            <Separator className="bg-chocolate/5" />
            <div className="space-y-6">
              <div className="flex items-center justify-between p-2">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold text-chocolate">New Orders</Label>
                  <p className="text-[10px] text-chocolate/30 italic">Instant push notifications</p>
                </div>
                <Switch defaultChecked className="data-[state=checked]:bg-chocolate" />
              </div>
              <div className="flex items-center justify-between p-2">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold text-chocolate">Inventory</Label>
                  <p className="text-[10px] text-chocolate/30 italic">Low stock warnings</p>
                </div>
                <Switch defaultChecked className="data-[state=checked]:bg-chocolate" />
              </div>
              <div className="flex items-center justify-between p-2 opacity-50 grayscale pointer-events-none">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold text-chocolate">Customer Reviews</Label>
                  <p className="text-[10px] text-chocolate/30 italic">Feedback alerts</p>
                </div>
                <Switch className="data-[state=checked]:bg-chocolate" />
              </div>
            </div>
          </div>

          {/* Region Panel */}
          <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2rem] shadow-bakery border border-chocolate/5 space-y-6">
            <h3 className="text-xl font-bold font-playfair text-chocolate flex items-center gap-3">
              <Globe className="text-strawberry" size={24} />
              Region
            </h3>
            <Separator className="bg-chocolate/5" />
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-widest ml-1">Store Currency</Label>
                <div className="p-4 bg-chocolate/5 border border-chocolate/5 rounded-xl text-xs font-bold text-chocolate/40 flex items-center justify-between italic">
                  {profile.currency}
                  <Lock size={12} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-widest ml-1">Store Timezone</Label>
                <div className="p-4 bg-chocolate/5 border border-chocolate/5 rounded-xl text-xs font-bold text-chocolate/40 flex items-center justify-between italic">
                  {profile.timezone}
                  <Lock size={12} />
                </div>
              </div>
            </div>
            <div className="p-4 bg-strawberry/5 border border-strawberry/20 rounded-xl flex items-center gap-3">
              <AlertTriangle size={16} className="text-strawberry/60" />
              <p className="text-[9px] font-bold text-chocolate/60 leading-tight uppercase tracking-widest">Contact support to change region settings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
