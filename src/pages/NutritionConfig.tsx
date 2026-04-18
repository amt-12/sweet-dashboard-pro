import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { api } from '../services/api';
import { Plus, Search, Edit, Trash2, RefreshCw, FileText, Beaker, Package, Info, Calculator, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

interface Ingredient {
  _id?: string;
  id?: string;
  name: string;
  unit: string;
  createdAt?: string;
}

export default function NutritionConfig() {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [saving, setSaving] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchIngredients = async () => {
    setLoading(true);
    try {
      const data = await api.ingredients.getAll();
      const arr = Array.isArray(data) ? data : [];
      setIngredients(arr.map((it: any) => ({
        _id: it._id || it.id,
        id: it.id,
        name: it.name || '',
        unit: it.unit || ''
      })));
    } catch (err) {
      console.error('Failed to load ingredients', err);
      toast.error('Failed to load ingredients');
      setIngredients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) { toast.error('Ingredient name required'); return; }
    
    setSaving(true);
    try {
      const payload = { name: name.trim(), unit: unit.trim() };
      
      if (editingId) {
        await api.ingredients.update(editingId, payload);
        toast.success('Ingredient updated!');
      } else {
        await api.ingredients.create(payload);
        toast.success('New ingredient saved!');
      }
      
      resetForm();
      setShowModal(false);
      await fetchIngredients();
    } catch (err) {
      toast.error('Failed to save ingredient');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: Ingredient) => {
    setEditingId(item._id || item.id || null);
    setName(item.name);
    setUnit(item.unit);
    setShowModal(true);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm('Remove this ingredient from your library?')) return;
    try {
      await api.ingredients.delete(id);
      toast.success('Ingredient removed.');
      await fetchIngredients();
    } catch (err) {
      toast.error('Failed to remove ingredient');
    }
  };

  const resetForm = () => {
    setName('');
    setUnit('');
    setEditingId(null);
  };

  const filteredIngredients = ingredients.filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 font-lora pb-20">
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
            <RefreshCw size={18} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
          </button>
          <button 
            onClick={() => { resetForm(); setShowModal(true); }} 
            className="px-6 py-3 bg-chocolate text-white rounded-full flex items-center gap-2 shadow-bakery hover:shadow-bakery-lg hover:bg-strawberry transition-all duration-300"
          >
            <Plus size={18} />
            <span className="font-bold text-xs uppercase tracking-widest text-[#F5ECD7]">Add New Item</span>
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
            placeholder="Search ingredients..." 
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
              <TableHead className="h-16 font-bold text-chocolate/80 uppercase tracking-widest text-[10px] hidden md:table-cell">Base Unit</TableHead>
              <TableHead className="pr-8 h-16 font-bold text-chocolate italic uppercase tracking-widest text-[10px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIngredients.map((item) => (
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
                      <Package size={10} />
                      Inventory Asset
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-6 hidden md:table-cell">
                  <div className="flex items-center gap-2 bg-white border border-chocolate/5 px-3 py-1 rounded-full w-fit shadow-sm">
                    <span className="text-[10px] font-black text-strawberry uppercase tracking-wider">{item.unit || 'Standard'}</span>
                  </div>
                </TableCell>
                <TableCell className="py-6 pr-8 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-3 bg-white border border-chocolate/10 rounded-full text-chocolate hover:bg-chocolate hover:text-white transition-all shadow-sm active:scale-95 group/btn"
                      title="Edit Item"
                    >
                      <Edit size={16} className="group-hover/btn:rotate-12 transition-transform" />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id || item.id)}
                      className="p-3 bg-white border border-red-100 rounded-full text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95 group/btn"
                      title="Delete Item"
                    >
                      <Trash2 size={16} className="group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            
            {(filteredIngredients.length === 0 && !loading) && (
              <TableRow>
                <TableCell colSpan={4} className="py-32 text-center">
                  <div className="flex flex-col items-center gap-6 animate-in fade-in duration-700">
                    <div className="w-24 h-24 bg-cream/50 rounded-full flex items-center justify-center text-chocolate/10 transform -rotate-12 shadow-inner">
                      <Beaker size={48} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold font-playfair text-chocolate">The Pantry is Empty</h3>
                      <p className="text-chocolate-light font-medium italic mt-2">Start by adding your first bakery ingredient.</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showModal} onOpenChange={(open) => { if(!open) { setShowModal(false); resetForm(); } }}>
        <DialogContent className="max-w-[95vw] md:max-w-xl flex flex-col p-0 bg-[#FAFBFD] border-none overflow-hidden rounded-[2.5rem]">
          <DialogHeader className="p-10 bg-white border-b border-chocolate/5 relative shrink-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-strawberry/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="relative flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-chocolate text-white flex items-center justify-center shadow-bakery transform rotate-3">
                <Package size={28} />
              </div>
              <div>
                <DialogTitle className="text-4xl font-bold text-chocolate font-dancing">
                  {editingId ? "Refine Item" : "New Ingredient"}
                </DialogTitle>
                <DialogDescription className="text-chocolate-light font-medium italic">
                  {editingId ? "Update your ingredient's base information." : "Register a new item in your bakery's master collection."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form id="ingredient-record-form" onSubmit={handleSave} className="p-10 space-y-8">
            <div className="space-y-6">
              <div className="space-y-2 group">
                <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Ingredient Name</label>
                <div className="relative">
                  <FileText size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
                  <input 
                    required
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="e.g. Organic All-Purpose Flour"
                    className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-medium placeholder:text-chocolate/10 shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Base Unit</label>
                <div className="relative">
                  <Calculator size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
                  <input 
                    value={unit} 
                    onChange={e => setUnit(e.target.value)} 
                    placeholder="e.g. g, kg, ml, piece"
                    className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-medium placeholder:text-chocolate/10 shadow-sm"
                  />
                </div>
              </div>

              <div className="bg-strawberry/5 p-6 rounded-[1.5rem] border border-strawberry/10 flex gap-4">
                <Info size={20} className="text-strawberry shrink-0" />
                <p className="text-[11px] text-chocolate/60 leading-relaxed italic">
                  Use descriptive names like "Unsalted Butter" or "Heavy Cream (35%)" to keep your pantry organized and precise for recipes.
                </p>
              </div>
            </div>
          </form>

          <DialogFooter className="p-10 bg-white border-t border-chocolate/5 flex flex-row justify-between items-center shrink-0">
            <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="px-10 py-4 rounded-full text-xs font-bold text-chocolate bg-white border border-chocolate/10 hover:bg-chocolate/5 transition-all uppercase tracking-[0.2em] italic">
              Cancel
            </button>
            <button type="submit" form="ingredient-record-form" disabled={saving} className="px-12 py-4 bg-chocolate text-white rounded-full font-bold shadow-bakery hover:bg-strawberry transition-all disabled:opacity-50 flex items-center gap-3 uppercase tracking-[0.2em]">
              {saving && <RefreshCw size={18} className="animate-spin" />}
              {editingId ? "Update Item" : "Save Record"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
