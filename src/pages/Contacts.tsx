import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import axiosInstance from '@/services/api';
import { Trash2, Check, Mail, Phone, Calendar, User, MessageSquare, RefreshCw, Send, CheckCircle2, Trash, Info, Sparkles, Clock, Hash } from 'lucide-react';
import { toast } from 'sonner';

type Contact = {
  _id: string;
  name: string;
  phone?: string;
  subject?: string;
  message: string;
  read?: boolean;
  createdAt: string;
};

const Contacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const contactsApi = (api && (api as any).contacts) ? (api as any).contacts : {
        list: async () => (await axiosInstance.get('/contacts')).data,
      };
      const res: any = await contactsApi.list();
      const raw = (res && res.contacts) || res || [];
      // Normalize data if necessary
      setContacts(Array.isArray(raw) ? raw : []);
    } catch (err: any) {
      toast.error('Failed to load inquiries');
      setError('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchContacts(); 
  }, []);

  const markRead = async (id: string) => {
    try {
      const contactsApi = (api && (api as any).contacts) ? (api as any).contacts : {
        markRead: async (id: string) => (await axiosInstance.post(`/contacts/${id}/read`)).data,
      };
      await contactsApi.markRead(id);
      setContacts((c) => c.map((it) => it._id === id ? { ...it, read: true } : it));
      toast.success('Inquiry marked as read');
    } catch (err: any) {
      toast.error('Unable to update inquiry status');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Remove this inquiry permanently?')) return;
    setDeletingId(id);
    try {
      const contactsApi = (api && (api as any).contacts) ? (api as any).contacts : {
        delete: async (id: string) => (await axiosInstance.delete(`/contacts/${id}`)).data,
      };
      await contactsApi.delete(id);
      setContacts((c) => c.filter((it) => it._id !== id));
      toast.success('Inquiry removed.');
    } catch (err: any) {
      toast.error('Failed to remove inquiry');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 font-lora pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold font-dancing text-chocolate">Inquiries</h2>
          <p className="text-sm text-chocolate-light font-medium mt-1">
            Review and manage messages from your patrons and potential clients.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchContacts}
            className="p-3 bg-white border border-chocolate/10 rounded-full text-chocolate hover:bg-strawberry/5 transition-all shadow-sm group"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2rem] shadow-bakery border border-chocolate/5 flex items-center justify-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-chocolate text-white flex items-center justify-center shadow-bakery transform rotate-3">
            <MessageSquare size={32} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-chocolate/40 uppercase tracking-widest mb-1 ml-1">Total Messages</p>
            <h3 className="text-3xl font-bold font-playfair text-chocolate">{contacts.length}</h3>
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2rem] shadow-bakery border border-chocolate/5 flex items-center justify-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-strawberry text-white flex items-center justify-center shadow-bakery transform -rotate-3">
            <Mail size={32} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-chocolate/40 uppercase tracking-widest mb-1 ml-1">Unread</p>
            <h3 className="text-3xl font-bold font-playfair text-chocolate">{contacts.filter(c => !c.read).length}</h3>
          </div>
        </div>
        <div className="bg-[#FAF6E6]/60 backdrop-blur-md p-8 rounded-[2rem] border border-chocolate/5 flex items-center">
            <p className="text-sm text-chocolate-light font-medium italic leading-relaxed">
              "Your most unhappy customers are your greatest source of learning." — Manage all feedback with grace.
            </p>
        </div>
      </div>

      {loading && (
        <div className="py-24 text-center">
          <RefreshCw className="w-10 h-10 text-chocolate/20 animate-spin mx-auto" />
          <p className="text-chocolate-light mt-4 font-medium italic">Gathering your messages...</p>
        </div>
      )}

      {!loading && contacts.length === 0 && (
        <div className="bg-white/80 backdrop-blur-lg rounded-[2.5rem] p-24 text-center border border-chocolate/5 shadow-bakery">
          <div className="w-24 h-24 bg-chocolate/5 rounded-full flex items-center justify-center mx-auto text-chocolate/10 mb-8">
            <Hash size={48} />
          </div>
          <h3 className="text-2xl font-bold font-playfair text-chocolate">The showroom is quiet.</h3>
          <p className="text-chocolate-light font-medium italic mt-2">No inquiries have been received yet.</p>
        </div>
      )}

      <div className="grid gap-8">
        {contacts.map((c) => (
          <div 
            key={c._id} 
            className={`group relative bg-white rounded-[2.5rem] p-10 border shadow-bakery hover:shadow-bakery-lg transition-all duration-500 overflow-hidden ${c.read ? 'border-chocolate/5 opacity-80 scale-[0.98]' : 'border-strawberry/20 border-l-8 border-l-strawberry shadow-lg scale-100'}`}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-strawberry/5 rounded-full -mr-32 -mt-32 blur-3xl transition-all group-hover:bg-strawberry/10" />
            
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-8">
              <div className="flex-1 space-y-6">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-chocolate text-white flex items-center justify-center font-dancing font-bold text-2xl shadow-bakery transform rotate-3">
                        {c.name.charAt(0)}
                    </div>
                    <div>
                        <h4 className="text-2xl font-bold font-playfair text-chocolate flex items-center gap-2 group-hover:text-strawberry transition-colors">
                            {c.name}
                            {!c.read && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-strawberry text-white rounded-full text-[9px] font-bold uppercase tracking-widest shadow-sm">
                                    <Sparkles size={10} /> New Inquiry
                                </span>
                            )}
                        </h4>
                        <div className="flex items-center gap-6 mt-1">
                            <span className="text-[10px] font-bold text-chocolate-light uppercase tracking-widest flex items-center gap-1.5 italic">
                                <Hash size={12} className="text-chocolate/20" />
                                {c.phone || "No phone provided"}
                            </span>
                            <span className="text-[10px] font-bold text-chocolate-light uppercase tracking-widest flex items-center gap-1.5 italic">
                                <Clock size={12} className="text-chocolate/20" />
                                {new Date(c.createdAt).toLocaleDateString('en-US', { hour: 'numeric', minute: '2-digit', month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-chocolate/5 rounded-xl text-chocolate text-[11px] font-bold uppercase tracking-widest border border-chocolate/5 italic">
                        Subject: {c.subject || "No Subject"}
                    </div>
                    <div className="p-8 bg-[#FAF6E6]/40 rounded-[2rem] border border-chocolate/5 text-chocolate italic leading-relaxed text-base shadow-inner whitespace-pre-line">
                        "{c.message}"
                    </div>
                </div>
              </div>

              <div className="flex lg:flex-col gap-3 shrink-0 pt-2 relative z-20">
                {!c.read && (
                    <button 
                        onClick={() => markRead(c._id)} 
                        className="flex-1 lg:w-48 py-4 px-6 bg-chocolate text-white rounded-full flex items-center justify-center gap-3 font-bold text-[10px] uppercase tracking-[0.2em] shadow-bakery hover:bg-strawberry transition-all"
                    >
                        <CheckCircle2 size={16} />
                        Mark as Read
                    </button>
                )}
                <button 
                    onClick={() => remove(c._id)} 
                    disabled={deletingId === c._id}
                    className="flex-1 lg:w-48 py-4 px-6 bg-white border border-red-100 text-red-500 rounded-full flex items-center justify-center gap-3 font-bold text-[10px] uppercase tracking-[0.2em] shadow-sm hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                >
                    <Trash2 size={16} />
                    {deletingId === c._id ? "Removing..." : "Delete Inquiry"}
                </button>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-chocolate/5 flex items-center gap-3 relative z-10">
                <Info size={14} className="text-chocolate/20" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-chocolate/20 italic">
                    ID Ref: {c._id.slice(-12).toUpperCase()}
                </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Contacts;
