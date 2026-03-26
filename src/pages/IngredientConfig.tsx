import React, { useState } from 'react';
import { toast } from 'sonner';
import axiosInstance from '../services/api';

interface Nutrition {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  sugar: number;
}

const initialNutrition: Nutrition = { calories: 0, carbs: 0, protein: 0, fat: 0, sugar: 0 };

export default function IngredientConfig() {
  const [name, setName] = useState('');
  const [per100, setPer100] = useState<Nutrition>(initialNutrition);
  const [quantity, setQuantity] = useState<number>(100);
  const [saving, setSaving] = useState(false);

  const handleChangePer100 = (field: keyof Nutrition, value: string) => {
    const n = Number(value);
    setPer100(prev => ({ ...prev, [field]: Number.isNaN(n) ? 0 : n }));
  };

  const computeForQty = (qty: number) => {
    const factor = qty / 100;
    return {
      calories: +(per100.calories * factor).toFixed(2),
      carbs: +(per100.carbs * factor).toFixed(2),
      protein: +(per100.protein * factor).toFixed(2),
      fat: +(per100.fat * factor).toFixed(2),
      sugar: +(per100.sugar * factor).toFixed(2),
    };
  };

  const result = computeForQty(quantity);

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Ingredient name required'); return; }
    setSaving(true);
    try {
      // try api wrapper first if available
      // payload matches backend model expectation: { name, nutritionPer100g: {...} }
      const payload = { name: name.trim(), nutritionPer100g: per100 };
      // prefer api.ingredients.create if present, fallback to raw POST
      // @ts-ignore
      if (typeof (await import('../services/api')).api?.ingredients?.create === 'function') {
        // dynamic import to avoid TS error if api wrapper missing
        const apiModule = await import('../services/api');
        await apiModule.api.ingredients.create(payload);
      } else {
        await axiosInstance.post('/ingredients', payload);
      }
      toast.success('Ingredient saved');
      setName('');
      setPer100(initialNutrition);
    } catch (err: any) {
      console.error('Save ingredient error', err);
      toast.error(err?.message || 'Failed to save');
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs">Calories (kcal)</label>
              <input type="number" value={per100.calories} onChange={(e) => handleChangePer100('calories', e.target.value)} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="text-xs">Carbs (g)</label>
              <input type="number" value={per100.carbs} onChange={(e) => handleChangePer100('carbs', e.target.value)} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="text-xs">Protein (g)</label>
              <input type="number" value={per100.protein} onChange={(e) => handleChangePer100('protein', e.target.value)} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="text-xs">Fat (g)</label>
              <input type="number" value={per100.fat} onChange={(e) => handleChangePer100('fat', e.target.value)} className="w-full p-2 border rounded" />
            </div>
            <div className="col-span-2">
              <label className="text-xs">Sugar (g)</label>
              <input type="number" value={per100.sugar} onChange={(e) => handleChangePer100('sugar', e.target.value)} className="w-full p-2 border rounded" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Quantity to calculate (grams)</label>
          <div className="flex gap-2 items-center">
            <input type="number" value={quantity} min={0} onChange={(e) => setQuantity(Number(e.target.value || 0))} className="w-32 p-2 border rounded" />
            <div className="flex gap-1">
              {[25,50,100,250,500].map(q => (
                <button key={q} type="button" onClick={() => setQuantity(q)} className="px-3 py-1 bg-[#F3F4F6] rounded border">{q}g</button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#FAFAFA] border rounded p-3">
          <p className="text-sm font-medium mb-2">Computed nutrition for {quantity} g</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Calories: <strong>{result.calories}</strong> kcal</div>
            <div>Carbs: <strong>{result.carbs}</strong> g</div>
            <div>Protein: <strong>{result.protein}</strong> g</div>
            <div>Fat: <strong>{result.fat}</strong> g</div>
            <div>Sugar: <strong>{result.sugar}</strong> g</div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => { setPer100(initialNutrition); setQuantity(100); setName(''); }} className="px-4 py-2 border rounded">Reset</button>
          <button type="button" onClick={handleSave} disabled={saving} className="px-4 py-2 bg-[#1A2744] text-white rounded">
            {saving ? 'Saving…' : 'Save ingredient to DB'}
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-500 mt-3">After saving you can use this ingredient (name) when creating products. The backend expects payload: <code>{'{ name, nutritionPer100g }'}</code>.</p>
    </div>
  );
}
