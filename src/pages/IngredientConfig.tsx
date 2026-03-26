import React, { useState } from 'react';
import { toast } from 'sonner';
import axiosInstance, { api } from '../services/api';

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
  // multiple nutrient rows under a single ingredient (keys are dynamic strings from API)
  const [nutrientsList, setNutrientsList] = useState<Array<{ key: string; value: number }>>([]);
  const [saving, setSaving] = useState(false);
  const [savedIngredients, setSavedIngredients] = useState<SimpleIngredient[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [detailsList, setDetailsList] = useState<IngredientDetail[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    setLoadingSaved(true);
    // load dropdown options from existing /api/ingredients (keeps old Ingredient list for selection)
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

    // load ingredient-details list for viewing/editing
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

  // helper to reload details list from API
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
  const removeNutrientRow = (i: number) => setNutrientsList(prev => prev.length > 1 ? prev.filter((_, idx) => idx !== i) : []);
  const updateNutrientRow = (i: number, patch: Partial<{ key: string; value: number }>) => setNutrientsList(prev => prev.map((r, idx) => idx === i ? ({ ...r, ...patch }) : r));

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Ingredient name required'); return; }
    setSaving(true);
    try {
      // assemble nutrition object from rows — include unit when available from the selected ingredient
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
      // prefer named api wrapper if present; perform update when editing
      if (editingId) {
        if (api?.ingredientDetails?.update) {
          await api.ingredientDetails.update(editingId, payload);
        } else {
          await axiosInstance.put(`/ingredient-details/${editingId}`, payload);
        }
      } else {
        if (api?.ingredientDetails?.create) {
          await api.ingredientDetails.create(payload);
        } else if (api?.ingredients?.create) {
          await api.ingredients.create(payload);
        } else {
          await axiosInstance.post('/ingredient-details', payload);
        }
      }
      toast.success('Ingredient saved');
      setName('');
      setNutrientsList([]);
      setEditingId(null);
      await reloadDetails();
    } catch (err: unknown) {
      console.error('Save ingredient error', err);
      const msg = err instanceof Error ? err.message : (typeof err === 'string' ? err : String(err));
      toast.error(msg || 'Failed to save');
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm('Delete this ingredient detail?')) return;
    try {
      if (api?.ingredientDetails?.delete) {
        await api.ingredientDetails.delete(id);
      } else {
        await axiosInstance.delete(`/ingredient-details/${id}`);
      }
      toast.success('Deleted');
      await reloadDetails();
    } catch (err) {
      console.error('Delete error', err);
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Ingredient Nutrition Config</h2>

      <div className="space-y-4 bg-white p-4 rounded shadow-sm border">
        <div>
          <label className="block text-sm font-medium mb-1">Ingredient name</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g. Sugar" />
        </div>

        <div>
          <p className="text-sm text-slate-600 mb-2">Nutrition per 100g</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs">Select nutrient to edit</label>
              <div className="flex gap-2">
                {/* multiple nutrient rows */}
                <div className="space-y-2">
                  {nutrientsList.map((row, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <select 
                        value={row.key} 
                        onChange={e => updateNutrientRow(i, { key: e.target.value })} 
                        className="p-2 border rounded bg-slate-50 text-sm"
                      >
                        <option value="">-- Select Member Ingredient --</option>
                        {savedIngredients.map(ing => (
                          <option key={ing._id || ing.id} value={ing.name}>
                            {ing.name}{ing.unit ? ` (${ing.unit})` : ''}
                          </option>
                        ))}
                      </select>
                      <input type="number" value={row.value} onChange={e => updateNutrientRow(i, { value: Number(e.target.value) || 0 })} className="p-2 border rounded w-36" />
                      <button type="button" onClick={() => removeNutrientRow(i)} className="px-3 py-2 border rounded">Remove</button>
                    </div>
                  ))}
                  <div>
                    <button type="button" onClick={addNutrientRow} className="px-3 py-2 border rounded">Add nutrient</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Current per-100g values removed as requested */}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => { setNutrientsList([{ key: '', value: 0 }]); setName(''); }} className="px-4 py-2 border rounded">Reset</button>
          <button type="button" onClick={handleSave} disabled={saving} className="px-4 py-2 bg-[#1A2744] text-white rounded">
            {saving ? 'Saving…' : 'Save ingredient to DB'}
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-500 mt-3">After saving you can use this ingredient (name) when creating products. The backend expects payload: <code>{'{ name, nutritionPer100g }'}</code>.</p>

      {/* List / table of saved ingredient-details */}
      <div className="mt-6 bg-white p-4 rounded shadow-sm border">
        <h3 className="text-lg font-semibold mb-3">Saved Ingredient Details</h3>
        {loadingDetails ? (
          <div className="text-sm text-slate-500">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-auto">
              <thead>
                <tr className="text-left">
                  <th className="px-2 py-1">Name</th>
                  <th className="px-2 py-1">Nutrition (per 100g)</th>
                  <th className="px-2 py-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {detailsList.map(d => (
                  <tr key={d._id || d.id} className="border-t">
                    <td className="px-2 py-2">{d.name}</td>
                    <td className="px-2 py-2">
                      {d.nutritionPer100g ? Object.entries(d.nutritionPer100g).map(([k, v]) => {
                        if (typeof v === 'number') return `${k}: ${v}`;
                        if (v && typeof v === 'object' && 'value' in v) {
                          const val = (v as { value?: number; unit?: string }).value;
                          const unit = (v as { value?: number; unit?: string }).unit;
                          return `${k}: ${typeof val === 'number' ? val : '-'}${unit ? ` ${unit}` : ''}`;
                        }
                        return `${k}: -`;
                      }).join(', ') : '—'}
                    </td>
                    
                    <td className="px-2 py-2">
                      <button onClick={() => handleEdit(d)} className="mr-2 px-2 py-1 border rounded">Edit</button>
                      <button onClick={() => handleDelete(d._id || d.id)} className="px-2 py-1 border rounded">Delete</button>
                    </td>
                  </tr>
                ))}
                {detailsList.length === 0 && (
                  <tr><td colSpan={3} className="px-2 py-2 text-slate-500">No records</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
