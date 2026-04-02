import { Plus, Search, Edit, Trash2, RefreshCw, Tag, FileText, Layers } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { toast } from "sonner";

type PaymentMode = {
  id: string | number;
  name: string;
  description?: string;
  isActive?: boolean;
};

const emptyForm: Partial<PaymentMode> = {
  name: "",
  description: "",
  isActive: true,
};

const PaymentModes = () => {
  const [items, setItems] = useState<PaymentMode[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<PaymentMode>>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const fetch = () => {
    setLoading(true);
    api.paymentModes
      .getAll()
      .then((res: any) => {
        const raw = Array.isArray(res) ? res : res && (res.data || res) ? res.data : [];
        const normalized = (raw || []).map((p: any) => ({
          id: p._id || p.id,
          name: p.name,
          description: p.description || "",
          isActive: typeof p.isActive === 'boolean' ? p.isActive : true,
        }));
        setItems(normalized);
      })
      .catch((err: any) => {
        toast.error("Failed to load payment modes");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setErrors({}); setShowModal(true); };
  const openEdit = (p: PaymentMode) => {
    setForm({ name: p.name, description: p.description, isActive: p.isActive });
    setEditingId(String(p.id));
    setErrors({});
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setForm(emptyForm); setEditingId(null); setErrors({}); };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name || !String(form.name).trim()) next.name = "A name is required";
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;
    setLoading(true);
    const payload = { name: form.name, description: form.description || "", isActive: !!form.isActive };
    try {
      if (editingId) {
        await api.paymentModes.update(editingId, payload);
        toast.success("Payment mode updated");
      } else {
        await api.paymentModes.create(payload);
        toast.success("Payment mode created");
      }
      fetch();
      closeModal();
    } catch (err: any) {
      toast.error(err?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Delete this payment mode?")) return;
    setLoading(true);
    try {
      await api.paymentModes.delete(id);
      setItems((prev) => prev.filter((p) => String(p.id) !== String(id)));
      toast.success("Deleted");
    } catch (err: any) {
      toast.error("Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  const filtered = items.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-lora">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold font-dancing text-chocolate">Payment Modes</h2>
          <p className="text-sm text-chocolate-light mt-1">Manage payment options customers can use at checkout.</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={fetch} className="p-3 bg-white border rounded-full">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={openAdd} className="px-6 py-3 bg-chocolate text-white rounded-full flex items-center gap-2">
            <Plus size={18} />
            <span className="font-bold text-xs uppercase">Add</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white/60 p-4 rounded-[2rem]">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-chocolate/30" />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search payment modes..." className="w-full pl-14 py-4 rounded-2xl" />
        </div>
      </div>

      <div className="bg-white/60 rounded-[2.5rem] border p-4 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-8">Icon</TableHead>
              <TableHead>Payment Mode</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead className="text-center">Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="pl-8">
                  <div className="w-12 h-12 rounded-xl bg-chocolate text-white flex items-center justify-center">{String(p.name).charAt(0)}</div>
                </TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell className="hidden md:table-cell max-w-md">{p.description || '—'}</TableCell>
                <TableCell className="text-center">{p.isActive ? 'Yes' : 'No'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(p)} className="p-2.5 bg-white rounded-full">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-2.5 bg-white rounded-full text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filtered.length === 0 && !loading && (
          <div className="py-24 text-center">
            <div className="w-16 h-16 mx-auto bg-chocolate/5 rounded-full flex items-center justify-center text-chocolate/10"><Layers size={32} /></div>
            <p className="text-chocolate-light mt-4">No payment modes found.</p>
          </div>
        )}
      </div>

      <Dialog open={showModal} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-chocolate text-white flex items-center justify-center"><Tag size={24} /></div>
              <div>
                <DialogTitle>{editingId ? 'Edit Payment Mode' : 'Add Payment Mode'}</DialogTitle>
                <DialogDescription>{editingId ? 'Update the payment mode.' : 'Create a payment mode available at checkout.'}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form id="pm-form" onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-xs font-bold">Name</label>
              <input required value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full p-4 rounded-2xl" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold">Description</label>
              <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full p-4 rounded-2xl min-h-[100px]" />
            </div>

            <div>
              <label className="block text-xs font-bold">Status</label>
              <Select value={form.isActive ? 'active' : 'inactive'} onValueChange={(val) => setForm({ ...form, isActive: val === 'active' })}>
                <SelectTrigger className="w-48 p-4 rounded-2xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </form>

          <DialogFooter className="flex justify-between">
            <button type="button" onClick={closeModal} className="px-8 py-3 rounded-full">Cancel</button>
            <button type="submit" form="pm-form" disabled={loading} className="px-8 py-3 rounded-full bg-chocolate text-white">
              {loading ? <RefreshCw size={16} className="animate-spin" /> : (editingId ? 'Update' : 'Create')}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentModes;
