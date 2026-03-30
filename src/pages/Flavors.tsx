import { Plus, Search, Edit, Trash2, X, IceCream, FileText, Info, RefreshCw, Sparkles, Tag, Boxes, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "../components/ui/sheet";
import { toast } from "sonner";

type Flavor = {
	id: string | number;
	name: string;
	description?: string;
	categoryId?: string | number;
};

const emptyForm: Partial<Flavor> = {
	name: "",
	description: "",
	categoryId: "",
};

const Flavors = () => {
	const [flavors, setFlavors] = useState<Flavor[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [showModal, setShowModal] = useState(false);
	const [form, setForm] = useState<Partial<Flavor>>(emptyForm);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [searchQuery, setSearchQuery] = useState("");

	const [categories, setCategories] = useState<{ id: string | number; name: string }[]>([]);
	const [categoriesLoading, setCategoriesLoading] = useState(false);

	const fetchFlavors = () => {
		setLoading(true);
		api.flavors
			.getAll()
			.then((res: any) => {
				const raw = Array.isArray(res) ? res : res && (res.data || res) ? res.data : [];
				const normalized = (raw || []).map((f: any) => ({
					id: f._id || f.id,
					name: f.name,
					description: f.description || "",
					categoryId: f.categoryId || (f.category && (f.category._id || f.category.id)) || undefined,
				}));
				setFlavors(normalized);
			})
			.catch((err: any) => {
				toast.error("Failed to load flavors");
				setError(err?.message || "Failed to load flavors");
			})
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		fetchFlavors();
	}, []);

	useEffect(() => {
		let mounted = true;
		setCategoriesLoading(true);
		api.categories
			.getAll()
			.then((res: any) => {
				if (!mounted) return;
				const raw = Array.isArray(res) ? res : res && (res.data || res) ? res.data : [];
				const list = (raw || []).map((c: any) => ({ id: c._id || c.id, name: c.name }));
				setCategories(list);
			})
			.catch(() => {
				if (mounted) setCategories([]);
			})
			.finally(() => mounted && setCategoriesLoading(false));

		return () => { mounted = false; };
	}, []);

	const openAdd = () => {
		setForm(emptyForm);
		setEditingId(null);
		setErrors({});
		setShowModal(true);
	};

	const openEdit = async (f: Flavor) => {
		setErrors({});
		setEditingId(String(f.id));
		setShowModal(true);

		try {
			const res: any = await api.flavors.getById(f.id);
			const data = res && (res._id || res.id) ? { id: res._id || res.id, ...res } : res && res.data ? res.data : res;
			setForm({ name: data.name, description: data.description, categoryId: data.categoryId || (data.category && (data.category._id || data.category.id)) || "" });
		} catch {
			setForm({ name: f.name, description: f.description, categoryId: "" });
		}
	};

	const closeModal = () => {
		setShowModal(false);
		setForm(emptyForm);
		setEditingId(null);
		setErrors({});
	};

	const validate = () => {
		const next: Record<string, string> = {};
		if (!form.name || !String(form.name).trim()) next.name = "A name is required for this flavor";
		return next;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const v = validate();
		setErrors(v);
		if (Object.keys(v).length) return;

		setLoading(true);
		const payload: any = { name: form.name, description: form.description || "" };
		if (form.categoryId) payload.categoryId = form.categoryId;

		try {
			if (editingId) {
				await api.flavors.update(editingId, payload);
				toast.success("Flavor updated!");
			} else {
				await api.flavors.create(payload);
				toast.success("New flavor added!");
			}
			fetchFlavors();
			closeModal();
		} catch (err: any) {
			toast.error("Failed to save flavor");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id: string | number) => {
		if (!confirm("Delete this flavor?")) return;
		setLoading(true);
		try {
			await api.flavors.delete(id);
			setFlavors((prev) => prev.filter((c) => String(c.id) !== String(id)));
			toast.success("Flavor removed.");
		} catch (err: any) {
			toast.error("Failed to delete flavor");
		} finally {
			setLoading(false);
		}
	};

	const filteredFlavors = flavors.filter(f => 
		f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		f.description?.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className="space-y-8 animate-in fade-in duration-700 font-lora">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
				<div>
					<h2 className="text-4xl font-bold font-dancing text-chocolate">Artisanal Flavors</h2>
					<p className="text-sm text-chocolate-light font-medium mt-1">
						Curate the sensory experience of your bakery products.
					</p>
				</div>
				<div className="flex items-center gap-4">
					<button 
						onClick={fetchFlavors}
						className="p-3 bg-white border border-chocolate/10 rounded-full text-chocolate hover:bg-strawberry/5 transition-all shadow-sm group"
					>
						<RefreshCw size={18} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
					</button>
					<button 
						onClick={openAdd} 
						className="px-6 py-3 bg-chocolate text-white rounded-full flex items-center gap-2 shadow-bakery hover:shadow-bakery-lg hover:bg-strawberry transition-all duration-300"
					>
						<Plus size={18} />
						<span className="font-bold text-xs uppercase tracking-widest text-[#F5ECD7]">New Flavor</span>
					</button>
				</div>
			</div>

			<div className="flex items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-[2rem] shadow-bakery border border-chocolate/5">
				<div className="relative flex-1 group">
					<Search className="absolute left-5 top-1/2 -translate-y-1/2 text-chocolate/30 group-focus-within:text-strawberry transition-colors w-5 h-5" />
					<input 
						type="text" 
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search flavors..." 
						className="w-full pl-14 pr-6 py-4 rounded-2xl bg-[#FAF6E6]/50 text-chocolate outline-none border border-transparent focus:border-strawberry/20 focus:bg-white focus:ring-8 focus:ring-strawberry/5 transition-all font-medium placeholder:text-chocolate/20" 
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
				{filteredFlavors.map((flavor) => (
					<div key={flavor.id} className="group relative bg-white rounded-[2.5rem] p-10 border border-chocolate/5 shadow-bakery hover:shadow-bakery-lg transition-all duration-500 overflow-hidden">
						<div className="absolute top-0 right-0 w-32 h-32 bg-strawberry/5 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-strawberry/10" />
						
						<div className="flex justify-between items-start mb-8 relative z-10">
							<div className="w-16 h-16 rounded-2xl bg-chocolate text-white flex items-center justify-center font-dancing font-bold text-3xl shadow-bakery transform rotate-3 group-hover:rotate-0 transition-transform duration-500">
								{String(flavor.name).charAt(0)}
							</div>
							<div className="flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
								<button onClick={() => openEdit(flavor)} className="p-3 bg-white border border-chocolate/10 rounded-full text-chocolate hover:bg-chocolate hover:text-white transition-all shadow-sm"><Edit size={16} /></button>
								<button onClick={() => handleDelete(flavor.id)} className="p-3 bg-white border border-red-100 rounded-full text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash2 size={16} /></button>
							</div>
						</div>
						
						<div className="relative z-10">
							<h3 className="text-2xl font-bold font-playfair text-chocolate mb-2 group-hover:text-strawberry transition-colors italic leading-tight">{flavor.name}</h3>
							<p className="text-sm text-chocolate-light font-medium line-clamp-2 italic leading-relaxed">
								{flavor.description || "A secret recipe awaiting your description."}
							</p>
						</div>

						<div className="mt-8 pt-8 border-t border-chocolate/5 flex items-center justify-between relative z-10">
							<div className="flex items-center gap-2">
								<Sparkles size={14} className="text-strawberry/40" />
								<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-chocolate/30">Sensory Profile</span>
							</div>
							{flavor.categoryId && (
								<div className="px-3 py-1 bg-chocolate/5 rounded-full border border-chocolate/5 text-[9px] font-bold uppercase tracking-widest text-chocolate/40 italic">
									{categories.find(c => String(c.id) === String(flavor.categoryId))?.name || 'Artisan Group'}
								</div>
							)}
						</div>
					</div>
				))}
				
				{filteredFlavors.length === 0 && !loading && (
					<div className="col-span-full py-24 text-center space-y-4">
						<div className="w-20 h-20 bg-chocolate/5 rounded-full flex items-center justify-center mx-auto text-chocolate/10">
							<IceCream size={40} />
						</div>
						<p className="text-chocolate-light font-medium italic">No artisanal flavors found.</p>
					</div>
				)}
			</div>

			<Sheet open={showModal} onOpenChange={(open) => !open && closeModal()}>
				<SheetContent side="right" className="flex flex-col h-full bg-[#FAFBFD] p-0 border-l border-chocolate/10">
					<SheetHeader className="p-10 bg-white border-b border-chocolate/5 relative overflow-hidden">
						<div className="absolute top-0 right-0 w-48 h-48 bg-strawberry/5 rounded-full -mr-24 -mt-24 blur-3xl" />
						<div className="relative flex items-center gap-6">
							<div className="w-16 h-16 rounded-2xl bg-chocolate text-white flex items-center justify-center shadow-bakery transform rotate-3 hover:rotate-0 transition-transform">
								<IceCream size={28} />
							</div>
							<div>
								<SheetTitle className="text-4xl font-bold text-chocolate font-dancing">
									{editingId ? "Edit Flavor" : "New Flavor"}
								</SheetTitle>
								<SheetDescription className="text-chocolate-light font-medium italic">
									{editingId ? "Refine the details of this artistic flavor." : "Craft the profile for a new sensoric experience."}
								</SheetDescription>
							</div>
						</div>
					</SheetHeader>

					<form id="flavor-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-8">
						<div className="space-y-6">
							<div className="space-y-2 group">
								<label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Flavor Name</label>
								<div className="relative">
									<Sparkles size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
									<input
										required
										value={form.name || ""}
										onChange={(e) => setForm({ ...form, name: e.target.value })}
										placeholder="e.g. Lavender & Honey"
										className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-medium placeholder:text-chocolate/10"
									/>
								</div>
								{errors.name && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1">{errors.name}</p>}
							</div>

							<div className="space-y-2 group">
								<label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Artistic Notes</label>
								<div className="relative">
									<FileText size={18} className="absolute left-4 top-5 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
									<textarea
										value={form.description || ""}
										onChange={(e) => setForm({ ...form, description: e.target.value })}
										placeholder="Describe the taste profile..."
										className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-medium placeholder:text-chocolate/10 min-h-[140px] resize-none leading-relaxed italic"
									/>
								</div>
							</div>

							<div className="space-y-2 group">
								<label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Artisan Category</label>
								<div className="relative">
									<Boxes size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 pointer-events-none" />
									<select
										value={form.categoryId ?? ""}
										onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
										className="w-full pl-12 pr-10 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-bold text-chocolate italic appearance-none"
									>
										<option value="">{categoriesLoading ? 'Loading...' : 'Select Group'}</option>
										{categories.map((c) => (
											<option key={c.id} value={c.id}>{c.name}</option>
										))}
									</select>
									<ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-chocolate/20 rotate-90 pointer-events-none" />
								</div>
							</div>
						</div>
					</form>

					<SheetFooter className="p-10 bg-white border-t border-chocolate/5 flex flex-row justify-between items-center">
						<button type="button" onClick={closeModal} className="px-8 py-3 rounded-full text-xs font-bold text-chocolate bg-white border border-chocolate/10 hover:bg-chocolate/5 transition-all uppercase tracking-widest">
							Cancel
						</button>
						<button type="submit" form="flavor-form" disabled={loading} className="px-10 py-4 bg-chocolate text-white rounded-full font-bold shadow-bakery hover:bg-strawberry transition-all disabled:opacity-50 flex items-center gap-3 uppercase tracking-widest">
							{loading && <RefreshCw size={16} className="animate-spin" />}
							{editingId ? "Save Changes" : "Create Flavor"}
						</button>
					</SheetFooter>
				</SheetContent>
			</Sheet>
		</div>
	);
};

export default Flavors;
