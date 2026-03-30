import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { toast } from 'sonner';
import { Plus, Search, Edit, Trash2, X, FlaskConical, FileText, RefreshCw, Save, ArrowRight, Info, CheckCircle2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "../components/ui/sheet";

interface Nutrition {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  sugar: number;
}

const zeroNutrition: Nutrition = { calories: 0, carbs: 0, protein: 0, fat: 0, sugar: 0 };

interface Row {
  id: string;
  name: string;
  grams: number | string;
  per100: Nutrition;
  sourceId?: string;
}

interface Ingredient {
  _id?: string;
  id?: string;
  name: string;
  unit?: string;
}

export default function NutritionConfig() {
  const [rows, setRows] = useState<Row[]>([{
    id: String(Date.now()),
    name: '',
    grams: '',
    per100: { ...zeroNutrition }
  }]);

  const [savedIngredients, setSavedIngredients] = useState<Ingredient[]>([]);
  const [loadingIngredients, setLoadingIngredients] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchIngredients = () => {
    setLoadingIngredients(true);
    api.ingredients.getAll().then((data) => {
      const arr = Array.isArray(data) ? data : [];
      setSavedIngredients(arr.map((it: unknown) => {
        const raw = it as Record<string, unknown>;
        const _id = typeof raw._id === 'string' ? raw._id : (typeof raw.id === 'string' ? raw.id : undefined);
        const name = typeof raw.name === 'string' ? raw.name : '';
        const unit = typeof raw.unit === 'string' ? raw.unit : '';
        return { _id, name, unit } as Ingredient;
      }));
    }).catch(() => {
      toast.error("Failed to load ingredients");
    }).finally(() => setLoadingIngredients(false));
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const addRow = () => setRows(prev => ([...prev, { id: String(Date.now()) + Math.random(), name: '', grams: '', per100: { ...zeroNutrition } }]));
  const removeRow = (id: string) => setRows(prev => prev.filter(r => r.id !== id));
  const updateRow = (id: string, patch: Partial<Row>) => setRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));

  const saveIngredient = async (id: string) => {
    const row = rows.find(r => r.id === id);
    if (!row) return;
    if (!row.name) {
      toast.error('Please enter a name first');
      return;
    }
    try {
      const payload = { name: row.name, unit: String(row.grams || '') };
      const created = await api.ingredients.create(payload);
      const rawCreated = created as Record<string, unknown>;
      const createdId = typeof rawCreated._id === 'string' ? rawCreated._id : (typeof rawCreated.id === 'string' ? rawCreated.id : undefined);
      const createdName = typeof rawCreated.name === 'string' ? rawCreated.name : '';
      const createdUnit = typeof rawCreated.unit === 'string' ? rawCreated.unit : '';
      const createdItem: Ingredient = { _id: createdId, name: createdName, unit: createdUnit };
      
      setSavedIngredients(prev => [...prev, createdItem]);
      updateRow(id, { sourceId: String(createdId || '') });
      toast.success('Ingredient saved!');
    } catch (err) {
      toast.error('Failed to save ingredient');
    }
  };

  const onNameChange = (id: string, name: string) => {
    updateRow(id, { name });
    if (!name) return;
    const found = savedIngredients.find(si => (si.name || '').toLowerCase() === name.toLowerCase());
    if (found) {
      updateRow(id, { sourceId: String(found._id || found.id || '') });
    } else {
      updateRow(id, { sourceId: undefined });
    }
  };

  const deleteSavedIngredient = async (id?: string) => {
    if (!id) return;
    if (!confirm("Delete this ingredient record?")) return;
    try {
      await api.ingredients.delete(id);
      setSavedIngredients(prev => prev.filter(s => String(s._id || s.id) !== String(id)));
      toast.success('Record deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const insertSavedIngredient = (si: Ingredient) => {
    setRows(prev => ([...prev, { 
      id: String(Date.now()) + Math.random(), 
      name: si.name || '', 
      grams: si.unit || '', 
      per100: { ...zeroNutrition }, 
      sourceId: String(si._id || si.id || '') 
    }]));
    toast.success(`${si.name} added to list`);
  };

  const filteredIngredients = savedIngredients.filter(si => 
    si.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-lora">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold font-dancing text-chocolate">Ingredient Records</h2>
          <p className="text-sm text-chocolate-light font-medium mt-1">
            Build and manage your pantry of essential bakery ingredients.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchIngredients}
            className="p-3 bg-white border border-chocolate/10 rounded-full text-chocolate hover:bg-strawberry/5 transition-all shadow-sm group"
          >
            <RefreshCw size={18} className={loadingIngredients ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
          </button>
          <button 
            onClick={addRow} 
            className="px-6 py-3 bg-chocolate text-white rounded-full flex items-center gap-2 shadow-bakery hover:shadow-bakery-lg hover:bg-strawberry transition-all duration-300"
          >
            <Plus size={18} />
            <span className="font-bold text-xs uppercase tracking-widest text-[#F5ECD7]">Add New Item</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] shadow-bakery border border-chocolate/5">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-chocolate/5">
              <h3 className="text-2xl font-bold font-playfair text-chocolate flex items-center gap-3">
                <FlaskConical className="text-strawberry" size={24} />
                Pantry Builder
              </h3>
              <button 
                onClick={() => setRows([{ id: String(Date.now()), name: '', grams: '', per100: { ...zeroNutrition } }])}
                className="text-[10px] font-bold text-chocolate/40 hover:text-red-500 uppercase tracking-widest transition-colors"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-4">
              {rows.map((r, index) => (
                <div key={r.id} className="grid grid-cols-12 gap-4 items-center group/row animate-in slide-in-from-left duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="col-span-7 space-y-2 group">
                    <div className="relative">
                      <FileText size={18} className="absolute left-4 top-1/2 -translate-y-1-2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
                      <input 
                        list={`ings-${r.id}`} 
                        value={r.name} 
                        onChange={(e) => onNameChange(r.id, e.target.value)} 
                        placeholder="Ingredient name..."
                        className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-[1.5rem] text-sm outline-none transition-all font-medium placeholder:text-chocolate/10" 
                      />
                      <datalist id={`ings-${r.id}`}>
                        {savedIngredients.map(si => (<option key={si._id || si.id || si.name} value={si.name} />))}
                      </datalist>
                    </div>
                  </div>

                  <div className="col-span-3 space-y-2 group">
                    <input 
                      type="text" 
                      value={r.grams} 
                      onChange={(e) => updateRow(r.id, { grams: e.target.value })} 
                      placeholder="e.g. 500g" 
                      className="w-full px-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-[1.5rem] text-sm text-center outline-none transition-all font-bold text-chocolate/60 placeholder:text-chocolate/10" 
                    />
                  </div>

                  <div className="col-span-2 flex items-center justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                    {!r.sourceId && r.name && (
                      <button 
                        type="button" 
                        onClick={() => saveIngredient(r.id)} 
                        className="p-3 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-full transition-all shadow-sm"
                        title="Save to Records"
                      >
                        <Save size={16} />
                      </button>
                    )}
                    {r.sourceId && (
                      <div className="p-3 bg-green-50 text-green-600 rounded-full" title="Saved">
                        <CheckCircle2 size={16} />
                      </div>
                    )}
                    <button 
                      type="button" 
                      onClick={() => removeRow(r.id)} 
                      className="p-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-full transition-all shadow-sm"
                      title="Remove Row"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button 
              type="button" 
              onClick={addRow} 
              className="mt-8 w-full py-4 border-2 border-dashed border-chocolate/10 rounded-[1.5rem] text-chocolate/20 font-bold uppercase tracking-widest hover:border-strawberry/30 hover:bg-strawberry/5 hover:text-strawberry transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Add Another Ingredient
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] shadow-bakery border border-chocolate/5 flex flex-col h-[600px]">
            <h3 className="text-xl font-bold font-playfair text-chocolate mb-6 flex items-center gap-2">
              <CheckCircle2 className="text-strawberry" size={20} />
              Saved Records
            </h3>
            
            <div className="relative group mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" size={16} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find in pantry..."
                className="w-full pl-10 pr-4 py-3 bg-[#FAF6E6]/50 border border-transparent focus:bg-white focus:border-strawberry/20 rounded-xl text-xs outline-none transition-all font-medium italic"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {loadingIngredients ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <RefreshCw size={24} className="animate-spin text-chocolate/20" />
                  <p className="text-[10px] uppercase tracking-widest font-bold text-chocolate/20">Loading Pantry...</p>
                </div>
              ) : filteredIngredients.length === 0 ? (
                <div className="text-center py-20 italic text-chocolate/30 text-sm">
                  No records matching your search.
                </div>
              ) : (
                filteredIngredients.map(si => (
                  <div key={si._id || si.id || si.name} className="group/item flex items-center justify-between p-4 bg-white border border-chocolate/5 rounded-2xl hover:border-strawberry/20 hover:shadow-bakery transition-all duration-300">
                    <div>
                      <h4 className="text-sm font-bold text-chocolate group-hover/item:text-strawberry transition-colors">{si.name}</h4>
                      <p className="text-[10px] text-chocolate/40 font-bold uppercase tracking-widest mt-0.5">{si.unit || 'No unit'}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                      <button 
                        type="button" 
                        onClick={() => insertSavedIngredient(si)} 
                        className="p-2 text-strawberry hover:bg-strawberry/10 rounded-lg transition-colors"
                        title="Add to Builder"
                      >
                        <Plus size={16} />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => deleteSavedIngredient(si._id || si.id)} 
                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete record"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-chocolate/5">
              <div className="bg-strawberry/5 p-4 rounded-2xl flex items-center gap-3">
                <Info size={16} className="text-strawberry/60" />
                <p className="text-[10px] font-medium text-chocolate/60 leading-relaxed italic">
                  Quickly add saved ingredients to your builder list by clicking the plus icon.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
