import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import axiosInstance, { api } from '../services/api';
import { Plus, Search, Edit, Trash2, X, FlaskConical, FileText, RefreshCw, Save, ArrowRight, Info, Sparkles, Hash, Beaker, ChevronRight, Package, Calculator } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

interface Nutrition {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  sugar: number;
}

const initialNutrition: Nutrition = { calories: 0, carbs: 0, protein: 0, fat: 0, sugar: 0 };

type NutrientValue = number | { value: number; unit?: string };
interface IngredientDetail { _id?: string; id?: string; name: string; unit?: string; nutritionPer100g?: Record<string, NutrientValue>; createdAt?: string; }
interface SimpleIngredient { _id?: string; id?: string; name: string; unit?: string; nutritionPer100g?: Partial<Nutrition>; }

export default function IngredientConfig() {
  const [name, setName] = useState('');
  const [nutrientsList, setNutrientsList] = useState<Array<{ key: string; value: number }>>([]);
  const [saving, setSaving] = useState(false);
  const [savedIngredients, setSavedIngredients] = useState<SimpleIngredient[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [detailsList, setDetailsList] = useState<IngredientDetail[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoadingSaved(true);
    api?.ingredients?.getAll().then(data => {
      if (!mounted) return;
      const arr = Array.isArray(data) ? data : [];
      const normalizedIngredients = arr.map((it: unknown) => {
        const raw = it as Record<string, unknown>;
        return {
          _id: typeof raw._id === 'string' ? raw._id : (typeof raw.id === 'string' ? raw.id : undefined),
          id: typeof raw.id === 'string' ? raw.id : undefined,
          name: typeof raw.name === 'string' ? raw.name : '',
          unit: typeof raw.unit === 'string' ? raw.unit : '',
          nutritionPer100g: typeof raw.nutritionPer100g === 'object' ? (raw.nutritionPer100g as Partial<Nutrition>) : undefined,
        } as SimpleIngredient;
      });
      setSavedIngredients(normalizedIngredients);
    }).catch((err) => {
      console.error('Failed to load ingredients', err);
      setSavedIngredients([]);
    }).finally(() => { if (mounted) setLoadingSaved(false); });

    const loadDetails = async () => {
      setLoadingDetails(true);
      try {
        const items = (await api?.ingredientDetails?.getAll()) || [];
        if (!mounted) return;
        setDetailsList(Array.isArray(items) ? items : []);
      } catch (err) {
        console.error('Failed to load ingredient details', err);
        if (mounted) setDetailsList([]);
      } finally {
        if (mounted) setLoadingDetails(false);
      }
    };
    loadDetails();

    return () => { mounted = false; };
  }, []);

  const reloadDetails = async () => {
    setLoadingDetails(true);
    try {
      const items = (await api?.ingredientDetails?.getAll()) || [];
      setDetailsList(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Failed to reload details', err);
      setDetailsList([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const addNutrientRow = () => setNutrientsList(prev => ([...prev, { key: (savedIngredients[0]?.name || ''), value: 0 }]));
  const removeNutrientRow = (i: number) => setNutrientsList(prev => prev.filter((_, idx) => idx !== i));
  const updateNutrientRow = (i: number, patch: Partial<{ key: string; value: number }>) => setNutrientsList(prev => prev.map((r, idx) => idx === i ? ({ ...r, ...patch }) : r));

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) { toast.error('Ingredient name required'); return; }
    setSaving(true);
    try {
      const nutritionObj = nutrientsList.reduce((acc, cur) => {
        if (!cur.key) return acc;
        const matched = savedIngredients.find(s => s.name === cur.key);
        if (matched && matched.unit) {
          acc[cur.key] = { value: cur.value, unit: matched.unit };
        } else {
          acc[cur.key] = cur.value;
        }
        return acc;
      }, {} as Record<string, number | { value: number; unit?: string }>);
      const payload = { name: name.trim(), nutritionPer100g: nutritionObj };
      
      if (editingId) {
        if (api?.ingredientDetails?.update) {
          await api.ingredientDetails.update(editingId, payload);
        } else {
          await axiosInstance.put(`/ingredient-details/${editingId}`, payload);
        }
        toast.success('Element updated!');
      } else {
        if (api?.ingredientDetails?.create) {
          await api.ingredientDetails.create(payload);
        } else if (api?.ingredients?.create) {
          await api.ingredients.create(payload);
        } else {
          await axiosInstance.post('/ingredient-details', payload);
        }
        toast.success('New element saved!');
      }
      
      setName('');
      setNutrientsList([]);
      setEditingId(null);
      setShowModal(false);
      await reloadDetails();
    } catch (err: unknown) {
      toast.error('Failed to save element');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: IngredientDetail) => {
    setEditingId(item._id || item.id || null);
    setName(item.name || '');
    const rows: Array<{ key: string; value: number }> = [];
    const obj = item.nutritionPer100g || {};
    Object.entries(obj).forEach(([k, v]) => {
      if (typeof v === 'number') {
        rows.push({ key: k, value: v });
      } else if (v && typeof v === 'object' && 'value' in v && typeof (v as { value?: unknown }).value === 'number') {
        rows.push({ key: k, value: (v as { value: number }).value });
      } else {
        rows.push({ key: k, value: 0 });
      }
    });
    setNutrientsList(rows);
    setShowModal(true);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm('Remove this element from your library?')) return;
    try {
      if (api?.ingredientDetails?.delete) {
        await api.ingredientDetails.delete(id);
      } else {
        await axiosInstance.delete(`/ingredient-details/${id}`);
      }
      toast.success('Element removed.');
      await reloadDetails();
    } catch (err) {
      toast.error('Failed to remove element');
    }
  };

  const filteredDetails = detailsList.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 font-lora pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold font-dancing text-chocolate">Ingredient Details</h2>
          <p className="text-sm text-chocolate-light font-medium mt-1">
            Manage the composition and nutritional breakdown of your ingredients.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={reloadDetails}
            className="p-3 bg-white border border-chocolate/10 rounded-full text-chocolate hover:bg-strawberry/5 transition-all shadow-sm group"
          >
            <RefreshCw size={18} className={loadingDetails ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
          </button>
          <button 
            onClick={() => { setName(''); setNutrientsList([]); setEditingId(null); setShowModal(true); }} 
            className="px-6 py-3 bg-chocolate text-white rounded-full flex items-center gap-2 shadow-bakery hover:shadow-bakery-lg hover:bg-strawberry transition-all duration-300"
          >
            <Plus size={18} />
            <span className="font-bold text-xs uppercase tracking-widest text-[#F5ECD7]">Add Ingredient</span>
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
            placeholder="Search elements..." 
            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-[#FAF6E6]/50 text-chocolate outline-none border border-transparent focus:border-strawberry/20 focus:bg-white focus:ring-8 focus:ring-strawberry/5 transition-all font-medium placeholder:text-chocolate/20" 
          />
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] shadow-bakery border border-chocolate/5 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-chocolate/5 hover:bg-transparent">
              <TableHead className="w-20 pl-8 h-16 font-bold text-chocolate italic uppercase tracking-widest text-[10px]">Icon</TableHead>
              <TableHead className="h-16 font-bold text-chocolate/80 uppercase tracking-widest text-[10px]">Ingredient Name</TableHead>
              <TableHead className="h-16 font-bold text-chocolate/80 uppercase tracking-widest text-[10px] hidden lg:table-cell">Composition Breakdown</TableHead>
              <TableHead className="pr-8 h-16 font-bold text-chocolate italic uppercase tracking-widest text-[10px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDetails.map((item) => (
              <TableRow key={item._id || item.id} className="group border-chocolate/5 hover:bg-strawberry/[0.02] transition-colors duration-500">
                <TableCell className="py-6 pl-8">
                  <div className="w-12 h-12 rounded-xl bg-chocolate/5 text-chocolate flex items-center justify-center font-dancing font-bold text-xl group-hover:bg-chocolate group-hover:text-white transition-all duration-500 shadow-sm overflow-hidden">
                    {String(item.name).charAt(0)}
                  </div>
                </TableCell>
                <TableCell className="py-6">
                  <div className="space-y-1">
                    <span className="font-bold text-chocolate text-lg tracking-tight group-hover:text-strawberry transition-colors leading-none block">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-chocolate/20 uppercase tracking-widest">
                      <Calculator size={10} />
                      Analysis per 100g
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-6 hidden lg:table-cell">
                  <div className="flex flex-wrap gap-2 max-w-xl">
                    {item.nutritionPer100g && Object.entries(item.nutritionPer100g).length > 0 ? (
                      Object.entries(item.nutritionPer100g).slice(0, 4).map(([k, v]) => {
                        let val = typeof v === 'number' ? v : (v as { value: number }).value;
                        let unit = typeof v === 'number' ? 'g' : ((v as { unit?: string }).unit || 'g');
                        return (
                          <div key={k} className="flex items-center gap-2 bg-white border border-chocolate/5 px-2.5 py-1 rounded-full shadow-sm">
                            <span className="text-[9px] font-bold text-chocolate/30 uppercase tracking-wider">{k}</span>
                            <span className="text-[9px] font-black text-strawberry">{val}{unit}</span>
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-xs text-chocolate/20 italic">No composition defined</span>
                    )}
                    {item.nutritionPer100g && Object.keys(item.nutritionPer100g).length > 4 && (
                      <span className="text-[9px] text-chocolate/20 font-bold italic pt-1.5">
                        +{Object.keys(item.nutritionPer100g).length - 4} more nutrients
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-6 pr-8 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-3 bg-white border border-chocolate/10 rounded-full text-chocolate hover:bg-chocolate hover:text-white transition-all shadow-sm active:scale-95 group/btn"
                      title="Edit Ingredient"
                    >
                      <Edit size={16} className="group-hover/btn:rotate-12 transition-transform" />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id || item.id)}
                      className="p-3 bg-white border border-red-100 rounded-full text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95 group/btn"
                      title="Delete Ingredient"
                    >
                      <Trash2 size={16} className="group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            
            {(filteredDetails.length === 0 && !loadingDetails) && (
              <TableRow>
                <TableCell colSpan={4} className="py-32 text-center">
                  <div className="flex flex-col items-center gap-6 animate-in fade-in duration-700">
                    <div className="w-24 h-24 bg-cream/50 rounded-full flex items-center justify-center text-chocolate/10 transform -rotate-12 shadow-inner">
                      <Beaker size={48} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold font-playfair text-chocolate">The Library is Quiet</h3>
                      <p className="text-chocolate-light font-medium italic mt-2">Start by defining the first ingredient profile in your collection.</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showModal} onOpenChange={(open) => !open && setShowModal(false)}>
        <DialogContent className="max-w-[95vw] md:max-w-2xl h-[90vh] flex flex-col p-0 bg-[#FAFBFD] border-none overflow-hidden rounded-[2.5rem]">
          <DialogHeader className="p-10 bg-white border-b border-chocolate/5 relative shrink-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-strawberry/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="relative flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-chocolate text-white flex items-center justify-center shadow-bakery transform rotate-3">
                <Beaker size={28} />
              </div>
              <div>
                <DialogTitle className="text-4xl font-bold text-chocolate font-dancing">
                  {editingId ? "Refine Ingredient" : "Add Ingredient"}
                </DialogTitle>
                <DialogDescription className="text-chocolate-light font-medium italic">
                  {editingId ? "Update the nutrition breakdown of this ingredient." : "Register a new ingredient profile in your collection."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form id="ingredient-form" onSubmit={handleSave} className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
            <div className="space-y-8">
              <div className="space-y-2 group">
                <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Ingredient Name</label>
                <div className="relative">
                  <FileText size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
                  <input 
                    required
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="e.g. Madagascan Vanilla Extract"
                    className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-medium placeholder:text-chocolate/10 shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-chocolate/5 pb-4">
                  <div>
                    <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Nutritional Breakdown</label>
                    <p className="text-[9px] text-chocolate/20 italic ml-1 mt-1">Values per 100g of ingredient</p>
                  </div>
                  <button type="button" onClick={addNutrientRow} className="px-4 py-2 bg-strawberry/5 text-strawberry text-[9px] font-bold uppercase tracking-widest rounded-full hover:bg-strawberry hover:text-white transition-all flex items-center gap-2 border border-strawberry/10">
                    <Plus size={12} /> Add Nutrient
                  </button>
                </div>

                <div className="space-y-4">
                  {nutrientsList.map((row, i) => (
                    <div key={i} className="flex items-center gap-4 group/row p-6 bg-white border border-chocolate/10 rounded-[2rem] hover:border-strawberry/30 transition-all shadow-sm relative overflow-hidden">
                      <div className="absolute left-0 top-0 w-1 h-full bg-chocolate/5 group-hover/row:bg-strawberry/40 transition-all" />
                      <div className="flex-1 relative">
                        <select 
                            value={row.key} 
                            onChange={e => updateNutrientRow(i, { key: e.target.value })} 
                            className="w-full bg-transparent text-xs font-bold text-chocolate outline-none italic appearance-none"
                        >
                            <option value="">Select Nutrient...</option>
                            {savedIngredients.map(ing => (
                            <option key={ing._id || ing.id} value={ing.name}>
                                {ing.name}{ing.unit ? ` (${ing.unit})` : ''}
                            </option>
                            ))}
                        </select>
                        <ChevronRight size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-chocolate/10 rotate-90" />
                      </div>
                      
                      <div className="w-[1px] h-8 bg-chocolate/5" />

                      <div className="w-28 relative">
                        <input 
                          type="number" 
                          value={row.value === 0 ? "" : row.value} 
                          onChange={e => updateNutrientRow(i, { value: Number(e.target.value) || 0 })} 
                          className="w-full py-1 bg-transparent border-b border-chocolate/10 focus:border-strawberry text-center text-sm font-bold text-chocolate outline-none" 
                          placeholder="Amount"
                        />
                        <span className="absolute right-4 bottom-1 text-[8px] font-bold text-chocolate/20 uppercase">Qty</span>
                      </div>

                      <button type="button" onClick={() => removeNutrientRow(i)} className="p-3 text-chocolate/10 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {nutrientsList.length === 0 && (
                    <div className="text-center py-20 bg-chocolate/5 border border-dashed border-chocolate/10 rounded-[2.5rem] flex flex-col items-center gap-4">
                      <Calculator size={40} className="text-chocolate/5" />
                      <p className="text-[10px] text-chocolate/30 font-bold uppercase tracking-widest italic leading-relaxed px-10">
                        No nutritional values added. <br/> Press the button above to begin breakdown.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>

          <DialogFooter className="p-10 bg-white border-t border-chocolate/5 flex flex-row justify-between items-center shrink-0">
            <button type="button" onClick={() => setShowModal(false)} className="px-10 py-4 rounded-full text-xs font-bold text-chocolate bg-white border border-chocolate/10 hover:bg-chocolate/5 transition-all uppercase tracking-[0.2em] italic">
              Cancel
            </button>
            <button type="submit" form="ingredient-form" disabled={saving} className="px-12 py-4 bg-chocolate text-white rounded-full font-bold shadow-bakery hover:bg-strawberry transition-all disabled:opacity-50 flex items-center gap-3 uppercase tracking-[0.2em]">
              {saving && <RefreshCw size={18} className="animate-spin" />}
              {editingId ? "Update Details" : "Save Details"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
