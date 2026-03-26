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

interface SimpleIngredient { _id?: string; id?: string; name: string; nutritionPer100g?: Partial<Nutrition>; }

export default function IngredientConfig() {
  const [name, setName] = useState('');
  // multiple nutrient rows under a single ingredient (keys are dynamic strings from API)
  const [nutrientsList, setNutrientsList] = useState<Array<{ key: string; value: number }>>([]);
  const [selectedNutrient, setSelectedNutrient] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [savedIngredients, setSavedIngredients] = useState<SimpleIngredient[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [selectedSavedId, setSelectedSavedId] = useState<string>('');
  // dynamic nutrient options derived from API (use API keys only)
  const [nutrientOptions, setNutrientOptions] = useState<string[]>([]);

  React.useEffect(() => {
    let mounted = true;
    setLoadingSaved(true);
    api?.ingredients?.getAll().then(data => {
      if (!mounted) return;
      const arr = Array.isArray(data) ? data : [];
      setSavedIngredients(arr.map((it: unknown) => {
        const raw = it as Record<string, unknown>;
        return {
          _id: typeof raw._id === 'string' ? raw._id : (typeof raw.id === 'string' ? raw.id : undefined),
          id: typeof raw.id === 'string' ? raw.id : undefined,
          name: typeof raw.name === 'string' ? raw.name : '',
          nutritionPer100g: typeof raw.nutritionPer100g === 'object' ? (raw.nutritionPer100g as Partial<Nutrition>) : undefined,
        } as SimpleIngredient;
      }));

      // derive nutrient keys from the fetched array
      try {
        const keys = new Set<string>();
        for (const item of arr) {
          const raw = item as Record<string, unknown>;
          const n = raw.nutritionPer100g as Record<string, unknown> | Partial<Nutrition> | undefined;
          if (!n) continue;
          if (Array.isArray(n)) {
            for (const entry of n) if (entry && typeof entry === 'object') for (const k of Object.keys(entry)) keys.add(k);
          } else if (typeof n === 'object') {
            for (const k of Object.keys(n)) keys.add(k);
          }
        }
        const derived = Array.from(keys);
        // use only API-derived keys; if none found, leave options empty
        if (derived.length) setNutrientOptions(derived);
        else setNutrientOptions([]);
      } catch (e) {
        console.error('Failed to derive nutrient keys', e);
        // fallback to empty options on error
        setNutrientOptions([]);
      }

    }).catch((err) => {
      console.error('Failed to load ingredients', err);
      // keep defaults on error
      setSavedIngredients([]);
    }).finally(() => { if (mounted) setLoadingSaved(false); });
    return () => { mounted = false; };
  }, []);

  const addNutrientRow = () => setNutrientsList(prev => ([...prev, { key: (nutrientOptions[0] || ''), value: 0 }]));
  const removeNutrientRow = (i: number) => setNutrientsList(prev => prev.length > 1 ? prev.filter((_, idx) => idx !== i) : []);
  const updateNutrientRow = (i: number, patch: Partial<{ key: string; value: number }>) => setNutrientsList(prev => prev.map((r, idx) => idx === i ? ({ ...r, ...patch }) : r));

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Ingredient name required'); return; }
    setSaving(true);
    try {
      // assemble nutrition object from rows
      const nutritionObj = nutrientsList.reduce((acc, cur) => {
        if (!cur.key) return acc;
        acc[cur.key] = cur.value;
        return acc;
      }, {} as Record<string, number>);
      const payload = { name: name.trim(), nutritionPer100g: nutritionObj };
      // prefer named api wrapper if present, fallback to raw POST
      if (api?.ingredients?.create) {
        await api.ingredients.create(payload);
      } else {
        await axiosInstance.post('/ingredients', payload);
      }
      toast.success('Ingredient saved');
      setName('');
      setNutrientsList([]);
    } catch (err: unknown) {
      console.error('Save ingredient error', err);
      const msg = err instanceof Error ? err.message : (typeof err === 'string' ? err : String(err));
      toast.error(msg || 'Failed to save');
    } finally {
      setSaving(false);
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
                      <select value={row.key as string} onChange={e => updateNutrientRow(i, { key: e.target.value as keyof Nutrition })} className="p-2 border rounded">
                        {nutrientOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
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
          <button type="button" onClick={() => { setNutrientsList([{ key: 'calories', value: 0 }]); setName(''); }} className="px-4 py-2 border rounded">Reset</button>
          <button type="button" onClick={handleSave} disabled={saving} className="px-4 py-2 bg-[#1A2744] text-white rounded">
            {saving ? 'Saving…' : 'Save ingredient to DB'}
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-500 mt-3">After saving you can use this ingredient (name) when creating products. The backend expects payload: <code>{'{ name, nutritionPer100g }'}</code>.</p>
    </div>
  );
}
