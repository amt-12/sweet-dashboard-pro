import { Plus, Search, Edit, Trash2, Filter, X, Tag, FileText, Hash, Info } from "lucide-react";
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

	useEffect(() => {
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
			.catch((err: any) => setError(err?.message || "Failed to load categories"))
			.finally(() => setLoading(false));
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
		if (!form.name || !String(form.name).trim()) next.name = "Name is required";
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
				const c =
					res && (res._id || res.id)
						? { id: res._id || res.id, ...res }
						: res && res.data
						? res.data
						: res;
				setCategories((prev) =>
					prev.map((it) =>
						String(it.id) === String(editingId)
							? {
									id: c.id,
									name: c.name,
									description: c.description,
									items: c.items,
									status: c.status,
							  }
							: it
					)
				);
				toast.success("Category updated successfully!");
			} else {
				const res: any = await api.categories.create(payload);
				const c =
					res && (res._id || res.id)
						? { id: res._id || res.id, ...res }
						: res && res.data
						? res.data
						: res;
				setCategories((prev) => [
					{ id: c.id, name: c.name, description: c.description, items: c.items, status: c.status },
					...prev,
				]);
				toast.success("New category created!");
			}
			closeModal();
		} catch (err: any) {
			setError(err?.message || "Failed to save category");
			toast.error("Failed to save category");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id: string | number) => {
		if (!confirm("Delete this category?")) return;
		setLoading(true);
		try {
			await api.categories.delete(id);
			setCategories((prev) => prev.filter((c) => String(c.id) !== String(id)));
			toast.success("Category deleted");
		} catch (err: any) {
			setError(err?.message || "Failed to delete category");
			toast.error("Failed to delete category");
		} finally {
			setLoading(false);
		}
	};

	if (loading) return <div className="p-8 text-center">Loading categories...</div>;
	if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

	return (
		<div className="space-y-8 animate-fade-in font-lora">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h2 className="text-3xl font-bold font-playfair text-[#1A2744]">
						Menu Categories{" "}
						<span className="inline-block hover:scale-110 transition-transform">🥞</span>
					</h2>
					<p className="text-[#8D6E63] mt-1">Organize your delicious offerings.</p>
				</div>
				<button
					onClick={openAdd}
					className="px-5 py-2.5 bg-[#D4A373] text-white rounded-full font-bold shadow-md hover:bg-[#c49265] transition-all flex items-center gap-2"
				>
					<Plus size={18} /> Add Category
				</button>
			</div>

			<div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-[#D4A373]/20">
				<div className="relative flex-1">
					<Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4A373] w-5 h-5" />
					<input
						type="text"
						placeholder="Search categories..."
						className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#F5ECD7]/30 text-[#1A2744] outline-none focus:ring-2 focus:ring-[#D4A373]/50 transition-all placeholder:text-[#8D6E63]/60"
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{categories.map((category) => (
					<div
						key={category.id}
						className="bg-white p-6 rounded-2xl shadow-sm border border-[#D4A373]/20 hover:shadow-bakery-lg hover:-translate-y-1 transition-all duration-300 group"
					>
						<div className="flex justify-between items-start mb-4">
							<div className="w-14 h-14 rounded-2xl bg-[#F5ECD7]/50 flex items-center justify-center text-[#D4A373] font-playfair font-bold text-2xl border border-[#D4A373]/20 shadow-inner">
								{String(category.name).charAt(0)}
							</div>
							<div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
								<button
									onClick={() => openEdit(category)}
									className="p-2 bg-[#F5ECD7] rounded-full text-[#8D6E63] hover:text-[#1A2744] hover:bg-[#D4A373] hover:text-white transition-all shadow-sm"
								>
									<Edit size={16} />
								</button>
								<button
									onClick={() => handleDelete(category.id)}
									className="p-2 bg-red-50 rounded-full text-red-400 hover:text-white hover:bg-red-500 transition-all shadow-sm"
								>
									<Trash2 size={16} />
								</button>
							</div>
						</div>
						<h3 className="text-xl font-bold font-playfair text-[#1A2744] mb-2">
							{category.name}
						</h3>
						<p className="text-sm text-[#8D6E63] mb-4 line-clamp-2">
							{category.description}
						</p>
						<div className="flex items-center justify-between pt-4 border-t border-[#D4A373]/10">
							<span className="text-xs font-bold uppercase tracking-wider bg-[#F5ECD7] px-3 py-1 rounded-full text-[#8D6E63]">
								{category.items ?? 0} Items
							</span>
							<span
								className={`text-xs font-bold ${
									category.status === "Active"
										? "text-green-600"
										: "text-gray-400"
								}`}
							>
								● {category.status}
							</span>
						</div>
					</div>
				))}
			</div>

			<Sheet open={showModal} onOpenChange={(open) => !open && closeModal()}>
				<SheetContent side="right" className="w-full md:w-[800px] p-0 flex flex-col gap-0 bg-[#FAFBFD] border-l-[#D4A373]/20">
					<SheetHeader className="p-6 bg-white border-b border-[#D4A373]/10">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-[#D4A373] flex items-center justify-center text-white">
								<Tag size={20} />
							</div>
							<div>
								<SheetTitle className="font-playfair text-2xl font-bold text-[#1A2744]">
									{editingId ? "Edit Category" : "Add Category"}
								</SheetTitle>
								<SheetDescription className="text-[#8D6E63] font-medium">
									{editingId ? "Modify the category details." : "Create a new category for your bakery."}
								</SheetDescription>
							</div>
						</div>
					</SheetHeader>

					<form id="category-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
						<div className="space-y-4">
							<div className="flex items-center gap-2 pb-2 border-b border-[#D4A373]/10">
								<Info size={16} className="text-[#D4A373]" />
								<h4 className="text-sm font-bold uppercase tracking-wider text-[#1A2744]/60">General Information</h4>
							</div>
							
							<div className="space-y-1.5">
								<label className="text-sm font-semibold text-[#1A2744] flex items-center gap-1.5">
									Category Name <span className="text-red-500">*</span>
								</label>
								<input
									required
									value={form.name || ""}
									onChange={(e) => setForm({ ...form, name: e.target.value })}
									placeholder="e.g. Special Cakes"
									className={`w-full p-3 rounded-xl bg-white border ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-[#D4A373]/20 focus:border-[#D4A373]'} outline-none shadow-sm transition-all focus:ring-2 focus:ring-[#D4A373]/10`}
								/>
								{errors.name && <p className="text-xs font-medium text-red-500 mt-1">{errors.name}</p>}
							</div>

							<div className="space-y-1.5">
								<label className="text-sm font-semibold text-[#1A2744] flex items-center gap-1.5">
									Description
								</label>
								<div className="relative">
									<FileText size={16} className="absolute left-3 top-3 text-[#1A2744]/40" />
									<textarea
										value={form.description || ""}
										onChange={(e) => setForm({ ...form, description: e.target.value })}
										placeholder="Describe this category..."
										className="w-full pl-10 pr-3 py-3 rounded-xl bg-white border border-[#D4A373]/20 outline-none shadow-sm transition-all focus:ring-2 focus:ring-[#D4A373]/10 min-h-[100px] resize-none"
									/>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-1.5">
									<label className="text-sm font-semibold text-[#1A2744] flex items-center gap-1.5">
										Initial Item Count
									</label>
									<div className="relative">
										<Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1A2744]/40" />
										<input
											type="number"
											value={form.items ?? 0}
											onChange={(e) => setForm({ ...form, items: e.target.value === "" ? 0 : Number(e.target.value) })}
											className="w-full pl-10 pr-3 py-3 rounded-xl bg-white border border-[#D4A373]/20 outline-none shadow-sm"
										/>
									</div>
								</div>
								<div className="space-y-1.5">
									<label className="text-sm font-semibold text-[#1A2744]">Status</label>
									<select
										value={form.status}
										onChange={(e) => setForm({ ...form, status: e.target.value as any })}
										className="w-full p-3 rounded-xl bg-white border border-[#D4A373]/20 outline-none shadow-sm transition-all focus:ring-2 focus:ring-[#D4A373]/10"
									>
										<option>Active</option>
										<option>Inactive</option>
									</select>
								</div>
							</div>
						</div>
					</form>

					<SheetFooter className="p-6 bg-white border-t border-[#D4A373]/10 flex flex-row justify-end gap-3">
						<button
							type="button"
							onClick={closeModal}
							className="px-6 py-2.5 rounded-xl text-sm font-bold text-[#1A2744] hover:bg-[#FAF6E6] border border-[#D4A373]/10 transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							form="category-form"
							disabled={loading}
							className={`px-8 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 shadow-lg hover:shadow-xl transition-all ${loading ? 'bg-gray-400' : 'bg-[#1A2744] hover:bg-[#D4A373] hover:text-[#1A2744]'}`}
						>
							{loading ? "Processing..." : (editingId ? "Save Changes" : "Create Category")}
						</button>
					</SheetFooter>
				</SheetContent>
			</Sheet>
		</div>
	);
};

export default Categories;
