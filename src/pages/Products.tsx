import { Plus, Search, Edit, Trash2, Filter, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setProducts, setLoading, setError } from "../store/slices/productSlice";
import { api } from "../services/api";

interface Product {
  id?: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  flavor: string[];
  ingredients: string[];
  tasteDescription: string;
}

interface ProductForm extends Omit<Product, 'id'> {
  imageFile?: File | null;
  imagePreview?: string | null;
}

const emptyForm: ProductForm = {
  name: "",
  category: "Cakes",
  price: 0,
  stock: 0,
  image: "",
  flavor: [],
  ingredients: [],
  tasteDescription: "",
  imageFile: null,
  imagePreview: null,
};

// TagInput: small inline tag editor for flavor/ingredients
const TagInput = ({ value, onChange, placeholder }: { value: string[]; onChange: (next: string[]) => void; placeholder?: string }) => {
  const [input, setInput] = useState('');

  const add = (val: string) => {
    const v = val.trim();
    if (!v) return;
    if (value.includes(v)) return;
    onChange([...value, v]);
    setInput('');
  };

  const remove = (idx: number) => onChange(value.filter((_, i) => i !== idx));

  return (
    <div className="border rounded px-2 py-2 flex flex-wrap gap-2 items-center">
      {value.map((tag, i) => (
        <span key={i} className="flex items-center gap-1 bg-[#FAF6E6] text-sm text-[#1A2744] px-2 py-0.5 rounded-full border border-[#D4A373]/20">
          <span>{tag}</span>
          <button type="button" onClick={() => remove(i)} className="p-0.5 opacity-70 hover:opacity-100">
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        className="flex-1 min-w-[100px] outline-none text-sm placeholder:text-[#1A2744]/40 bg-transparent"
        value={input}
        placeholder={placeholder}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            add(input);
          }
        }}
        onBlur={() => { if (input.trim()) add(input); }}
      />
    </div>
  );
};

const Products = () => {
  const dispatch = useAppDispatch();
  const { items: products, loading, error } = useAppSelector((state) => state.products);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showModal]);

  // helper to normalize a single product and preserve extra fields
  const normalizeSingle = (p: any) => ({
    // preserve all original properties
    ...p,
    id: p._id || p.id,
    image: p.img || p.image || '/placeholder.svg',
    flavor: Array.isArray(p.flavor) ? p.flavor : (typeof p.flavor === 'string' ? p.flavor.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
    ingredients: Array.isArray(p.ingredients) ? p.ingredients : (typeof p.ingredients === 'string' ? p.ingredients.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
    tasteDescription: p.tasteDescription || p.description || '',
  });

  useEffect(() => {
    dispatch(setLoading(true));

    api.products
      .getAll()
      .then((res) => {
        // api normalizes so res should be an array, but support object wrapper
        const raw = Array.isArray(res) ? res : (res && (res.data || res)) || [];
        const normalized = (raw || []).map((p: any) => normalizeSingle(p));
        dispatch(setProducts(normalized));
      })
      .catch((err) => dispatch(setError(err?.message || 'Failed to fetch products')))
      .finally(() => dispatch(setLoading(false)));
  }, [dispatch]);

  const openAdd = () => {
    setForm(emptyForm);
    setErrors({});
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (p: any) => {
    setForm({
      name: p.name || '',
      category: p.category || 'Cakes',
      price: Number(p.price) || 0,
      stock: Number(p.stock) || 0,
      image: p.image || p.img || '/placeholder.svg',
      flavor: p.flavor || [],
      ingredients: p.ingredients || [],
      tasteDescription: p.tasteDescription || p.description || '',
      imageFile: null,
      imagePreview: p.image || p.img || null,
    });
    setErrors({});
    setEditingId(p.id);
    setShowModal(true);
  };

  const closeModal = () => {
    // revoke preview URL if created
    if (form.imageFile && form.imagePreview) {
      try { URL.revokeObjectURL(form.imagePreview); } catch (e) { }
    }
    setShowModal(false);
    setForm(emptyForm);
    setErrors({});
    setEditingId(null);
  };

  const validateForm = () => {
    const next: Record<string,string> = {};
    if (!form.name || !form.name.trim()) next.name = 'Name is required';
    if (Number.isNaN(Number(form.price)) || Number(form.price) < 0) next.price = 'Enter a valid non-negative price';
    if (!Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) next.stock = 'Enter a valid non-negative stock';
    return next;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateForm();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    dispatch(setLoading(true));

    const payload: any = {
      name: form.name,
      category: form.category,
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      img: form.image || undefined,
      flavor: form.flavor || [],
      ingredients: form.ingredients || [],
      tasteDescription: form.tasteDescription || '',
    };

    if (editingId) {
      api.products
        .update(editingId, payload)
        .then((res) => {
          const updated = normalizeSingle(res || (res as any)?.data || {});
          const next = products.map((it: any) => (it.id === editingId ? { ...it, ...updated } : it));
          dispatch(setProducts(next));
          closeModal();
        })
        .catch((err) => dispatch(setError(err?.message || 'Failed to update product')))
        .finally(() => dispatch(setLoading(false)));
    } else {
      api.products
        .create(payload)
        .then((res) => {
          const created = normalizeSingle(res || (res as any)?.data || {});
          const next = [created, ...products];
          dispatch(setProducts(next));
          closeModal();
        })
        .catch((err) => dispatch(setError(err?.message || 'Failed to create product')))
        .finally(() => dispatch(setLoading(false)));
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this product?')) return;
    dispatch(setLoading(true));
    api.products
      .delete(id)
      .then(() => {
        const next = products.filter((p: any) => p.id !== id);
        dispatch(setProducts(next));
      })
      .catch((err) => dispatch(setError(err?.message || 'Failed to delete product')))
      .finally(() => dispatch(setLoading(false)));
  };

  if (loading) return <div className="p-8 text-center text-[#1A2744] font-playfair animate-pulse">Loading bakery items... 🥐</div>;
  if (error) return <div className="p-8 text-center text-red-500 font-inter">Error: {error}</div>;

  return (
    <div className="space-y-6 animate-fade-in font-inter">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-playfair text-[#1A2744]">Product Management</h2>
          <p className="text-sm text-[#8D6E63] font-medium mt-1">Manage your bakery items, prices, and stock.</p>
        </div>
        <button onClick={openAdd} className="px-5 py-2.5 bg-[#1A2744] text-[#F5ECD7] rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl hover:bg-[#D4A373] hover:text-[#1A2744] transition-all duration-300 group">
          <Plus size={18} className="group-hover:rotate-90 transition-transform"/>
          <span className="font-bold text-xs uppercase tracking-wider">Add New Product</span>
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-[#D4A373]/20">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1A2744]/40 group-focus-within:text-[#D4A373] transition-colors w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search products by name or category..." 
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#FAF6E6] border border-transparent focus:border-[#D4A373]/30 text-sm text-[#1A2744] placeholder-[#1A2744]/40 outline-none focus:ring-0 focus:bg-white transition-all"
          />
        </div>
        <button className="p-2.5 bg-[#FAF6E6] rounded-xl text-[#1A2744] hover:bg-[#D4A373] hover:text-white transition-colors border border-transparent hover:border-[#D4A373]/30">
          <Filter size={18} />
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#D4A373]/20 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#FAF6E6] border-b border-[#D4A373]/20">
              <tr>
                <th className="p-4 pl-6 text-xs font-bold text-[#8D6E63] uppercase tracking-wider">Product</th>
                <th className="p-4 text-xs font-bold text-[#8D6E63] uppercase tracking-wider">Category</th>
                <th className="p-4 text-xs font-bold text-[#8D6E63] uppercase tracking-wider">Price</th>
                <th className="p-4 text-xs font-bold text-[#8D6E63] uppercase tracking-wider">Stock</th>
                <th className="p-4 text-xs font-bold text-[#8D6E63] uppercase tracking-wider text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4A373]/10">
              {products.map((product: any) => (
                <tr key={product.id} className="hover:bg-[#FAF6E6]/50 transition-colors group">
                  <td className="p-4 pl-6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg bg-[#FAF6E6] flex items-center justify-center text-xl border border-[#D4A373]/10 overflow-hidden">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-[#1A2744] font-playfair">{product.name}</span>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {(product.flavor || []).map((f: string, i: number) => (
                          <span key={i} className="text-xs bg-[#FFF6E8] px-2 py-0.5 rounded-full border border-[#F0D2B2]">{f}</span>
                        ))}
                      </div>
                      <div className="text-xs text-[#1A2744]/60 mt-1">{(product.ingredients || []).slice(0,4).join(', ')}{(product.ingredients || []).length > 4 ? '...' : ''}</div>
                      {product.tasteDescription && <small className="text-xs text-[#1A2744]/60 italic mt-1">{product.tasteDescription}</small>}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-[#1A2744]/70 font-medium">{product.category}</td>
                  <td className="p-4 font-bold text-[#1A2744] font-mono">${product.price.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${product.stock > 10 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                      {product.stock} in stock
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => openEdit(product)} className="p-2 hover:bg-[#1A2744] hover:text-[#F5ECD7] rounded-lg text-[#1A2744] transition-colors">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 hover:bg-red-500 hover:text-white rounded-lg text-red-400 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="text-center p-8 text-muted-foreground">No products found.</div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/50">
          <div className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-xl mt-6 mx-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <div className="flex items-start justify-between">
              <h3 className="font-playfair text-xl font-bold mb-4">{editingId ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={closeModal} className="text-[#1A2744]/60 hover:text-[#1A2744]">
                <X />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-[#1A2744]">Name</label>
                  <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className={`w-full mt-1 p-3 border rounded-lg bg-[#fffdf8] border-[#efe6d9] ${errors.name ? 'ring-1 ring-red-300' : ''}`} />
                  {errors.name && <div className="text-xs text-red-500 mt-1">{errors.name}</div>}
                </div>
                <div>
                  <label className="text-sm font-medium text-[#1A2744]">Category</label>
                  <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="w-full mt-1 p-3 border rounded-lg bg-[#fffdf8] border-[#efe6d9]">
                    <option>Cakes</option>
                    <option>Breads</option>
                    <option>Pastries</option>
                    <option>Cookies</option>
                    <option>Custom</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#1A2744]">Price</label>
                  <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({...form, price: e.target.value === '' ? '' as any : Number(e.target.value)})} className={`w-full mt-1 p-3 border rounded-lg bg-[#fffdf8] border-[#efe6d9] ${errors.price ? 'ring-1 ring-red-300' : ''}`} />
                  {errors.price && <div className="text-xs text-red-500 mt-1">{errors.price}</div>}
                </div>
                <div>
                  <label className="text-sm font-medium text-[#1A2744]">Stock</label>
                  <input type="number" value={form.stock} onChange={(e) => setForm({...form, stock: e.target.value === '' ? '' as any : Number(e.target.value)})} className={`w-full mt-1 p-3 border rounded-lg bg-[#fffdf8] border-[#efe6d9] ${errors.stock ? 'ring-1 ring-red-300' : ''}`} />
                  {errors.stock && <div className="text-xs text-red-500 mt-1">{errors.stock}</div>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-[#1A2744]">Image (URL or upload)</label>
                  <div className="flex gap-3 items-start mt-1">
                    <input value={form.image} onChange={(e) => setForm({...form, image: e.target.value, imagePreview: null, imageFile: null})} className="flex-1 p-3 border rounded-lg bg-[#fffdf8] border-[#efe6d9]" placeholder="https://..." />
                    <div className="w-28 h-20 rounded-md bg-gray-100 border overflow-hidden">
                      <img src={form.imagePreview || form.image || '/placeholder.svg'} alt="preview" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <input type="file" accept="image/*" onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      if (f) {
                        const url = URL.createObjectURL(f);
                        setForm({...form, imageFile: f, imagePreview: url});
                      }
                    }} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#1A2744]">Flavor</label>
                  <TagInput value={form.flavor} onChange={(next) => setForm({...form, flavor: next})} placeholder="Add flavor and press Enter" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[#1A2744]">Ingredients</label>
                <TagInput value={form.ingredients} onChange={(next) => setForm({...form, ingredients: next})} placeholder="Add ingredient and press Enter" />
              </div>

              <div>
                <label className="text-sm font-medium text-[#1A2744]">Taste description</label>
                <textarea value={form.tasteDescription} onChange={(e) => setForm({...form, tasteDescription: e.target.value})} className="w-full mt-1 p-3 border rounded-lg bg-[#fffdf8] border-[#efe6d9]" rows={4} />
                <div className="text-xs text-[#1A2744]/50 mt-1">{(form.tasteDescription || '').length}/300</div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={closeModal} className="px-5 py-2 rounded bg-[#F5F5F5] text-[#333] border">Cancel</button>
                <button type="submit" disabled={loading} className={`px-5 py-2 rounded ${loading ? 'bg-gray-400' : 'bg-[#15273b]'} text-white shadow`}>{editingId ? 'Save' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Products;
