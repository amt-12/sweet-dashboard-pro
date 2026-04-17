import { Plus, Search, Edit, Trash2, X, Scale, FileText, Hash, Info, RefreshCw, LayoutGrid, ChevronRight, Tag } from "lucide-react";
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
  categories?: any[];
};

type Category = {
  _id: string;
  name: string;
};

const emptyForm: Partial<Weight> = {
	value: undefined,
	unit: "g",
	description: "",
  categories: [],
};

const Weights = () => {
	const [weights, setWeights] = useState<Weight[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [showModal, setShowModal] = useState(false);
	const [form, setForm] = useState<Partial<Weight>>(emptyForm);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | number>("All");

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
            categories: w.categories ? w.categories.map((cat:any)=>cat._id||cat) : (w.category ? [w.category._id || w.category] : []),
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

  const fetchCategories = () => {
    api.categories.getAll()
      .then((res: any) => {
        const raw = Array.isArray(res) ? res : res && (res.data || res) ? res.data : [];
        setCategories(raw || []);
      })
      .catch(() => {
        toast.error("Failed to load categories");
      });
  };

	useEffect(() => {
		fetchWeights();
    fetchCategories();
	}, []);

	const openAdd = () => {
		setForm(emptyForm);
		setEditingId(null);
		setErrors({});
		setShowModal(true);
	};

	const openEdit = (w: Weight) => {
		const parsed = parseName(sanitizeName(w.name));
		setForm({ 
      value: parsed.value, 
      unit: parsed.unit, 
      description: w.description,
      categories: w.categories ? w.categories.map((c:any) => c._id || c) : []
    });
		setEditingId(String(w.id));
		setErrors({});
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		setForm(emptyForm);
		setEditingId(null);
		setErrors({});
    setIsCategoryDropdownOpen(false);
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
		const payload = { 
      name: composedName, 
      description: form.description || "",
      categories: form.categories || []
    };

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

	const filteredWeights = weights.filter(w => {
		const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			w.description?.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesCategory = selectedCategoryId === "All" || (w.categories && w.categories.some((catId:any) => String(catId._id||catId) === String(selectedCategoryId)));
		return matchesSearch && matchesCategory;
	});

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
            const isActive = String(selectedCategoryId) === String(cat._id);
            return (
              <button
                key={cat._id}
                onClick={() => setSelectedCategoryId(cat._id)}
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
							<TableHead className="h-16 font-bold text-chocolate/80 uppercase tracking-widest text-[10px]">Weight Name</TableHead>
							<TableHead className="h-16 font-bold text-chocolate/80 uppercase tracking-widest text-[10px]">Category</TableHead>
							<TableHead className="h-16 font-bold text-chocolate/80 uppercase tracking-widest text-[10px] hidden md:table-cell">Description</TableHead>
							<TableHead className="pr-8 h-16 font-bold text-chocolate italic uppercase tracking-widest text-[10px] text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody className="no-scrollbar">
						{filteredWeights.map((weight) => (
							<TableRow key={weight.id} className="group border-chocolate/5 hover:bg-cream/20 transition-colors">
								<TableCell className="pl-8 py-6">
									<div className="w-12 h-12 rounded-xl bg-chocolate text-white flex items-center justify-center font-dancing font-bold text-xl shadow-sm transform group-hover:rotate-3 transition-transform duration-300">
										{String(weight.name).charAt(0)}
									</div>
								</TableCell>
								<TableCell className="py-6">
									<span className="font-bold text-chocolate text-lg tracking-tight group-hover:text-strawberry transition-colors leading-none">
										{weight.name}
									</span>
								</TableCell>
                <TableCell className="py-6">
                  <div className="flex flex-wrap gap-1">
                    {(weight.categories && weight.categories.length > 0) ? weight.categories.map((cId: any) => (
                      <span key={cId} className="px-3 py-1 bg-chocolate/5 rounded-full border border-chocolate/5 text-[10px] font-bold uppercase tracking-widest text-chocolate/40 italic">
                        {categories.find(cat => String(cat._id) === String(cId))?.name || 'Unassigned'}
                      </span>
                    )) : (
                      <span className="text-chocolate/20 text-[10px] italic">Not Tagged</span>
                    )}
                  </div>
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
							<div className="w-14 h-14 rounded-2xl bg-chocolate text-white flex items-center justify-center shadow-bakery transform rotate-3 hover:rotate-0 transition-transform">
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
										value={form.unit || "g"} 
										onValueChange={(v) => setForm({ ...form, unit: v })}
									>
										<SelectTrigger className="w-full h-[52px] bg-white border-chocolate/10 rounded-2xl text-sm font-medium focus:ring-8 focus:ring-strawberry/5 outline-none transition-all">
											<SelectValue placeholder="Select Unit" />
										</SelectTrigger>
										<SelectContent className="bg-white border-chocolate/10 rounded-xl">
											<SelectItem value="g">g (Grams)</SelectItem>
											<SelectItem value="kg">kg (Kilograms)</SelectItem>
											<SelectItem value="lb">lb (Pounds)</SelectItem>
											<SelectItem value="oz">oz (Ounces)</SelectItem>
											<SelectItem value="Piece">Piece</SelectItem>
											<SelectItem value="Pound">Pound</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

              <div className="space-y-2 group">
								<label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Category</label>
								
                <div className="relative">
                  <div 
                    className="w-full p-4 h-auto bg-white border border-chocolate/10 focus-within:border-strawberry focus-within:ring-8 focus-within:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-bold text-chocolate italic cursor-pointer flex justify-between items-center"
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  >
                    <span className="truncate flex-1 text-left">
                      {form.categories && form.categories.length > 0 
                        ? form.categories.map((id:any) => categories.find(c => String(c._id) === String(id))?.name || id).join(', ')
                        : "Select Categories"}
                    </span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isCategoryDropdownOpen ? 'rotate-90' : ''}`} />
                  </div>
                  
                  {isCategoryDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-chocolate/10 rounded-2xl shadow-bakery-xl max-h-60 overflow-y-auto p-2">
                      {categories.length === 0 ? (
                        <div className="p-3 text-sm text-chocolate/50 italic text-center">Loading or no categories...</div>
                      ) : null}
                      {categories.map((c) => {
                        const catId = String(c._id);
                        const isSelected = (form.categories || []).map(String).includes(catId);
                        return (
                          <label key={catId} className="flex items-center gap-3 p-3 hover:bg-strawberry/5 rounded-xl cursor-pointer transition-colors group">
                            <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${isSelected ? 'bg-strawberry border-strawberry text-white' : 'border-chocolate/20 bg-white group-hover:border-strawberry/50'}`}>
                              {isSelected && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                            </div>
                            <input 
                              type="checkbox" 
                              className="hidden"
                              checked={isSelected}
                              onChange={(e) => {
                                const current = Array.isArray(form.categories) ? [...form.categories].map(String) : [];
                                if (e.target.checked) setForm({ ...form, categories: [...current, catId] });
                                else setForm({ ...form, categories: current.filter(id => id !== catId) });
                              }}
                            />
                            <span className={`text-sm font-bold ${isSelected ? 'text-strawberry' : 'text-chocolate'}`}>{c.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                  {isCategoryDropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setIsCategoryDropdownOpen(false)} />}
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
