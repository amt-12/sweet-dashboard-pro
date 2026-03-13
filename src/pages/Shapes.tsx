import { Plus, Search, Edit, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../services/api";

type Shape = {
	id: string | number;
	name: string;
	shapeType: string;
	description?: string;
};

const emptyForm: Partial<Shape> = {
	name: "",
	description: "",
};

const Shapes = () => {
	// sanitize names by removing empty parentheses like ()
	const sanitizeName = (n?: string) => (n || "").replace(/\(\s*\)/g, "").trim();

	const [shapes, setShapes] = useState<Shape[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [showModal, setShowModal] = useState(false);
	const [form, setForm] = useState<Partial<Shape>>(emptyForm);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		setLoading(true);
		api.shapes
			.getAll()
			.then((res: any) => {
				const raw = Array.isArray(res) ? res : res && (res.data || res) ? res.data : [];
				const normalized = (raw || []).map((s: any) => ({
					id: s._id || s.id,
					name: sanitizeName(s.name),
					shapeType: s.shapeType || 'round',
					description: s.description || "",
				}));
				setShapes(normalized);
			})
			.catch((err: any) => setError(err?.message || "Failed to load shapes"))
			.finally(() => setLoading(false));
	}, []);

	const openAdd = () => {
		setForm(emptyForm);
		setEditingId(null);
		setErrors({});
		setShowModal(true);
	};

	const openEdit = (s: Shape) => {
		setForm({ name: s.name, description: s.description });
		setEditingId(String(s.id));
		setErrors({});
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		setForm(emptyForm);
		setEditingId(null);
		setErrors({});
	};

	const validate = () => {
		const next: Record<string, string> = {};
		if (!form.name || !String(form.name).trim()) next.name = "Name is required";
		return next;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const v = validate();
		setErrors(v);
		if (Object.keys(v).length) return;

		setLoading(true);
		const payload = { name: sanitizeName(form.name), description: form.description || "" };

		try {
			if (editingId) {
				const res: any = await api.shapes.update(editingId, payload);
				const s = res && (res._id || res.id) ? { id: res._id || res.id, ...res } : res && res.data ? res.data : res;
				setShapes((prev) => prev.map((it) => (String(it.id) === String(editingId) ? { id: s.id, name: s.name, shapeType: s.shapeType, description: s.description } : it)));
			} else {
				const res: any = await api.shapes.create(payload);
				const s = res && (res._id || res.id) ? { id: res._id || res.id, ...res } : res && res.data ? res.data : res;
				setShapes((prev) => [{ id: s.id, name: sanitizeName(s.name), shapeType: s.shapeType, description: s.description }, ...prev]);
			}
			closeModal();
		} catch (err: any) {
			setError(err?.message || "Failed to save shape");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id: string | number) => {
		if (!confirm("Delete this shape?")) return;
		setLoading(true);
		try {
			await api.shapes.delete(id);
			setShapes((prev) => prev.filter((c) => String(c.id) !== String(id)));
		} catch (err: any) {
			setError(err?.message || "Failed to delete shape");
		} finally {
			setLoading(false);
		}
	};

	if (loading) return <div className="p-8 text-center">Loading shapes...</div>;
	if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

	return (
		<div className="space-y-8 animate-fade-in font-lora">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h2 className="text-3xl font-bold font-playfair text-[#1A2744]">Shapes <span className="inline-block hover:scale-110 transition-transform">🔷</span></h2>
					<p className="text-[#8D6E63] mt-1">Manage cake shapes (round, square, heart, etc.).</p>
				</div>
				<button onClick={openAdd} className="px-5 py-2.5 bg-[#D4A373] text-white rounded-full font-bold shadow-md hover:bg-[#c49265] transition-all flex items-center gap-2">
					<Plus size={18} /> Add Shape
				</button>
			</div>

			<div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-[#D4A373]/20">
				<div className="relative flex-1">
					<Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4A373] w-5 h-5" />
					<input type="text" placeholder="Search shapes..." className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#F5ECD7]/30 text-[#1A2744] outline-none focus:ring-2 focus:ring-[#D4A373]/50 transition-all placeholder:text-[#8D6E63]/60" />
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{shapes.map((shape) => (
					<div key={shape.id} className="bg-white p-6 rounded-2xl shadow-sm border border-[#D4A373]/20 hover:shadow-bakery-lg hover:-translate-y-1 transition-all duration-300 group">
						<div className="flex justify-between items-start mb-4">
							<div className="w-14 h-14 rounded-2xl bg-[#F5ECD7]/50 flex items-center justify-center text-[#D4A373] font-playfair font-bold text-2xl border border-[#D4A373]/20 shadow-inner">{String(shape.name).charAt(0)}</div>
							<div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
								<button onClick={() => openEdit(shape)} className="p-2 bg-[#F5ECD7] rounded-full text-[#8D6E63] hover:text-[#1A2744] hover:bg-[#D4A373] hover:text-white transition-all shadow-sm"><Edit size={16} /></button>
								<button onClick={() => handleDelete(shape.id)} className="p-2 bg-red-50 rounded-full text-red-400 hover:text-white hover:bg-red-500 transition-all shadow-sm"><Trash2 size={16} /></button>
							</div>
						</div>
						<h3 className="text-xl font-bold font-playfair text-[#1A2744] mb-2">{shape.name}</h3>
						<p className="text-sm text-[#8D6E63] mb-4 line-clamp-2">{shape.description}</p>
					</div>
				))}
			</div>

			{showModal && (
				<div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/50">
					<div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl mt-6 mx-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
						<div className="flex items-start justify-between">
							<h3 className="font-playfair text-xl font-bold mb-4">{editingId ? "Edit Shape" : "Add Shape"}</h3>
							<button onClick={closeModal} className="text-[#1A2744]/60 hover:text-[#1A2744]"><X /></button>
						</div>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<label className="text-sm font-medium text-[#1A2744]">Name</label>
								<input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`w-full mt-1 p-3 border rounded-lg bg-[#fffdf8] border-[#efe6d9] ${errors.name ? "ring-1 ring-red-300" : ""}`} />
								{errors.name && <div className="text-xs text-red-500 mt-1">{errors.name}</div>}
							</div>

							<div>
								<label className="text-sm font-medium text-[#1A2744]">Description</label>
								<textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full mt-1 p-3 border rounded-lg bg-[#fffdf8] border-[#efe6d9]" rows={3} />
							</div>

							<div className="flex justify-end gap-2 pt-3">
								<button type="button" onClick={closeModal} className="px-5 py-2 rounded bg-[#F5F5F5] text-[#333] border">Cancel</button>
								<button type="submit" disabled={loading} className={`px-5 py-2 rounded ${loading ? "bg-gray-400" : "bg-[#15273b]"} text-white shadow`}>{editingId ? "Save" : "Create"}</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default Shapes;
