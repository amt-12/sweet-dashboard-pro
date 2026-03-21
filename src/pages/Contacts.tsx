import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import axiosInstance from '@/services/api';
import { Trash, Check } from 'lucide-react';

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
      const data: any = await contactsApi.list();
      setContacts((data && data.contacts) || data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContacts(); }, []);

  const markRead = async (id: string) => {
    try {
      const contactsApi = (api && (api as any).contacts) ? (api as any).contacts : {
        markRead: async (id: string) => (await axiosInstance.post(`/contacts/${id}/read`)).data,
      };
      await contactsApi.markRead(id);
      setContacts((c) => c.map((it) => it._id === id ? { ...it, read: true } : it));
    } catch (err) { console.error(err); alert('Unable to mark message read'); }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    setDeletingId(id);
    try {
      const contactsApi = (api && (api as any).contacts) ? (api as any).contacts : {
        delete: async (id: string) => (await axiosInstance.delete(`/contacts/${id}`)).data,
      };
      await contactsApi.delete(id);
      setContacts((c) => c.filter((it) => it._id !== id));
    } catch (err: any) {
      console.error('Delete contact failed', err);
      const serverMsg = err?.response?.data?.error || err?.response?.data?.message || err.message;
      alert('Failed to delete message: ' + (serverMsg || 'Unknown error'));
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Contact Messages</h2>
      {contacts.length === 0 && <div className="p-6 text-muted-foreground">No messages yet.</div>}
      <div className="grid gap-4">
        {contacts.map((c) => (
          <div key={c._id} className={`p-4 bg-white rounded-md shadow-sm border ${c.read ? 'opacity-60' : ''}`}>
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="font-bold">{c.name} <span className="text-xs text-gray-500">{c.phone ?? '—'}</span></div>
                <div className="text-sm text-gray-600">{c.subject}</div>
              </div>
              <div className="flex items-center gap-2">
                {!c.read && <button onClick={() => markRead(c._id)} title="Mark read" className="p-2 rounded-md bg-green-50 text-green-600" disabled={deletingId === c._id}><Check size={14} /></button>}
                <button onClick={() => remove(c._id)} title="Delete" className="p-2 rounded-md bg-red-50 text-red-600" disabled={deletingId === c._id}>{deletingId === c._id ? 'Deleting...' : <Trash size={14} />}</button>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-700 whitespace-pre-line">{c.message}</div>
            <div className="text-xs text-gray-400 mt-3">{new Date(c.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Contacts;
