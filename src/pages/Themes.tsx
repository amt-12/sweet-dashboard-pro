import { Plus, Search, Edit, Trash2, X, Sparkles, FileText, Info, RefreshCw } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { api } from "../services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { toast } from "sonner";

type Theme = {
	id: string | number;
	name: string;
	description?: string;
	subthemes?: string[];
};

const emptyForm: Partial<Theme> = {
	name: "",
	description: "",
	subthemes: [],
};

const Themes = () => {
	const [themes, setThemes] = useState<Theme[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [showModal, setShowModal] = useState(false);
	const [form, setForm] = useState<Partial<Theme>>(emptyForm);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [searchQuery, setSearchQuery] = useState("");

	const sanitizeName = (n?: string) => (n || "").replace(/\(\s*\)/g, "").trim();
	const sanitizeSub = (s?: string) => (s || "").trim();

	const fetchThemes = useCallback(() => {
		setLoading(true);
		api.themes
			.getAll()
			.then((res: unknown) => {
				let rawArr: unknown[] = [];
				if (Array.isArray(res)) {
					rawArr = res as unknown[];
				} else if (res && typeof res === "object") {
					const maybeData = (res as Record<string, unknown>)["data"];
					if (Array.isArray(maybeData)) rawArr = maybeData;
				}

				const normalized = (rawArr || []).map((t: unknown) => {
					const obj = t as Record<string, unknown>;
					const id = obj["_id"] ?? obj["id"] ?? undefined;
					const name = sanitizeName(String(obj["name"] ?? ""));
					const description = String(obj["description"] ?? "");

					let subthemes: string[] = [];
					const candidateKeys = ["subthemes", "subThemes", "sub_themes"];
					for (const k of candidateKeys) {
						const val = obj[k];
						if (Array.isArray(val)) {
							subthemes = (val as unknown[]).map((s) => String(s ?? "").trim()).filter(Boolean);
							break;
						}
					}

					return { id, name, description, subthemes };
				});
				setThemes(normalized as Theme[]);
			})
			.catch((err: unknown) => {
				const msg = err instanceof Error ? err.message : String(err);
				toast.error("Failed to load themes");
				setError(msg || "Failed to load themes");
			})
			.finally(() => setLoading(false));
	}, []);

	useEffect(() => {
		fetchThemes();
	}, [fetchThemes]);

	const openAdd = () => {
		setForm(emptyForm);
		setEditingId(null);
		setErrors({});
		setShowModal(true);
	};

	const openEdit = (t: Theme) => {
		setForm({ name: t.name, description: t.description, subthemes: t.subthemes || [] });
		setEditingId(String(t.id));
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
		if (!form.name || !String(form.name).trim()) next.name = "A name is required for this theme";
		return next;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const v = validate();
		setErrors(v);
		if (Object.keys(v).length) return;

		setLoading(true);
		const payload = { name: sanitizeName(form.name), description: form.description || "" } as {
			name: string;
			description: string;
			subthemes?: string[];
		};
		payload.subthemes = (form.subthemes || []).map((s) => sanitizeSub(s)).filter(Boolean);

		try {
			if (editingId) {
				await api.themes.update(editingId, payload);
				toast.success("Theme updated!");
			} else {
				await api.themes.create(payload);
				toast.success("New theme added!");
			}
			fetchThemes();
			closeModal();
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			toast.error("Failed to save theme");
			console.error(msg);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id: string | number) => {
		if (!confirm("Delete this theme?")) return;
		setLoading(true);
		try {
			await api.themes.delete(id);
			setThemes((prev) => prev.filter((c) => String(c.id) !== String(id)));
			toast.success("Theme deleted.");
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			toast.error("Failed to delete theme");
			console.error(msg);
		} finally {
			setLoading(false);
		}
	};

	const filteredThemes = themes.filter(t => 
		t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		t.description?.toLowerCase().includes(searchQuery.toLowerCase())
	);

	// helpers to manage subthemes in the form
	const addSubtheme = () => {
		setForm((prev) => ({ ...(prev || {}), subthemes: [...(prev?.subthemes || []), ""] }));
	};
	const updateSubtheme = (index: number, value: string) => {
		setForm((prev) => {
			const next = { ...(prev || {}) } as Partial<Theme> & { subthemes?: string[] };
			next.subthemes = [...(next.subthemes || [])];
			next.subthemes[index] = value;
			return next;
		});
	};
	const removeSubtheme = (index: number) => {
		setForm((prev) => {
			const next = { ...(prev || {}) } as Partial<Theme> & { subthemes?: string[] };
			next.subthemes = [...(next.subthemes || [])];
			next.subthemes.splice(index, 1);
			return next;
		});
	};

	return (
		<div className="space-y-8 animate-in fade-in duration-700 font-lora">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
				<div>
					<h2 className="text-4xl font-bold font-dancing text-chocolate">Themes</h2>
					<p className="text-sm text-chocolate-light font-medium mt-1">
						Manage artistic and creative themes for your specialty bakery.
					</p>
				</div>
				<div className="flex items-center gap-4">
					<button 
						onClick={fetchThemes}
						className="p-3 bg-white border border-chocolate/10 rounded-full text-chocolate hover:bg-strawberry/5 transition-all shadow-sm group"
					>
						<RefreshCw size={18} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
					</button>
					<button onClick={openAdd} className="px-6 py-3 bg-chocolate text-white rounded-full flex items-center gap-2 shadow-bakery hover:shadow-bakery-lg hover:bg-strawberry transition-all duration-300">
						<Plus size={18} />
						<span className="font-bold text-xs uppercase tracking-widest text-[#F5ECD7]">Add Theme</span>
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
						placeholder="Search themes..." 
						className="w-full pl-14 pr-6 py-4 rounded-2xl bg-[#FAF6E6]/50 text-chocolate outline-none border border-transparent focus:border-strawberry/20 focus:bg-white focus:ring-8 focus:ring-strawberry/5 transition-all font-medium placeholder:text-chocolate/20" 
					/>
				</div>
			</div>

			<div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-chocolate/5 shadow-bakery overflow-hidden">
				<Table>
					<TableHeader className="bg-cream/30">
						<TableRow className="border-chocolate/5 hover:bg-transparent">
							<TableHead className="w-20 pl-8 h-16 font-bold text-chocolate italic uppercase tracking-widest text-[10px]">Icon</TableHead>
							<TableHead className="h-16 font-bold text-chocolate/80 uppercase tracking-widest text-[10px]">Theme Name</TableHead>
							<TableHead className="h-16 font-bold text-chocolate/80 uppercase tracking-widest text-[10px] hidden lg:table-cell">Subthemes</TableHead>
							<TableHead className="h-16 font-bold text-chocolate/80 uppercase tracking-widest text-[10px] hidden md:table-cell">Description</TableHead>
							<TableHead className="pr-8 h-16 font-bold text-chocolate italic uppercase tracking-widest text-[10px] text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody className="no-scrollbar">
						{filteredThemes.map((theme) => (
							<TableRow key={theme.id} className="group border-chocolate/5 hover:bg-cream/20 transition-colors">
								<TableCell className="pl-8 py-6">
									<div className="w-12 h-12 rounded-xl bg-chocolate text-white flex items-center justify-center font-dancing font-bold text-xl shadow-sm transform group-hover:rotate-3 transition-transform duration-300">
										{String(theme.name).charAt(0)}
									</div>
								</TableCell>
								<TableCell className="py-6">
									<span className="font-bold text-chocolate text-lg tracking-tight group-hover:text-strawberry transition-colors leading-none">
										{theme.name}
									</span>
								</TableCell>
								<TableCell className="py-6 hidden lg:table-cell">
									{theme.subthemes && theme.subthemes.length > 0 ? (
										<div className="flex flex-wrap gap-1.5">
											{theme.subthemes.slice(0, 3).map((s, i) => (
												<span key={i} className="text-[9px] bg-strawberry/10 text-strawberry px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{s}</span>
											))}
											{theme.subthemes.length > 3 && (
												<span className="text-[9px] text-chocolate/20 font-bold italic">+{theme.subthemes.length - 3} more</span>
											)}
										</div>
									) : (
										<span className="text-xs text-chocolate/20 italic">None</span>
									)}
								</TableCell>
								<TableCell className="py-6 hidden md:table-cell max-w-md">
									<p className="text-sm text-chocolate/40 font-medium italic line-clamp-1 leading-relaxed">
										{theme.description || "No description provided."}
									</p>
								</TableCell>
								<TableCell className="py-6 pr-8 text-right">
									<div className="flex items-center justify-end gap-2 shrink-0 transition-all">
										<button
											onClick={() => openEdit(theme)}
											className="p-2.5 bg-white border border-chocolate/10 rounded-full text-chocolate hover:bg-chocolate hover:text-white transition-all shadow-sm"
										>
											<Edit size={14} />
										</button>
										<button
											onClick={() => handleDelete(theme.id)}
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
				
				{filteredThemes.length === 0 && !loading && (
					<div className="py-24 text-center space-y-4 bg-white/40">
						<div className="w-16 h-16 bg-chocolate/5 rounded-full flex items-center justify-center mx-auto text-chocolate/10">
							<Sparkles size={32} />
						</div>
						<p className="text-chocolate-light font-medium italic">No themes found in the archives.</p>
					</div>
				)}
			</div>

			<Dialog open={showModal} onOpenChange={(open) => !open && closeModal()}>
				<DialogContent className="max-w-2xl bg-[#FAFBFD] p-0 border-none overflow-hidden rounded-[2.5rem] shadow-2xl">
					<DialogHeader className="p-8 bg-white border-b border-chocolate/5 relative overflow-hidden">
						<div className="absolute top-0 right-0 w-48 h-48 bg-strawberry/5 rounded-full -mr-24 -mt-24 blur-3xl" />
						<div className="relative flex items-center gap-6">
							<div className="w-14 h-14 rounded-2xl bg-chocolate text-white flex items-center justify-center shadow-bakery transform rotate-3 hover:rotate-0 transition-transform">
								<Sparkles size={24} />
							</div>
							<div>
								<DialogTitle className="text-3xl font-bold text-chocolate font-dancing">
									{editingId ? "Edit Theme" : "Add New Theme"}
								</DialogTitle>
								<DialogDescription className="text-chocolate-light font-medium mt-1">
									{editingId ? "Update the name and details for this theme." : "Add a new creative theme for your products."}
								</DialogDescription>
							</div>
						</div>
					</DialogHeader>

					<form id="theme-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar max-h-[60vh]">
						<div className="space-y-6">
							<div className="space-y-2 group">
								<label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Theme Name</label>
								<div className="relative">
									<Sparkles size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
									<input 
										required
										value={form.name || ""} 
										onChange={(e) => setForm({ ...form, name: e.target.value })} 
										placeholder="e.g. Vintage Floral"
										className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-medium placeholder:text-chocolate/10"
									/>
								</div>
								{errors.name && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1">{errors.name}</p>}
							</div>

							{/* Subthemes block */}
							<div className="space-y-2 group">
								<label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Subthemes</label>
								<div className="space-y-2">
									{(form.subthemes || []).map((s, idx) => (
										<div key={idx} className="flex items-center gap-2">
											<input
												value={s}
												onChange={(e) => updateSubtheme(idx, e.target.value)}
												placeholder={`Subtheme ${idx + 1}`}
												className="flex-1 pl-4 pr-3 py-3 bg-white border border-chocolate/10 rounded-2xl text-sm outline-none transition-all font-medium"
											/>
											<button type="button" onClick={() => removeSubtheme(idx)} className="p-2 bg-red-50 text-red-400 rounded-full border border-red-100 hover:bg-red-500 hover:text-white transition-all">
												<X size={14} />
											</button>
										</div>
									))}
									<button type="button" onClick={addSubtheme} className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-white border border-chocolate/10 rounded-full shadow-sm hover:bg-chocolate/5 transition-all">
										<Plus size={14} />
										<span className="text-xs font-bold uppercase tracking-wider">Add Subtheme</span>
									</button>
								</div>
							</div>

							<div className="space-y-2 group">
								<label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Description</label>
								<div className="relative">
									<FileText size={18} className="absolute left-4 top-5 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
									<textarea 
										value={form.description || ""} 
										onChange={(e) => setForm({ ...form, description: e.target.value })} 
										placeholder="Enter details for this theme..."
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
						<button type="submit" form="theme-form" disabled={loading} className="px-10 py-4 bg-chocolate text-white rounded-full font-bold shadow-bakery hover:bg-strawberry transition-all disabled:opacity-50 flex items-center gap-3 uppercase tracking-widest">
							{loading && <RefreshCw size={16} className="animate-spin" />}
							{editingId ? "Update Theme" : "Add Theme"}
						</button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default Themes;
