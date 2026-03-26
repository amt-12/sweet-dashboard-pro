import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { toast } from 'sonner';

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
  // allow empty string so the input can be empty and show a placeholder
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

  useEffect(() => {
    let mounted = true;
    setLoadingIngredients(true);
    api.ingredients.getAll().then((data) => {
      if (!mounted) return;
      const arr = Array.isArray(data) ? data : [];
      setSavedIngredients(arr.map((it: unknown) => {
        const raw = it as Record<string, unknown>;
        const _id = typeof raw._id === 'string' ? raw._id : (typeof raw.id === 'string' ? raw.id : undefined);
        const name = typeof raw.name === 'string' ? raw.name : '';
        const unit = typeof raw.unit === 'string' ? raw.unit : '';
        return { _id, name, unit } as Ingredient;
      }));
    }).catch(() => {
      // ignore
    }).finally(() => { if (mounted) setLoadingIngredients(false); });
    return () => { mounted = false; };
  }, []);

  const addRow = () => setRows(prev => ([...prev, { id: String(Date.now()) + Math.random(), name: '', grams: '', per100: { ...zeroNutrition } }]));
  const removeRow = (id: string) => setRows(prev => prev.filter(r => r.id !== id));
  const updateRow = (id: string, patch: Partial<Row>) => setRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));

  const saveIngredient = async (id: string) => {
    const row = rows.find(r => r.id === id);
    if (!row) return;
    if (!row.name) {
      toast.error('Enter ingredient name before saving');
      return;
    }
    try {
      const payload = { name: row.name, unit: String(row.grams || '') };
      const created = await api.ingredients.create(payload);
      // normalize created item to match savedIngredients type
      const rawCreated = created as Record<string, unknown>;
      const createdId = typeof rawCreated._id === 'string' ? rawCreated._id : (typeof rawCreated.id === 'string' ? rawCreated.id : undefined);
      const createdName = typeof rawCreated.name === 'string' ? rawCreated.name : '';
      const createdUnit = typeof rawCreated.unit === 'string' ? rawCreated.unit : '';
      const createdItem: Ingredient = { _id: createdId, name: createdName, unit: createdUnit };
      // append to saved list and mark row as coming from saved source
      setSavedIngredients(prev => [...prev, createdItem]);
      updateRow(id, { sourceId: String(createdItem._id || '') });
      toast.success('Ingredient saved');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save ingredient');
    }
  };

   const onNameChange = (id: string, name: string) => {
     updateRow(id, { name });
     if (!name) return;
     // try find saved ingredient by name (case-insensitive)
     const found = savedIngredients.find(si => (si.name || '').toLowerCase() === name.toLowerCase());
     if (found) {
      // saved ingredient exists — mark source but do not overwrite per100 (we don't store nutrition on backend)
      updateRow(id, { sourceId: String(found._id || found.id || '') });
     } else {
      // unknown ingredient -> clear sourceId
      updateRow(id, { sourceId: undefined });
     }
   };

  const totalNutrition = rows.reduce((acc, r) => {
     const factor = (Number(r.grams) || 0) / 100;
     acc.calories += (r.per100.calories || 0) * factor;
     acc.carbs += (r.per100.carbs || 0) * factor;
     acc.protein += (r.per100.protein || 0) * factor;
     acc.fat += (r.per100.fat || 0) * factor;
     acc.sugar += (r.per100.sugar || 0) * factor;
     return acc;
   }, { ...zeroNutrition });
  
   const roundedTotals = {
     calories: Number(totalNutrition.calories.toFixed(2)),
     carbs: Number(totalNutrition.carbs.toFixed(2)),
     protein: Number(totalNutrition.protein.toFixed(2)),
     fat: Number(totalNutrition.fat.toFixed(2)),
     sugar: Number(totalNutrition.sugar.toFixed(2)),
   };

   const deleteSavedIngredient = async (id?: string) => {
     if (!id) return;
     try {
       await api.ingredients.delete(id);
       setSavedIngredients(prev => prev.filter(s => String(s._id || s.id) !== String(id)));
       toast.success('Ingredient deleted');
     } catch (err) {
       console.error(err);
       toast.error('Failed to delete ingredient');
     }
   };

   const insertSavedIngredient = (si: Ingredient) => {
     // add a new row prefilled with this ingredient. copy unit into grams field
     setRows(prev => ([...prev, { id: String(Date.now()) + Math.random(), name: si.name || '', grams: si.unit || '', per100: { ...zeroNutrition }, sourceId: String(si._id || si.id || '') }]));
   };

   return (
     <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Nutrition — Simple View</h2>

      <div className="bg-white border rounded p-4 space-y-4">
        <p className="text-sm text-slate-600">Enter ingredient name (autocomplete available) and units.</p>

        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-7">
                <label className="text-xs">Ingredient</label>
                <input list={`ings-${r.id}`} value={r.name} onChange={(e) => onNameChange(r.id, e.target.value)} className="w-full p-2 border rounded" placeholder="Name" />
                <datalist id={`ings-${r.id}`}>
                  {savedIngredients.map(si => (<option key={si._id || si.id || si.name} value={si.name} />))}
                </datalist>
              </div>

              <div className="col-span-3">
                <label className="text-xs">Units</label>
                <input type="text" value={r.grams} onChange={(e) => updateRow(r.id, { grams: e.target.value })} placeholder="enter the unit" className="w-full p-2 border rounded" />
              </div>

              <div className="col-span-1 flex items-end gap-2">
                <button type="button" onClick={() => saveIngredient(r.id)} className="px-2 py-1 text-sm text-green-600">Save</button>
                <button type="button" onClick={() => removeRow(r.id)} className="px-2 py-1 text-sm text-red-600">Remove</button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button type="button" onClick={addRow} className="px-4 py-2 border rounded">Add Ingredient</button>
          <button type="button" onClick={() => setRows([{ id: String(Date.now()), name: '', grams: '', per100: { ...zeroNutrition } }])} className="px-4 py-2 border rounded">Reset</button>
        </div>

        {/* Saved ingredients list */}
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Saved ingredients</h3>
          <div className="bg-white border rounded p-2">
            {loadingIngredients ? (
              <div className="text-sm">Loading...</div>
            ) : savedIngredients.length === 0 ? (
              <div className="text-sm text-slate-500">No saved ingredients</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-600">
                      <th className="pb-1">Name</th>
                      <th className="pb-1">Unit</th>
                      <th className="pb-1">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savedIngredients.map(si => (
                      <tr key={si._id || si.id || si.name} className="border-t">
                        <td className="py-1">{si.name}</td>
                        <td className="py-1">{si.unit || ''}</td>
                         <td className="py-1">
                           <div className="flex gap-2">
                             <button type="button" onClick={() => insertSavedIngredient(si)} className="text-blue-600 text-xs">Use</button>
                             <button type="button" onClick={() => deleteSavedIngredient(si._id || si.id)} className="text-red-600 text-xs">Delete</button>
                           </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

     </div>
   </div>
  );
}
