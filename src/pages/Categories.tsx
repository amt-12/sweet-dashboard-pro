import { Plus, Search, Edit, Trash2, Filter, X, Tag, FileText, Hash, Info, Layers, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "../components/ui/sheet";
import { toast } from "sonner";

type Category = {
	id: string | number;
	name: string;
	description?: string;
	items?: number;
	status?: "Active" | "Inactive";
};

const emptyForm: Partial<Category> = {
	name: "",
	description: "",
	items: 0,
	status: "Active",
};

const Categories = () => {
	const [categories, setCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [showModal, setShowModal] = useState(false);
	const [form, setForm] = useState<Partial<Category>>(emptyForm);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [searchQuery, setSearchQuery] = useState("");

	const fetchCategories = () => {
		setLoading(true);
		api.categories
			.getAll()
			.then((res: any) => {
				const raw = Array.isArray(res)
					? res
					: res && (res.data || res)
					? res.data
					: [];
				const normalized = (raw || []).map((c: any) => ({
					id: c._id || c.id,
					name: c.name,
					description: c.description || "",
					items: Number(c.items) || 0,
					status: c.status || "Active",
				}));
				setCategories(normalized);
			})
			.catch((err: any) => {
				toast.error("Failed to load categories");
				setError(err?.message || "Failed to load categories");
			})
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		fetchCategories();
	}, []);

	const openAdd = () => {
		setForm(emptyForm);
		setEditingId(null);
		setErrors({});
		setShowModal(true);
	};

	const openEdit = (c: Category) => {
		setForm({
			name: c.name,
			description: c.description,
			items: c.items,
			status: c.status,
		});
		setEditingId(String(c.id));
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
		if (!form.name || !String(form.name).trim()) next.name = "A name is required for your category";
		return next;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const v = validate();
		setErrors(v);
		if (Object.keys(v).length) return;

		setLoading(true);
		const payload = {
			name: form.name,
			description: form.description || "",
			items: Number(form.items) || 0,
			status: form.status || "Active",
		};

		try {
			if (editingId) {
				const res: any = await api.categories.update(editingId, payload);
				toast.success("Category refined beautifully!");
			} else {
				const res: any = await api.categories.create(payload);
				toast.success("A new category has been introduced!");
			}
			fetchCategories();
			closeModal();
		} catch (err: any) {
			toast.error(err?.message || "Operation failed");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id: string | number) => {
		if (!confirm("Relinquish this category? This action cannot be reversed.")) return;
		setLoading(true);
		try {
			await api.categories.delete(id);
			setCategories((prev) => prev.filter((c) => String(c.id) !== String(id)));
			toast.success("Category has been removed.");
		} catch (err: any) {
			toast.error("Failed to delete category");
		} finally {
			setLoading(false);
		}
	};

	const filteredCategories = categories.filter(c => 
		c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		c.description?.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className="space-y-8 animate-in fade-in duration-700 font-lora">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
				<div>
					<h2 className="text-4xl font-bold font-dancing text-chocolate">The Collections</h2>
					<p className="text-sm text-chocolate-light font-medium mt-1">
						Curating and organizing the delightful realms of our menu.
					</p>
				</div>
				<div className="flex items-center gap-4">
					<button 
						onClick={fetchCategories}
						className="p-3 bg-white border border-chocolate/10 rounded-full text-chocolate hover:bg-strawberry/5 transition-all shadow-sm group"
					>
						<RefreshCw size={18} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
					</button>
					<button
						onClick={openAdd}
						className="px-6 py-3 bg-chocolate text-white rounded-full flex items-center gap-2 shadow-bakery hover:shadow-bakery-lg hover:bg-strawberry transition-all duration-300"
					>
						<Plus size={18} />
						<span className="font-bold text-xs uppercase tracking-widest text-[#F5ECD7]">New Collection</span>
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
						placeholder="Search collections..."
						className="w-full pl-14 pr-6 py-4 rounded-2xl bg-[#FAF6E6]/50 text-chocolate outline-none border border-transparent focus:border-strawberry/20 focus:bg-white focus:ring-8 focus:ring-strawberry/5 transition-all font-medium placeholder:text-chocolate/20"
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
				{filteredCategories.map((category) => (
					<div
						key={category.id}
						className="group relative bg-white rounded-[2rem] p-8 border border-chocolate/5 shadow-bakery hover:shadow-bakery-lg transition-all duration-500 overflow-hidden"
					>
						<div className="absolute top-0 right-0 w-32 h-32 bg-strawberry/5 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-strawberry/10" />
						
						<div className="flex justify-between items-start mb-6 relative z-10">
							<div className="w-16 h-16 rounded-2xl bg-chocolate text-white flex items-center justify-center font-dancing font-bold text-3xl shadow-bakery transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
								{String(category.name).charAt(0)}
							</div>
							<div className="flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
								<button
									onClick={() => openEdit(category)}
									className="p-3 bg-white border border-chocolate/10 rounded-full text-chocolate hover:bg-chocolate hover:text-white transition-all shadow-sm"
								>
									<Edit size={16} />
								</button>
								<button
									onClick={() => handleDelete(category.id)}
									className="p-3 bg-white border border-red-100 rounded-full text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"
								>
									<Trash2 size={16} />
								</button>
							</div>
						</div>

						<div className="relative z-10">
							<h3 className="text-2xl font-bold font-playfair text-chocolate mb-2 group-hover:text-strawberry transition-colors">
								{category.name}
							</h3>
							<p className="text-sm text-chocolate-light font-medium mb-6 line-clamp-2 leading-relaxed italic">
								{category.description || "No description provided for this collection."}
							</p>
						</div>

						<div className="flex items-center justify-between pt-6 border-t border-chocolate/5 relative z-10">
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 rounded-full bg-strawberry animate-pulse" />
								<span className="text-[10px] font-bold uppercase tracking-widest text-chocolate/40">
									{category.items ?? 0} Masterpieces
								</span>
							</div>
							<span
								className={`text-[10px] font-bold uppercase tracking-widest ${
									category.status === "Active"
										? "text-green-600"
										: "text-chocolate/20"
								}`}
							>
								{category.status}
							</span>
						</div>
					</div>
				))}
				
				{filteredCategories.length === 0 && !loading && (
					<div className="col-span-full py-24 text-center space-y-4">
						<div className="w-20 h-20 bg-chocolate/5 rounded-full flex items-center justify-center mx-auto text-chocolate/10">
							<Layers size={40} />
						</div>
						<p className="text-chocolate-light font-medium italic">No collections found in the archives.</p>
					</div>
				)}
			</div>

			<Sheet open={showModal} onOpenChange={(open) => !open && closeModal()}>
				<SheetContent side="right" className="flex flex-col h-full bg-[#FAFBFD] p-0 border-l border-chocolate/10">
					<SheetHeader className="p-10 bg-white border-b border-chocolate/5 relative overflow-hidden">
						<div className="absolute top-0 right-0 w-48 h-48 bg-strawberry/5 rounded-full -mr-24 -mt-24 blur-3xl" />
						<div className="relative flex items-center gap-6">
							<div className="w-16 h-16 rounded-2xl bg-chocolate text-white flex items-center justify-center shadow-bakery transform -rotate-3 hover:rotate-0 transition-transform">
								<Tag size={28} />
							</div>
							<div>
								<SheetTitle className="text-4xl font-bold text-chocolate font-dancing">
									{editingId ? "Refine Collection" : "New Collection Registry"}
								</SheetTitle>
								<SheetDescription className="text-chocolate-light font-medium italic">
									{editingId ? "Polishing the category and its presence." : "Introducing a new chapter to our culinary story."}
								</SheetDescription>
							</div>
						</div>
					</SheetHeader>

					<form id="category-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-8">
						<div className="space-y-6">
							<div className="space-y-2 group">
								<label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Collection Name</label>
								<div className="relative">
									<Tag size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
									<input
										required
										value={form.name || ""}
										onChange={(e) => setForm({ ...form, name: e.target.value })}
										placeholder="e.g. Signature Patisserie"
										className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-medium placeholder:text-chocolate/10"
									/>
								</div>
								{errors.name && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1">{errors.name}</p>}
							</div>

							<div className="space-y-2 group">
								<label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Philosophy / Description</label>
								<div className="relative">
									<FileText size={18} className="absolute left-4 top-5 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
									<textarea
										value={form.description || ""}
										onChange={(e) => setForm({ ...form, description: e.target.value })}
										placeholder="Describe the heart and soul of this collection..."
										className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-medium placeholder:text-chocolate/10 min-h-[140px] resize-none leading-relaxed italic"
									/>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-6 pt-4 border-t border-chocolate/5">
								<div className="space-y-2 group">
									<label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Initial Display Order</label>
									<div className="relative">
										<Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
										<input
											type="number"
											value={form.items ?? 0}
											onChange={(e) => setForm({ ...form, items: e.target.value === "" ? 0 : Number(e.target.value) })}
											className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-medium"
										/>
									</div>
								</div>
								<div className="space-y-2">
									<label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Visibility Status</label>
									<select
										value={form.status}
										onChange={(e) => setForm({ ...form, status: e.target.value as any })}
										className="w-full px-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-bold text-chocolate italic appearance-none"
									>
										<option>Active</option>
										<option>Inactive</option>
									</select>
								</div>
							</div>
						</div>
					</form>

					<SheetFooter className="p-10 bg-white border-t border-chocolate/5 flex flex-row items-center justify-between">
						<button
							type="button"
							onClick={closeModal}
							className="px-8 py-3 rounded-full text-xs font-bold text-chocolate bg-white border border-chocolate/10 hover:bg-chocolate/5 transition-all uppercase tracking-widest"
						>
							Cancel
						</button>
						<button
							type="submit"
							form="category-form"
							disabled={loading}
							className="px-10 py-4 bg-chocolate text-white rounded-full font-bold shadow-bakery hover:bg-strawberry transition-all disabled:opacity-50 flex items-center gap-3 uppercase tracking-widest"
						>
							{loading && <RefreshCw size={16} className="animate-spin" />}
							{editingId ? "Preserve Changes" : "Confirm Collection"}
						</button>
					</SheetFooter>
				</SheetContent>
			</Sheet>
		</div>
	);
};

export default Categories;
