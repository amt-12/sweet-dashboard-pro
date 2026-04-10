import { Plus, Search, Edit, Trash2, X, IceCream, FileText, Info, RefreshCw, Sparkles, Tag, Boxes, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { toast } from "sonner";

type Flavor = {
	id: string | number;
	name: string;
	description?: string;
	category?: string | number | { _id: string; name: string };
};

const emptyForm: Partial<Flavor> = {
	name: "",
	description: "",
	category: "",
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
	const [selectedCategoryId, setSelectedCategoryId] = useState<string | number>("All");

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
					category: (f.category && (f.category._id || f.category.id)) || f.category || undefined,
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
			setForm({ name: data.name, description: data.description, category: (data.category && (data.category._id || data.category.id)) || data.category || "" });
		} catch {
			setForm({ name: f.name, description: f.description, category: "" });
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
		if (form.category) payload.category = form.category;

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
			toast.success("Flavor deleted.");
		} catch (err: any) {
			toast.error("Failed to delete flavor");
		} finally {
			setLoading(false);
		}
	};

	const filteredFlavors = flavors.filter(f => {
		const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			f.description?.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesCategory = selectedCategoryId === "All" || String(f.category) === String(selectedCategoryId);
		return matchesSearch && matchesCategory;
	});

	return (
		<div className="space-y-8 animate-in fade-in duration-700 font-lora">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
				<div>
					<h2 className="text-4xl font-bold font-dancing text-chocolate">Flavors</h2>
					<p className="text-sm text-chocolate-light font-medium mt-1">
						Manage the taste profiles of your bakery products.
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
						<span className="font-bold text-xs uppercase tracking-widest text-[#F5ECD7]">Add Flavor</span>
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

			{/* ── Filter Section (Category Buttons) ────────────────────── */}
			<div className="bg-white/40 backdrop-blur-sm p-6 rounded-[2.5rem] border border-chocolate/5 space-y-4">
				<div className="flex items-center gap-2 mb-2">
					<div className="w-1 h-4 bg-strawberry rounded-full" />
					<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-chocolate/40">Select Category</span>
				</div>
				<div className="flex flex-wrap gap-3">
					<button
						onClick={() => setSelectedCategoryId("All")}
						className={`px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 border ${
							selectedCategoryId === "All"
								? 'bg-chocolate text-white border-chocolate shadow-bakery shadow-chocolate/20 scale-105'
								: 'bg-white text-chocolate/60 border-chocolate/10 hover:border-strawberry/30 hover:text-strawberry hover:bg-white'
						}`}
					>
						All
					</button>
					{categories.map((cat) => {
						const isActive = String(selectedCategoryId) === String(cat.id);
						return (
							<button
								key={cat.id}
								onClick={() => setSelectedCategoryId(cat.id)}
								className={`px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 border ${
									isActive
										? 'bg-chocolate text-white border-chocolate shadow-bakery shadow-chocolate/20 scale-105'
										: 'bg-white text-chocolate/60 border-chocolate/10 hover:border-strawberry/30 hover:text-strawberry hover:bg-white'
								}`}
							>
								{cat.name}
							</button>
						);
					})}
				</div>
			</div>

			<div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-chocolate/5 shadow-bakery overflow-hidden">
				<Table>
					<TableHeader className="bg-cream/30">
						<TableRow className="border-chocolate/5 hover:bg-transparent">
							<TableHead className="w-20 pl-8 h-16 font-bold text-chocolate italic uppercase tracking-widest text-[10px]">Icon</TableHead>
							<TableHead className="h-16 font-bold text-chocolate/80 uppercase tracking-widest text-[10px]">Flavor Name</TableHead>
							<TableHead className="h-16 font-bold text-chocolate/80 uppercase tracking-widest text-[10px] hidden md:table-cell">Description</TableHead>
							<TableHead className="h-16 font-bold text-chocolate/80 uppercase tracking-widest text-[10px]">Category</TableHead>
							<TableHead className="pr-8 h-16 font-bold text-chocolate italic uppercase tracking-widest text-[10px] text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody className="no-scrollbar">
						{filteredFlavors.map((flavor) => (
							<TableRow key={flavor.id} className="group border-chocolate/5 hover:bg-cream/20 transition-colors">
								<TableCell className="pl-8 py-6">
									<div className="w-12 h-12 rounded-xl bg-chocolate text-white flex items-center justify-center font-dancing font-bold text-xl shadow-sm transform group-hover:rotate-3 transition-transform duration-300">
										{String(flavor.name).charAt(0)}
									</div>
								</TableCell>
								<TableCell className="py-6">
									<span className="font-bold text-chocolate text-lg tracking-tight group-hover:text-strawberry transition-colors">
										{flavor.name}
									</span>
								</TableCell>
								<TableCell className="py-6 hidden md:table-cell max-w-md">
									<p className="text-sm text-chocolate/40 font-medium italic line-clamp-1 leading-relaxed">
										{flavor.description || "No description provided."}
									</p>
								</TableCell>
								<TableCell className="py-6">
									{flavor.category ? (
										<span className="px-3 py-1 bg-chocolate/5 rounded-full border border-chocolate/5 text-[10px] font-bold uppercase tracking-widest text-chocolate/40 italic">
											{categories.find(c => String(c.id) === String(flavor.category))?.name || 'Unassigned'}
										</span>
									) : (
										<span className="text-chocolate/20 text-[10px] italic">Not Tagged</span>
									)}
								</TableCell>
								<TableCell className="py-6 pr-8 text-right">
									<div className="flex items-center justify-end gap-2 shrink-0 transition-all">
										<button
											onClick={() => openEdit(flavor)}
											className="p-2.5 bg-white border border-chocolate/10 rounded-full text-chocolate hover:bg-chocolate hover:text-white transition-all shadow-sm"
										>
											<Edit size={14} />
										</button>
										<button
											onClick={() => handleDelete(flavor.id)}
											className="p-2.5 bg-white border border-red-100 rounded-full text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"
										>
											<Trash2 size={14} />
										</button>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>

				{filteredFlavors.length === 0 && !loading && (
					<div className="py-24 text-center space-y-4 bg-white/40">
						<div className="w-16 h-16 bg-chocolate/5 rounded-full flex items-center justify-center mx-auto text-chocolate/10">
							<IceCream size={32} />
						</div>
						<p className="text-chocolate-light font-medium italic">No flavors found in the archives.</p>
					</div>
				)}
			</div>

			<Dialog open={showModal} onOpenChange={(open) => !open && closeModal()}>
				<DialogContent className="max-w-2xl bg-[#FAFBFD] p-0 border-none overflow-hidden rounded-[2.5rem] shadow-2xl">
					<DialogHeader className="p-8 bg-white border-b border-chocolate/5 relative overflow-hidden">
						<div className="absolute top-0 right-0 w-48 h-48 bg-strawberry/5 rounded-full -mr-24 -mt-24 blur-3xl" />
						<div className="relative flex items-center gap-6">
							<div className="w-14 h-14 rounded-2xl bg-chocolate text-white flex items-center justify-center shadow-bakery transform rotate-3 hover:rotate-0 transition-transform">
								<IceCream size={24} />
							</div>
							<div>
								<DialogTitle className="text-3xl font-bold text-chocolate font-dancing">
									{editingId ? "Edit Flavor" : "Add New Flavor"}
								</DialogTitle>
								<DialogDescription className="text-chocolate-light font-medium mt-1">
									{editingId ? "Update the details of this flavor." : "Add a new taste profile to your bakery."}
								</DialogDescription>
							</div>
						</div>
					</DialogHeader>

					<form id="flavor-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar max-h-[60vh]">
						<div className="space-y-6">
							<div className="space-y-2 group">
								<label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Flavor Name</label>
								<div className="relative">
									<Sparkles size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
									<input
										required
										value={form.name || ""}
										onChange={(e) => setForm({ ...form, name: e.target.value })}
										placeholder="e.g. Vanilla Bean"
										className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-medium placeholder:text-chocolate/10"
									/>
								</div>
								{errors.name && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1">{errors.name}</p>}
							</div>

							<div className="space-y-2 group">
								<label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Category</label>
								<Select
									value={form.category?.toString()}
									onValueChange={(val) => setForm({ ...form, category: val })}
								>
									<SelectTrigger className="w-full p-6 h-auto bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-bold text-chocolate italic group">
										<div className="flex items-center gap-2">
											<Boxes size={18} className="text-chocolate/20 group-hover:text-strawberry transition-colors" />
											<SelectValue placeholder={categoriesLoading ? 'Loading Categories...' : 'Select Category'} />
										</div>
									</SelectTrigger>
									<SelectContent className="rounded-2xl border-chocolate/10 shadow-bakery-xl font-lora">
										{categories.map((c) => (
											<SelectItem key={c.id} value={c.id.toString()} className="focus:bg-strawberry/5 focus:text-strawberry py-3">{c.name}</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2 group">
								<label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Description</label>
								<div className="relative">
									<FileText size={18} className="absolute left-4 top-5 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
									<textarea
										value={form.description || ""}
										onChange={(e) => setForm({ ...form, description: e.target.value })}
										placeholder="Describe the flavor profile..."
										className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-medium placeholder:text-chocolate/10 min-h-[120px] resize-none leading-relaxed italic"
									/>
								</div>
							</div>
						</div>
					</form>

					<DialogFooter className="p-8 bg-white border-t border-chocolate/5 flex flex-row items-center justify-between gap-4">
						<button type="button" onClick={closeModal} className="px-8 py-3 rounded-full text-xs font-bold text-chocolate/60 bg-white border border-chocolate/10 hover:bg-chocolate/5 transition-all uppercase tracking-widest font-lora">
							Cancel
						</button>
						<button type="submit" form="flavor-form" disabled={loading} className="px-10 py-4 bg-chocolate text-white rounded-full font-bold shadow-bakery hover:bg-strawberry transition-all disabled:opacity-50 flex items-center gap-3 uppercase tracking-widest">
							{loading && <RefreshCw size={16} className="animate-spin" />}
							{editingId ? "Update Flavor" : "Add Flavor"}
						</button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default Flavors;
