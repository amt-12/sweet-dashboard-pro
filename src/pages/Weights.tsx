import { Plus, Search, Edit, Trash2, X, Scale, FileText, Hash, Info, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { toast } from "sonner";

type Weight = {
	id: string | number;
	name: string;
	value?: number;
	unit?: string;
	description?: string;
};

const emptyForm: Partial<Weight> = {
	value: undefined,
	unit: "g",
	description: "",
};

const Weights = () => {
	const [weights, setWeights] = useState<Weight[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [showModal, setShowModal] = useState(false);
	const [form, setForm] = useState<Partial<Weight>>(emptyForm);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [searchQuery, setSearchQuery] = useState("");

	const parseName = (name?: string) => {
		if (!name) return { value: undefined as number | undefined, unit: 'g' };
		const m = String(name).trim().match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z%]+)$/);
		if (m) return { value: Number(m[1]), unit: m[2] };
		return { value: undefined as number | undefined, unit: 'g' };
	};

	const sanitizeName = (n?: string) => (n || "").replace(/\(\s*\)/g, "").trim();

	const fetchWeights = () => {
		setLoading(true);
		api.weights
			.getAll()
			.then((res: any) => {
				const raw = Array.isArray(res) ? res : res && (res.data || res) ? res.data : [];
				const normalized = (raw || []).map((w: any) => {
					const name = sanitizeName(w.name);
					return ({
						id: w._id || w.id,
						name,
						description: w.description || "",
						...parseName(name),
					});
				});
				setWeights(normalized);
			})
			.catch((err: any) => {
				toast.error("Failed to load weights");
				setError(err?.message || "Failed to load weights");
			})
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		fetchWeights();
	}, []);

	const openAdd = () => {
		setForm(emptyForm);
		setEditingId(null);
		setErrors({});
		setShowModal(true);
	};

	const openEdit = (w: Weight) => {
		const parsed = parseName(sanitizeName(w.name));
		setForm({ value: parsed.value, unit: parsed.unit, description: w.description });
		setEditingId(String(w.id));
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
		if (form.value === undefined || form.value === null || Number.isNaN(Number(form.value))) next.value = "A value is required";
		if (!form.unit || !String(form.unit).trim()) next.unit = "A unit is required";
		return next;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const v = validate();
		setErrors(v);
		if (Object.keys(v).length) return;

		setLoading(true);
		const composedName = sanitizeName(`${String(form.value).trim()}${form.unit}`);
		const payload = { name: composedName, description: form.description || "" };

		try {
			if (editingId) {
				await api.weights.update(editingId, payload);
				toast.success("Weight updated!");
			} else {
				await api.weights.create(payload);
				toast.success("New weight added!");
			}
			fetchWeights();
			closeModal();
		} catch (err: any) {
			toast.error("An error occurred");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id: string | number) => {
		if (!confirm("Delete this weight?")) return;
		setLoading(true);
		try {
			await api.weights.delete(id);
			setWeights((prev) => prev.filter((c) => String(c.id) !== String(id)));
			toast.success("Weight deleted.");
		} catch (err: any) {
			toast.error("Failed to delete weight");
		} finally {
			setLoading(false);
		}
	};

	const filteredWeights = weights.filter(w => 
		w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		w.description?.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className="space-y-8 animate-in fade-in duration-700 font-lora">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
				<div>
					<h2 className="text-4xl font-bold font-dancing text-chocolate">Weights</h2>
					<p className="text-sm text-chocolate-light font-medium mt-1">
						Manage the weights and units for your bakery items.
					</p>
				</div>
				<div className="flex items-center gap-4">
					<button 
						onClick={fetchWeights}
						className="p-3 bg-white border border-chocolate/10 rounded-full text-chocolate hover:bg-strawberry/5 transition-all shadow-sm group"
					>
						<RefreshCw size={18} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
					</button>
					<button onClick={openAdd} className="px-6 py-3 bg-chocolate text-white rounded-full flex items-center gap-2 shadow-bakery hover:shadow-bakery-lg hover:bg-strawberry transition-all duration-300">
						<Plus size={18} />
						<span className="font-bold text-xs uppercase tracking-widest text-[#F5ECD7]">Add Weight</span>
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
						placeholder="Search weights..." 
						className="w-full pl-14 pr-6 py-4 rounded-2xl bg-[#FAF6E6]/50 text-chocolate outline-none border border-transparent focus:border-strawberry/20 focus:bg-white focus:ring-8 focus:ring-strawberry/5 transition-all font-medium placeholder:text-chocolate/20" 
					/>
				</div>
			</div>

			<div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-chocolate/5 shadow-bakery overflow-hidden">
				<Table>
					<TableHeader className="bg-cream/30">
						<TableRow className="border-chocolate/5 hover:bg-transparent">
							<TableHead className="w-20 pl-8 h-16 font-bold text-chocolate italic uppercase tracking-widest text-[10px]">Icon</TableHead>
							<TableHead className="h-16 font-bold text-chocolate/80 uppercase tracking-widest text-[10px]">Weight Name</TableHead>
							<TableHead className="h-16 font-bold text-chocolate/80 uppercase tracking-widest text-[10px] hidden md:table-cell">Description</TableHead>
							<TableHead className="pr-8 h-16 font-bold text-chocolate italic uppercase tracking-widest text-[10px] text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody className="no-scrollbar">
						{filteredWeights.map((weight) => (
							<TableRow key={weight.id} className="group border-chocolate/5 hover:bg-cream/20 transition-colors">
								<TableCell className="pl-8 py-6">
									<div className="w-12 h-12 rounded-xl bg-chocolate text-white flex items-center justify-center font-dancing font-bold text-xl shadow-sm transform group-hover:-rotate-3 transition-transform duration-300">
										{String(weight.name).charAt(0)}
									</div>
								</TableCell>
								<TableCell className="py-6">
									<span className="font-bold text-chocolate text-lg tracking-tight group-hover:text-strawberry transition-colors">
										{weight.name}
									</span>
								</TableCell>
								<TableCell className="py-6 hidden md:table-cell max-w-md">
									<p className="text-sm text-chocolate/40 font-medium italic line-clamp-1 leading-relaxed">
										{weight.description || "No description provided."}
									</p>
								</TableCell>
								<TableCell className="py-6 pr-8 text-right">
									<div className="flex items-center justify-end gap-2 shrink-0 transition-all">
										<button
											onClick={() => openEdit(weight)}
											className="p-2.5 bg-white border border-chocolate/10 rounded-full text-chocolate hover:bg-chocolate hover:text-white transition-all shadow-sm"
										>
											<Edit size={14} />
										</button>
										<button
											onClick={() => handleDelete(weight.id)}
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
				
				{filteredWeights.length === 0 && !loading && (
					<div className="py-24 text-center space-y-4 bg-white/40">
						<div className="w-16 h-16 bg-chocolate/5 rounded-full flex items-center justify-center mx-auto text-chocolate/10">
							<Scale size={32} />
						</div>
						<p className="text-chocolate-light font-medium italic">No weights found in the archives.</p>
					</div>
				)}
			</div>

			<Dialog open={showModal} onOpenChange={(open) => !open && closeModal()}>
				<DialogContent className="max-w-2xl bg-[#FAFBFD] p-0 border-none overflow-hidden rounded-[2.5rem] shadow-2xl">
					<DialogHeader className="p-8 bg-white border-b border-chocolate/5 relative overflow-hidden">
						<div className="absolute top-0 right-0 w-48 h-48 bg-strawberry/5 rounded-full -mr-24 -mt-24 blur-3xl" />
						<div className="relative flex items-center gap-6">
							<div className="w-14 h-14 rounded-2xl bg-chocolate text-white flex items-center justify-center shadow-bakery transform -rotate-3 hover:rotate-0 transition-transform">
								<Scale size={24} />
							</div>
							<div>
								<DialogTitle className="text-3xl font-bold text-chocolate font-dancing">
									{editingId ? "Edit Weight" : "Add New Weight"}
								</DialogTitle>
								<DialogDescription className="text-chocolate-light font-medium mt-1">
									{editingId ? "Update the weight measurement details." : "Add a new weight unit for your products."}
								</DialogDescription>
							</div>
						</div>
					</DialogHeader>

					<form id="weight-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar max-h-[60vh]">
						<div className="space-y-6">
							<div className="grid grid-cols-2 gap-6">
								<div className="space-y-2 group">
									<label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Weight Value</label>
									<div className="relative">
										<Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
										<input 
											type="number" 
											step="any" 
											required
											value={form.value ?? ""} 
											onChange={(e) => setForm({ ...form, value: e.target.value ? Number(e.target.value) : undefined })} 
											placeholder="e.g. 500"
											className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-medium" 
										/>
									</div>
									{errors.value && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1">{errors.value}</p>}
								</div>

								<div className="space-y-2 group">
									<label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Unit</label>
                  <Select
                    value={form.unit || 'g'}
                    onValueChange={(val) => setForm({ ...form, unit: val })}
                  >
                    <SelectTrigger className="w-full p-4 h-auto bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-bold text-chocolate italic tracking-wide group">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-chocolate/10 shadow-bakery-xl font-lora">
                      <SelectItem value="g" className="focus:bg-strawberry/5 focus:text-strawberry py-3">Grams (g)</SelectItem>
                      <SelectItem value="kg" className="focus:bg-strawberry/5 focus:text-strawberry py-3">Kilograms (kg)</SelectItem>
                      <SelectItem value="mg" className="focus:bg-strawberry/5 focus:text-strawberry py-3">Milligrams (mg)</SelectItem>
                      <SelectItem value="lb" className="focus:bg-strawberry/5 focus:text-strawberry py-3">Pounds (lb)</SelectItem>
                    </SelectContent>
                  </Select>
									{errors.unit && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1">{errors.unit}</p>}
								</div>
							</div>

							<div className="space-y-2 group">
								<label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Description</label>
								<div className="relative">
									<FileText size={18} className="absolute left-4 top-5 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
									<textarea 
										value={form.description || ""} 
										onChange={(e) => setForm({ ...form, description: e.target.value })} 
										placeholder="Enter weight description..."
										className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-medium min-h-[120px] resize-none leading-relaxed italic"
									/>
								</div>
							</div>
						</div>
					</form>

					<DialogFooter className="p-8 bg-white border-t border-chocolate/5 flex flex-row items-center justify-between gap-4">
						<button type="button" onClick={closeModal} className="px-8 py-3 rounded-full text-xs font-bold text-chocolate/60 bg-white border border-chocolate/10 hover:bg-chocolate/5 transition-all uppercase tracking-widest font-lora">
							Cancel
						</button>
						<button type="submit" form="weight-form" disabled={loading} className="px-10 py-4 bg-chocolate text-white rounded-full font-bold shadow-bakery hover:bg-strawberry transition-all disabled:opacity-50 flex items-center gap-3 uppercase tracking-widest">
							{loading && <RefreshCw size={16} className="animate-spin" />}
							{editingId ? "Update Weight" : "Add Weight"}
						</button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default Weights;
