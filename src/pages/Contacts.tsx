import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import axiosInstance from '@/services/api';
import { Trash2, Check, Mail, Phone, Calendar, User, MessageSquare, RefreshCw, Send, CheckCircle2, Trash, Info, Sparkles, Clock, Hash, ArrowLeft, Search, LayoutGrid, List, Eye, MousePointer2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from 'react-router-dom';

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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const navigate = useNavigate();

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const contactsApi = (api && (api as any).contacts) ? (api as any).contacts : {
        list: async () => (await axiosInstance.get('/contacts')).data,
      };
      const res: any = await contactsApi.list();
      const raw = (res && res.contacts) || res || [];
      setContacts(Array.isArray(raw) ? raw : []);
    } catch (err: any) {
      toast.error('Failed to load patron enquiries');
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
      toast.success('Enquiry acknowledged.');
    } catch (err: any) {
      toast.error('Unable to update enquiry status');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Permanently dismiss this enquiry from the archives?')) return;
    setDeletingId(id);
    try {
      const contactsApi = (api && (api as any).contacts) ? (api as any).contacts : {
        delete: async (id: string) => (await axiosInstance.delete(`/contacts/${id}`)).data,
      };
      await contactsApi.delete(id);
      setContacts((c) => c.filter((it) => it._id !== id));
      toast.success('Enquiry dismissed.');
    } catch (err: any) {
      toast.error('Failed to dismiss enquiry');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredContacts = React.useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(c => {
      return (
        (c.name || '').toLowerCase().includes(q) ||
        (c.subject || '').toLowerCase().includes(q) ||
        (c.message || '').toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q) ||
        (c.createdAt || '').toLowerCase().includes(q)
      );
    });
  }, [contacts, searchQuery]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 font-lora max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div>
          <h2 className="text-4xl font-bold font-dancing text-chocolate">Patron Enquiries</h2>
          <p className="text-sm text-chocolate-light font-medium mt-1">
            Review and preserve the thoughts of those who admire your creations.
          </p>
        </div>
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin')} className="p-3 bg-white border border-chocolate/5 rounded-full text-chocolate hover:bg-strawberry/5 transition-all shadow-sm group hidden md:flex">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="flex bg-white rounded-full p-1 border border-chocolate/5 shadow-sm">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-chocolate text-white shadow-md' : 'text-chocolate hover:bg-strawberry/5'}`} title="Patron Narrative"><LayoutGrid size={18} /></button>
                <button onClick={() => setViewMode('table')} className={`p-2 rounded-full transition-all ${viewMode === 'table' ? 'bg-chocolate text-white shadow-md' : 'text-chocolate hover:bg-strawberry/5'}`} title="Enquiry Registry"><List size={18} /></button>
            </div>
          <button onClick={fetchContacts} className="p-3 bg-white border border-chocolate/5 rounded-full text-chocolate hover:bg-strawberry/5 transition-all shadow-sm group">
            <RefreshCw size={18} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] shadow-bakery border border-chocolate/5 flex items-center justify-center gap-6 group hover:translate-y-[-4px] transition-all duration-500">
           <div className="w-16 h-16 rounded-2xl bg-chocolate text-white flex items-center justify-center shadow-bakery transform -rotate-3 group-hover:rotate-0 transition-transform">
             <MessageSquare size={30} />
           </div>
           <div>
             <p className="text-[9px] font-bold text-chocolate/40 uppercase tracking-widest mb-1 italic">Total Enquiries</p>
             <h3 className="text-3xl font-bold font-playfair text-chocolate">{contacts.length}</h3>
           </div>
        </div>
        <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] shadow-bakery border border-chocolate/5 flex items-center justify-center gap-6 group hover:translate-y-[-4px] transition-all duration-500">
           <div className="w-16 h-16 rounded-2xl bg-strawberry text-white flex items-center justify-center shadow-bakery transform rotate-3 group-hover:rotate-0 transition-transform">
             <Mail size={30} />
           </div>
           <div>
             <p className="text-[9px] font-bold text-chocolate/40 uppercase tracking-widest mb-1 italic">Awaited Response</p>
             <h3 className="text-3xl font-bold font-playfair text-chocolate">{contacts.filter(c => !c.read).length}</h3>
           </div>
        </div>
        <div className="bg-cream/40 border border-chocolate/5 rounded-[2.5rem] p-8 flex items-center relative overflow-hidden group shadow-inner">
            <p className="text-sm text-chocolate-light font-medium italic leading-relaxed z-10">
              "A patron's word is the truest reflection of our art." Respond with grace to every seeker of sweetness.
            </p>
            <Sparkles className="absolute -bottom-6 -right-6 text-chocolate/5 w-24 h-24 transform rotate-12 transition-transform group-hover:scale-110" />
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-[2.5rem] shadow-bakery border border-chocolate/5 mx-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-chocolate/30 group-focus-within:text-strawberry transition-colors w-5 h-5" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search patron archives..." className="w-full pl-14 pr-6 py-4 rounded-2xl bg-[#FAF6E6]/50 text-chocolate outline-none border border-transparent focus:border-strawberry/20 focus:bg-white focus:ring-8 focus:ring-strawberry/5 transition-all font-medium placeholder:text-chocolate/20 italic" />
        </div>
        <button type="button" onClick={() => setSearchQuery('')} title="Clear search" className="px-4 py-3 bg-white border border-chocolate/5 rounded-2xl text-chocolate hover:bg-strawberry/5 transition-all shadow-sm">Clear</button>
      </div>

      {loading && contacts.length === 0 ? (
        <div className="bg-white/50 backdrop-blur-sm rounded-[3rem] border border-chocolate/5 shadow-bakery p-32 flex flex-col items-center justify-center gap-6 animate-pulse">
          <div className="w-16 h-16 border-4 border-chocolate/10 border-t-strawberry rounded-full animate-spin" />
          <p className="text-chocolate-light font-bold uppercase tracking-widest text-xs italic">Consulting the archives...</p>
        </div>
      ) : (
        <>
            {viewMode === 'table' ? (
                <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] shadow-bakery border border-chocolate/5 overflow-hidden mx-4">
                    <Table>
                        <TableHeader>
                        <TableRow className="border-chocolate/5 hover:bg-transparent">
                            <TableHead className="w-20 pl-8 h-16 font-bold text-chocolate italic uppercase tracking-widest text-[10px]">Steward</TableHead>
                            <TableHead className="h-16 font-bold text-chocolate/80 uppercase tracking-widest text-[10px]">Patron & Identity</TableHead>
                            <TableHead className="h-16 font-bold text-chocolate/80 uppercase tracking-widest text-[10px] hidden md:table-cell">Subject Realm</TableHead>
                            <TableHead className="h-16 font-bold text-chocolate/80 uppercase tracking-widest text-[10px] hidden lg:table-cell">Received</TableHead>
                            <TableHead className="h-16 font-bold text-chocolate/80 uppercase tracking-widest text-[10px] hidden lg:table-cell text-center">Status</TableHead>
                            <TableHead className="h-16 font-bold text-chocolate italic uppercase tracking-widest text-[10px] text-right pr-8">Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {filteredContacts.map((c) => (
                            <TableRow key={c._id} className={`group border-chocolate/5 hover:bg-strawberry/[0.02] transition-colors duration-500 ${!c.read ? 'bg-strawberry/[0.01]' : 'opacity-70'}`}>
                            <TableCell className="py-6 pl-8">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-dancing font-bold text-xl shadow-bakery transform rotate-3 transition-transform group-hover:rotate-0 ${!c.read ? 'bg-chocolate text-white' : 'bg-cream text-chocolate/40'}`}>
                                    {c.name.charAt(0)}
                                </div>
                            </TableCell>
                            <TableCell className="py-6">
                                <div>
                                    <span className="font-bold text-chocolate text-lg tracking-tight group-hover:text-strawberry transition-colors block italic">{c.name}</span>
                                    <p className="text-[10px] text-chocolate-light/60 font-medium italic line-clamp-1 mt-0.5">{c.phone || "No contact digits provided"}</p>
                                </div>
                            </TableCell>
                            <TableCell className="py-6 hidden md:table-cell">
                                <span className="px-3 py-1 bg-cream/50 rounded-full text-[9px] font-bold text-chocolate uppercase tracking-widest border border-chocolate/5 italic">
                                    {c.subject || "Pure Inquiry"}
                                </span>
                            </TableCell>
                            <TableCell className="py-6 hidden lg:table-cell">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-chocolate-light italic">{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                    <span className="text-[9px] font-bold text-chocolate/20 uppercase italic">{new Date(c.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </TableCell>
                            <TableCell className="py-6 hidden lg:table-cell text-center">
                                {!c.read ? (
                                    <div className="flex items-center justify-center gap-1.5 text-strawberry animate-pulse">
                                        <Sparkles size={10} />
                                        <span className="text-[8px] font-black uppercase tracking-widest">Awaited</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-1.5 text-chocolate/20">
                                        <Check size={10} />
                                        <span className="text-[8px] font-bold uppercase tracking-widest italic">Archived</span>
                                    </div>
                                )}
                            </TableCell>
                            <TableCell className="py-6 pr-8 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => setSelectedContact(c)} className="p-3 bg-white border border-chocolate/5 rounded-full text-chocolate hover:bg-chocolate hover:text-white transition-all shadow-sm active:scale-95"><Eye size={16} /></button>
                                    {!c.read && <button onClick={() => markRead(c._id)} className="p-3 bg-white border border-chocolate/5 rounded-full text-chocolate hover:bg-strawberry hover:text-white transition-all shadow-sm active:scale-95"><CheckCircle2 size={16} /></button>}
                                    <button onClick={() => remove(c._id)} disabled={deletingId === c._id} className="p-3 bg-white border border-red-50 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-30"><Trash2 size={16} /></button>
                                </div>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="grid gap-8 px-4">
                    {filteredContacts.map((c) => (
                        <div key={c._id} className={`group relative bg-white rounded-[2.5rem] p-10 border shadow-bakery hover:shadow-bakery-lg transition-all duration-500 overflow-hidden ${!c.read ? 'border-strawberry/10 border-l-8 border-l-strawberry shadow-lg' : 'border-chocolate/5 opacity-80 scale-[0.98]'}`}>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-strawberry/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-strawberry/10 transition-all duration-700" />
                            
                            <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-10">
                                <div className="flex-1 space-y-8">
                                    <div className="flex flex-wrap items-center gap-6">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-dancing font-bold text-2xl shadow-bakery transform rotate-3 group-hover:rotate-0 transition-transform ${!c.read ? 'bg-chocolate text-white' : 'bg-cream text-chocolate/40'}`}>
                                            {c.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="text-3xl font-bold font-playfair text-chocolate flex items-center gap-3 transition-colors group-hover:text-strawberry italic">
                                                {c.name}
                                                {!c.read && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-strawberry text-white rounded-full text-[9px] font-bold uppercase tracking-[0.2em] shadow-sm animate-pulse">
                                                        <Sparkles size={8} /> New Enquiry
                                                    </span>
                                                )}
                                            </h4>
                                            <div className="flex flex-wrap items-center gap-6 mt-2">
                                                <span className="text-[10px] font-bold text-chocolate-light uppercase tracking-widest flex items-center gap-2 italic">
                                                    <Phone size={12} className="text-chocolate/20" />
                                                    {c.phone || "No digits provided"}
                                                </span>
                                                <span className="text-[10px] font-bold text-chocolate-light uppercase tracking-widest flex items-center gap-2 italic border-l border-chocolate/5 pl-6">
                                                    <Calendar size={12} className="text-chocolate/20" />
                                                    {new Date(c.createdAt).toLocaleDateString('en-IN', { hour: 'numeric', minute: '2-digit', month: 'long', day: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="inline-flex items-center gap-3 px-6 py-3 bg-cream/30 rounded-2xl text-chocolate text-xs font-bold uppercase tracking-widest border border-chocolate/5 italic shadow-inner">
                                            Subject: {c.subject || "Patron Inquiry"}
                                        </div>
                                        <div className="p-10 bg-[#FAFBFD] rounded-[3rem] border border-chocolate/5 text-chocolate italic leading-relaxed text-lg shadow-inner relative group/msg">
                                            <MessageSquare className="absolute top-4 right-6 text-chocolate/5 w-12 h-12 transform -rotate-12" />
                                            <p className="relative z-10 whitespace-pre-line">"{c.message}"</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex lg:flex-col gap-4 shrink-0 pt-4">
                                    {!c.read && (
                                        <button onClick={() => markRead(c._id)} className="flex-1 lg:w-52 py-5 px-8 bg-chocolate text-white rounded-full flex items-center justify-center gap-3 font-bold text-[10px] uppercase tracking-[0.2em] shadow-bakery hover:bg-strawberry transition-all active:scale-95 group/btn">
                                            <CheckCircle2 size={18} className="group-hover/btn:scale-110 transition-transform" />
                                            Acknowledge
                                        </button>
                                    )}
                                    <button onClick={() => remove(c._id)} disabled={deletingId === c._id} className={`flex-1 lg:w-52 py-5 px-8 bg-white border rounded-full flex items-center justify-center gap-3 font-bold text-[10px] uppercase tracking-[0.2em] shadow-sm transition-all active:scale-95 ${deletingId === c._id ? 'opacity-50' : 'border-red-100 text-red-400 hover:bg-red-500 hover:text-white'}`}>
                                        <Trash2 size={18} />
                                        {deletingId === c._id ? "Dismissing..." : "Dismiss Archive"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {filteredContacts.length === 0 && !loading && (
                <div className="py-40 text-center space-y-6">
                    <div className="w-24 h-24 bg-cream/50 rounded-full flex items-center justify-center mx-auto text-chocolate/10 transform rotate-12 shadow-inner">
                        <MessageSquare size={48} />
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold font-dancing text-chocolate">The Gallery is Quiet</h3>
                        <p className="text-chocolate-light font-medium italic mt-2">No patron enquiries match your current search realms.</p>
                    </div>
                </div>
            )}
        </>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedContact} onOpenChange={(open) => !open && setSelectedContact(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-2xl bg-[#FAFBFD] border-none rounded-[2.5rem] overflow-hidden p-0">
           <DialogHeader className="p-12 bg-white border-b border-chocolate/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-strawberry/5 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
               <div className="relative flex items-center gap-8">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-dancing font-bold text-3xl shadow-bakery transform rotate-3 ${selectedContact && !selectedContact.read ? 'bg-chocolate text-white' : 'bg-cream text-chocolate/20'}`}>
                        {selectedContact?.name.charAt(0)}
                    </div>
                    <div>
                        <DialogTitle className="text-4xl font-bold font-dancing text-chocolate mb-1">{selectedContact?.name}</DialogTitle>
                        <DialogDescription className="text-chocolate-light font-medium italic flex items-center gap-2">
                           Inquiry Identity <span className="font-mono text-[10px] bg-chocolate/5 px-2 py-0.5 rounded text-chocolate/40">#{selectedContact?._id.slice(-8).toUpperCase()}</span>
                        </DialogDescription>
                    </div>
               </div>
           </DialogHeader>

           <div className="p-12 space-y-10 overflow-y-auto max-h-[60vh] no-scrollbar">
                <div className="grid grid-cols-2 gap-6">
                    <div className="p-5 bg-white rounded-3xl border border-chocolate/5 shadow-sm">
                        <p className="text-[9px] font-bold text-chocolate/20 uppercase tracking-widest italic mb-2">Communicated Via</p>
                        <div className="flex items-center gap-3 text-chocolate italic font-bold">
                            <Phone size={16} className="text-strawberry/40" />
                            <span className="text-sm">{selectedContact?.phone || "Private Narrative"}</span>
                        </div>
                    </div>
                    <div className="p-5 bg-white rounded-3xl border border-chocolate/5 shadow-sm">
                        <p className="text-[9px] font-bold text-chocolate/20 uppercase tracking-widest italic mb-2">Chronicle Date</p>
                        <div className="flex items-center gap-3 text-chocolate italic font-bold">
                            <Clock size={16} className="text-strawberry/40" />
                            <span className="text-sm">{selectedContact?.createdAt && new Date(selectedContact.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-chocolate font-bold italic border-b border-chocolate/5 pb-2 ml-1">
                        <Sparkles size={16} className="text-strawberry/20" />
                        <span className="text-xs uppercase tracking-widest">{selectedContact?.subject || "A Message of Sweetness"}</span>
                    </div>
                    <div className="p-10 bg-cream/20 rounded-[2.5rem] border border-chocolate/5 shadow-inner italic leading-relaxed text-chocolate text-lg whitespace-pre-line relative group">
                        <MessageSquare className="absolute top-4 right-6 text-chocolate/5 w-12 h-12" />
                        "{selectedContact?.message}"
                    </div>
                </div>
           </div>

           <DialogFooter className="p-10 bg-white border-t border-chocolate/5 flex flex-row items-center justify-between">
              <button onClick={() => setSelectedContact(null)} className="px-10 py-4 font-bold text-chocolate bg-white border border-chocolate/10 rounded-full hover:bg-chocolate/5 transition-all text-[10px] uppercase tracking-widest italic">Close Portal</button>
              <div className="flex gap-4">
                {selectedContact && !selectedContact.read && (
                    <button onClick={() => { markRead(selectedContact._id); setSelectedContact(null); }} className="px-10 py-4 bg-chocolate text-white rounded-full font-bold shadow-bakery hover:bg-strawberry transition-all text-[10px] uppercase tracking-widest flex items-center gap-2">
                        <Check size={16} /> Acknowledge
                    </button>
                )}
                <button onClick={() => { remove(selectedContact!._id); setSelectedContact(null); }} className="px-10 py-4 bg-red-50 text-red-500 rounded-full border border-red-100 hover:bg-red-500 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <Trash2 size={16} /> Dismiss
                </button>
              </div>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Contacts;
