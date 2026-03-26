import { Plus, Search, Edit, Trash2, Filter, X, Package, DollarSign, Layers, Info, Image as ImageIcon, Eye } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setProducts, setLoading, setError } from "../store/slices/productSlice";
import { api } from "../services/api";
import axiosInstance from "../services/api";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "../components/ui/sheet";
import { toast } from "sonner";
import { Link } from 'react-router-dom';

interface ProductImage {
  url: string;
  base64?: string;
}

interface Product {
  id?: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  images?: ProductImage[]; // Multi-image support
  flavor?: string; // single flavor value (dropdown)
  ingredients: string[];
  type?: string[];
  weight?: string[];
  occasion?: string[];
  shape?: string[];
  theme?: string[];
  tasteDescription: string;
}

interface ProductForm extends Omit<Product, 'id'> {
  imageFile?: File | null;
  imagePreview?: string | null;
  galleryPreviews: { file?: File, url: string, base64?: string }[];
}

const emptyForm: ProductForm = {
  name: "",
  category: "Cakes",
  price: 0,
  stock: 0,
  image: "",
  images: [],
  flavor: "",
  ingredients: [],
  type: [],
  weight: [],
  occasion: [],
  shape: [],
  theme: [],
  tasteDescription: "",
  imageFile: null,
  imagePreview: null,
  galleryPreviews: [],
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

  // dropdown lists from API
  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [flavorsList, setFlavorsList] = useState<string[]>([]);
  const [weightsList, setWeightsList] = useState<string[]>([]);
  const [typesList, setTypesList] = useState<string[]>([]);
  const [occasionsList, setOccasionsList] = useState<string[]>([]);
  const [shapesList, setShapesList] = useState<string[]>([]);
  const [themesList, setThemesList] = useState<string[]>([]);

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

  // helper to normalize various image representations into { url, base64 }
  const normalizeImage = useCallback((img: any): ProductImage => {
    if (!img) return { url: '' };
    if (typeof img === 'string') {
      // string may be a data URI or a path/url
      if (img.startsWith('data:')) return { url: '', base64: img };
      return { url: img };
    }
    // object: try common fields
    return {
      url: img.url || img.img || img.path || img.filename || '' ,
      base64: img.base64 || img.imgBase64 || img.data || undefined,
    };
  }, []);

  // helper to normalize a single product and preserve extra fields
  const normalizeSingle = useCallback((p: any) => {
    const imgs = (p.images || []).map((it: any) => normalizeImage(it));
    const normalizedShape = p.shape ? (Array.isArray(p.shape) ? p.shape : [String(p.shape)]) : [];
    const normalizedTheme = p.theme ? (Array.isArray(p.theme) ? p.theme : [String(p.theme)]) : [];
    return {
      // preserve all original properties
      ...p,
      id: p._id || p.id,
      // normalize images array to consistent shape
      images: imgs,
      // prefer base64 image coming from backend (imgBase64) then first gallery base64 then fallback to stored paths
      image: p.imgBase64 || imgs.find((i: any) => i.base64)?.base64 || p.img || imgs.find((i: any) => i.url)?.url || p.image || '/placeholder.svg',
      // normalize flavor: prefer first element if array else use string
      flavor: p.flavor ? (Array.isArray(p.flavor) ? String(p.flavor[0] || '') : String(p.flavor)) : '',
      ingredients: Array.isArray(p.ingredients) ? p.ingredients : (typeof p.ingredients === 'string' ? p.ingredients.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
      tasteDescription: p.tasteDescription || p.description || '',
      // ensure shape/theme are arrays for the multi-select controls
      shape: normalizedShape,
      theme: normalizedTheme,
    } as any;
  }, [normalizeImage]);

  useEffect(() => {
    dispatch(setLoading(true));

    api.products
      .getAll()
      .then((res) => {
        // api normalizes so res should be an array, but support object wrapper
        const raw: any = Array.isArray(res) ? res : (res && ((res as any).data || res)) || [];
        const normalized = (raw || []).map((p: any) => normalizeSingle(p));
        dispatch(setProducts(normalized));
      })
      .catch((err) => dispatch(setError(err?.message || 'Failed to fetch products')))
      .finally(() => dispatch(setLoading(false)));
  }, [dispatch]);

  // fetch dropdown data once
  useEffect(() => {
    let mounted = true;
    Promise.all([
      api.categories.getAll().catch(() => []),
      api.flavors.getAll().catch(() => []),
      api.weights.getAll().catch(() => []),
      // types endpoint may not be in api wrapper, call directly
      axiosInstance.get('/types').then(r => r.data || []).catch(() => []),
      api.occasions.getAll().catch(() => []),
      api.shapes.getAll().catch(() => []),
      api.themes.getAll().catch(() => []),
    ]).then(([cats, flvs, wts, typesRes, occ, shp, thm]) => {
      if (!mounted) return;
      const toNames = (arr: any[]) => (arr || []).map((it: any) => (typeof it === 'string' ? it : it.name || it.title || it.label || it.type || ''))
        .filter(Boolean);
      setCategoriesList(toNames(cats));
      setFlavorsList(toNames(flvs));
      setWeightsList(toNames(wts));
      setTypesList(toNames(typesRes));
      setOccasionsList(toNames(occ));
      setShapesList(toNames(shp));
      setThemesList(toNames(thm));
    }).catch(() => {}).finally(() => { mounted = false; });
    return () => { mounted = false; };
  }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setErrors({});
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (p: any) => {
    const imgs = (p.images || []).map((it: any) => normalizeImage(it));
    setForm({
      name: p.name || '',
      category: p.category || 'Cakes',
      price: Number(p.price) || 0,
      stock: Number(p.stock) || 0,
      // prefer base64 preview if backend provided it, otherwise use normalized images
      image: p.imgBase64 || imgs.find(i => i.base64)?.base64 || p.image || p.img || imgs.find(i => i.url)?.url || '/placeholder.svg',
      images: imgs,
      flavor: p.flavor ? (Array.isArray(p.flavor) ? String(p.flavor[0] || '') : String(p.flavor)) : '',
      ingredients: p.ingredients || [],
      tasteDescription: p.tasteDescription || p.description || '',
      imageFile: null,
      imagePreview: p.imgBase64 || imgs.find(i => i.base64)?.base64 || p.image || p.img || imgs.find(i => i.url)?.url || null,
      galleryPreviews: imgs.map(im => ({ url: im.url || '', base64: im.base64 })),
      // set dropdown values
      type: p.type || [],
      weight: p.weight || [],
      occasion: p.occasion || [],
      shape: p.shape || [],
      theme: p.theme || [],
    });
    setErrors({});
    setEditingId(p.id);
    setShowModal(true);
  };

  const closeModal = () => {
    // revoke preview URL if created
    if (form.imageFile && form.imagePreview) {
      try { URL.revokeObjectURL(form.imagePreview); } catch (e) { void e; }
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
      images: form.galleryPreviews.map(gp => ({ url: gp.url, base64: gp.base64 })),
      // include dropdown selections
      flavor: form.flavor || '',
      type: form.type || [],
      weight: form.weight || [],
      occasion: form.occasion || [],
      shape: form.shape || [],
      theme: form.theme || [],
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
          toast.success("Product updated successfully! 🎂");
          closeModal();
        })
        .catch((err) => {
          dispatch(setError(err?.message || 'Failed to update product'));
          toast.error("Failed to update product");
        })
        .finally(() => dispatch(setLoading(false)));
    } else {
      api.products
        .create(payload)
        .then((res) => {
          const created = normalizeSingle(res || (res as any)?.data || {});
          const next = [created, ...products];
          dispatch(setProducts(next));
          toast.success("New product added to bakery! 🥐");
          closeModal();
        })
        .catch((err) => {
          dispatch(setError(err?.message || 'Failed to create product'));
          toast.error("Failed to create product");
        })
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

  // resolve display src: prefer base64 then url; ensure relative upload paths are usable
  const getImageSrc = (url?: string, base64?: string) => {
    if (base64) return base64;
    if (!url) return '';
    // if url already a data URI
    if (url.startsWith('data:')) return url;
    // if absolute URL
    if (url.startsWith('http') || url.startsWith('//')) return url;
    // ensure leading slash for relative paths
    return url.startsWith('/') ? url : `/${url}`;
  };

  // ── Loading full-panel ────────────────────────────────────────
  if (loading) return (
    <div className="bg-white rounded-2xl border border-[#D4A373]/20 shadow-sm p-20 flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-[#D4A373]/20 border-t-[#D4A373] rounded-full animate-spin" />
      <p className="text-[#8D6E63] font-semibold animate-pulse">Loading bakery items… 🥐</p>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-10 text-center text-red-600 font-medium">
      ⚠️ {error}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in font-inter">

      {/* ── Page Header ───────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-playfair text-[#1A2744]">
            Product Management{" "}
            <span className="inline-block animate-bounce text-[#D4A373]">🥐</span>
          </h2>
          <p className="text-sm text-[#8D6E63] font-medium mt-1">
            Manage your bakery items, prices, and stock.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {products.length > 0 && (
            <div className="px-4 py-2 rounded-xl bg-[#1A2744]/5 border border-[#1A2744]/10 text-sm font-bold text-[#1A2744] flex items-center gap-2">
              <Package size={15} className="text-[#D4A373]" />
              {products.length} {products.length === 1 ? 'Item' : 'Items'}
            </div>
          )}
          <button
            onClick={openAdd}
            className="px-5 py-2.5 bg-[#1A2744] text-[#F5ECD7] rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl hover:bg-[#D4A373] hover:text-[#1A2744] transition-all duration-300 group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
            <span className="font-bold text-xs uppercase tracking-wider">Add New Product</span>
          </button>
        </div>
      </div>

      {/* ── Search Bar ────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-[#D4A373]/20">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A2744]/40 group-focus-within:text-[#D4A373] transition-colors w-4 h-4" />
          <input
            type="text"
            placeholder="Search products by name or category…"
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#FAF6E6] border border-transparent focus:border-[#D4A373]/30 focus:bg-white text-sm text-[#1A2744] placeholder:text-[#1A2744]/40 outline-none transition-all"
          />
        </div>
        <button className="p-3 bg-[#FAF6E6] rounded-xl text-[#1A2744] hover:bg-[#D4A373] hover:text-white transition-colors border border-transparent hover:border-[#D4A373]/30">
          <Filter size={17} />
        </button>
      </div>

      {/* ── Product Cards Grid ────────────────────────────────────── */}
      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#D4A373]/20 shadow-sm p-20 flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D4A373]/20 to-[#D4A373]/5 flex items-center justify-center">
            <Package size={36} className="text-[#D4A373]" />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold font-playfair text-[#1A2744]">No Products Yet</p>
            <p className="text-sm text-[#8D6E63] mt-1">Add your first bakery item using the button above.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((product: any) => {
            const imgSrc = getImageSrc(product.image, product.images?.[0]?.base64);
            const stock = Number(product.stock) || 0;
            const stockLow = stock > 0 && stock <= 5;
            const stockOut = stock === 0;
            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-[#D4A373]/20 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col relative"
              >
                {/* Top accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4A373] via-[#F5ECD7] to-[#D4A373] opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Cover image */}
                <div className="relative w-full h-44 bg-[#FAF6E6] overflow-hidden">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={32} className="text-[#D4A373]/40" />
                    </div>
                  )}

                  {/* Category badge overlay */}
                  {product.category && (
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 text-[#1A2744] shadow-sm border border-[#D4A373]/20">
                        {product.category}
                      </span>
                    </div>
                  )}

                  {/* Stock badge overlay */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                      stockOut
                        ? 'bg-red-500 text-white'
                        : stockLow
                        ? 'bg-amber-400 text-white'
                        : 'bg-emerald-500 text-white'
                    }`}>
                      {stockOut ? 'Out of stock' : stockLow ? `Low: ${stock}` : `In stock`}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="flex flex-col flex-1 p-4 gap-3">
                  {/* Name + price */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-[#1A2744] text-sm leading-snug truncate group-hover:text-[#D4A373] transition-colors">
                        {product.name}
                      </h3>
                      {product.tasteDescription && (
                        <p className="text-[11px] text-[#8D6E63] mt-0.5 line-clamp-2 font-medium">
                          {product.tasteDescription}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-base font-bold text-[#D4A373] leading-none">
                        ₹{(Number(product.price) || 0).toFixed(0)}
                      </p>
                      <p className="text-[10px] text-[#8D6E63] mt-0.5">{stock} units</p>
                    </div>
                  </div>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 pt-3 border-t border-[#D4A373]/10">
                    <Link
                      to={`/product/${product.id}`}
                      className="flex-1 px-3 py-2 rounded-xl text-xs font-bold text-[#D4A373] bg-[#D4A373]/10 hover:bg-[#D4A373] hover:text-white transition-all flex items-center justify-center gap-1.5 border border-[#D4A373]/20"
                    >
                      <Eye size={12} />
                      View
                    </Link>
                    <button
                      onClick={() => openEdit(product)}
                      className="flex-1 px-3 py-2 rounded-xl text-xs font-bold text-[#1A2744] bg-[#1A2744]/5 hover:bg-[#1A2744] hover:text-white transition-all flex items-center justify-center gap-1.5 border border-[#1A2744]/10"
                    >
                      <Edit size={12} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-all flex items-center gap-1 border border-red-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Sheet open={showModal} onOpenChange={(open) => !open && closeModal()}>
        <SheetContent side="right" className="w-full md:w-[30vw] lg:w-[30vw] p-0 flex flex-col gap-0 bg-[#FAFBFD] border-l-[#D4A373]/20">
          <SheetHeader className="p-6 bg-white border-b border-[#D4A373]/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1A2744] flex items-center justify-center text-white">
                <Package size={20} />
              </div>
              <div>
                <SheetTitle className="font-playfair text-2xl font-bold text-[#1A2744]">
                  {editingId ? 'Edit Product' : 'Add New Product'}
                </SheetTitle>
                <SheetDescription className="text-[#8D6E63] font-medium">
                  {editingId ? 'Update the details for this bakery item.' : 'Create a new item for your bakery menu.'}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <form id="product-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#D4A373]/10">
                <Info size={16} className="text-[#D4A373]" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#1A2744]/60">Basic Information</h4>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#1A2744] flex items-center gap-1.5">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    required
                    value={form.name} 
                    onChange={(e) => setForm({...form, name: e.target.value})} 
                    placeholder="e.g. Chocolate Truffle Cake"
                    className={`w-full p-3 rounded-xl bg-white border ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-[#D4A373]/20 focus:border-[#D4A373]'} outline-none shadow-sm transition-all focus:ring-2 focus:ring-[#D4A373]/10`} 
                  />
                  {errors.name && <p className="text-xs font-medium text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#1A2744]">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({...form, category: e.target.value})}
                      className="w-full p-3 rounded-xl bg-white border border-[#D4A373]/20 outline-none shadow-sm transition-all focus:ring-2 focus:ring-[#D4A373]/10"
                    >
                      {categoriesList && categoriesList.length > 0 ? (
                        categoriesList.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))
                      ) : (
                        <>
                          <option value="Cakes">Cakes</option>
                          <option value="Breads">Breads</option>
                          <option value="Pastries">Pastries</option>
                          <option value="Cookies">Cookies</option>
                          <option value="Custom">Custom</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#1A2744]">Price ($)</label>
                    <div className="relative">
                      <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1A2744]/40" />
                      <input 
                        type="number" 
                        step="0.01" 
                        value={form.price} 
                        onChange={(e) => setForm({...form, price: e.target.value === '' ? '' as any : Number(e.target.value)})} 
                        className={`w-full pl-9 pr-3 py-3 rounded-xl bg-white border ${errors.price ? 'border-red-500' : 'border-[#D4A373]/20'} outline-none shadow-sm transition-all focus:ring-2 focus:ring-[#D4A373]/10`} 
                      />
                    </div>
                    {errors.price && <p className="text-xs font-medium text-red-500 mt-1">{errors.price}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#1A2744]">Initial Stock</label>
                  <div className="relative">
                    <Layers size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1A2744]/40" />
                    <input 
                      type="number" 
                      value={form.stock} 
                      onChange={(e) => setForm({...form, stock: e.target.value === '' ? '' as any : Number(e.target.value)})} 
                      className={`w-full pl-9 pr-3 py-3 rounded-xl bg-white border ${errors.stock ? 'border-red-500' : 'border-[#D4A373]/20'} outline-none shadow-sm transition-all focus:ring-2 focus:ring-[#D4A373]/10`} 
                    />
                  </div>
                  {errors.stock && <p className="text-xs font-medium text-red-500 mt-1">{errors.stock}</p>}
                </div>
              </div>

              {/* Dropdowns populated from APIs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#1A2744]">Flavor</label>
                  <select
                    value={form.flavor}
                    onChange={(e) => setForm({...form, flavor: e.target.value})}
                    className="w-full p-3 rounded-xl bg-white border border-[#D4A373]/20 outline-none shadow-sm transition-all focus:ring-2 focus:ring-[#D4A373]/10 text-sm"
                  >
                    <option value="">Select flavor</option>
                    {flavorsList.map((f) => (<option key={f} value={f}>{f}</option>))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#1A2744]">Weights</label>
                  <select
                    value={(form.weight && form.weight[0]) || ''}
                    onChange={(e) => setForm({...form, weight: e.target.value ? [e.target.value] : []})}
                    className="w-full p-3 rounded-xl bg-white border border-[#D4A373]/20 outline-none shadow-sm transition-all focus:ring-2 focus:ring-[#D4A373]/10 text-sm"
                  >
                    <option value="">Select weight</option>
                    {weightsList.map((w) => (<option key={w} value={w}>{w}</option>))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#1A2744]">Types</label>
                  <select
                    multiple
                    value={form.type}
                    onChange={(e) => setForm({...form, type: Array.from(e.target.selectedOptions).map(o => o.value)})}
                    className="w-full p-3 rounded-xl bg-white border border-[#D4A373]/20 outline-none shadow-sm transition-all focus:ring-2 focus:ring-[#D4A373]/10 text-sm"
                  >
                    {typesList.map((t) => (<option key={t} value={t}>{t}</option>))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#1A2744]">Occasions</label>
                  <select
                    multiple
                    value={form.occasion}
                    onChange={(e) => setForm({...form, occasion: Array.from(e.target.selectedOptions).map(o => o.value)})}
                    className="w-full p-3 rounded-xl bg-white border border-[#D4A373]/20 outline-none shadow-sm transition-all focus:ring-2 focus:ring-[#D4A373]/10 text-sm"
                  >
                    {occasionsList.map((o) => (<option key={o} value={o}>{o}</option>))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#1A2744]">Shapes</label>
                  <select
                    multiple
                    value={form.shape}
                    onChange={(e) => setForm({...form, shape: Array.from(e.target.selectedOptions).map(o => o.value)})}
                    className="w-full p-3 rounded-xl bg-white border border-[#D4A373]/20 outline-none shadow-sm transition-all focus:ring-2 focus:ring-[#D4A373]/10 text-sm"
                  >
                    {shapesList.map((s) => (<option key={s} value={s}>{s}</option>))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#1A2744]">Themes</label>
                  <select
                    multiple
                    value={form.theme}
                    onChange={(e) => setForm({...form, theme: Array.from(e.target.selectedOptions).map(o => o.value)})}
                    className="w-full p-3 rounded-xl bg-white border border-[#D4A373]/20 outline-none shadow-sm transition-all focus:ring-2 focus:ring-[#D4A373]/10 text-sm"
                  >
                    {themesList.map((t) => (<option key={t} value={t}>{t}</option>))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#D4A373]/10">
                <ImageIcon size={16} className="text-[#D4A373]" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#1A2744]/60">Product Images (Gallery)</h4>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {/* Main Image */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1A2744]/60 uppercase tracking-tighter">Cover Image</label>
                  <div className="relative group w-full aspect-video rounded-2xl border-2 border-dashed border-[#D4A373]/20 bg-[#FAF6E6]/30 overflow-hidden flex items-center justify-center">
                    {form.imagePreview || form.image ? (
                      <img src={getImageSrc(form.image, form.imagePreview || undefined)} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-[#1A2744]/40">
                        <ImageIcon size={32} />
                        <span className="text-xs font-medium">Add Cover Photo</span>
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white font-bold text-sm">
                      Change Cover
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null;
                          if (f) {
                            const url = URL.createObjectURL(f);
                            const reader = new FileReader();
                            reader.onload = () => {
                              setForm({...form, imageFile: f, imagePreview: url, image: String(reader.result)});
                            };
                            reader.readAsDataURL(f);
                          }
                        }} 
                      />
                    </label>
                  </div>
                </div>

                {/* Gallery */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-[#1A2744]/60 uppercase tracking-tighter">Gallery Photos</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {form.galleryPreviews.map((gp, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl bg-gray-100 overflow-hidden group border border-[#D4A373]/10">
                        <img src={getImageSrc(gp.url, gp.base64)} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => {
                            const next = [...form.galleryPreviews];
                            next.splice(idx, 1);
                            setForm({ ...form, galleryPreviews: next });
                          }}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <label className="aspect-square rounded-xl border-2 border-dashed border-[#D4A373]/20 bg-[#FAF6E6]/20 flex flex-col items-center justify-center cursor-pointer hover:bg-[#FAF6E6]/40 transition-colors group">
                      <Plus size={20} className="text-[#D4A373] group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold text-[#D4A373] mt-1">Add</span>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          files.forEach(f => {
                            const url = URL.createObjectURL(f);
                            const reader = new FileReader();
                            reader.onload = () => {
                              setForm(prev => ({
                                ...prev,
                                galleryPreviews: [...prev.galleryPreviews, { file: f, url, base64: String(reader.result) }]
                              }));
                            };
                            reader.readAsDataURL(f);
                          });
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1A2744]/60 italic">Or provide a Cover Image URL</label>
                  <input 
                    value={form.image} 
                    onChange={(e) => setForm({...form, image: e.target.value, imagePreview: null, imageFile: null})} 
                    className="w-full p-2 text-xs rounded-lg bg-white border border-[#D4A373]/10"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#D4A373]/10">
                <Filter size={16} className="text-[#D4A373]" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#1A2744]/60">Product Details</h4>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#1A2744]">Ingredients</label>
                  <TagInput 
                    value={form.ingredients} 
                    onChange={(next) => setForm({...form, ingredients: next})} 
                    placeholder="Type and press Enter (e.g. Sugar)" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#1A2744]">Taste Description</label>
                  <textarea 
                    value={form.tasteDescription} 
                    onChange={(e) => setForm({...form, tasteDescription: e.target.value})} 
                    rows={4}
                    placeholder="Describe how it tastes..."
                    className="w-full p-3 rounded-xl bg-white border border-[#D4A373]/20 outline-none shadow-sm transition-all focus:ring-2 focus:ring-[#D4A373]/10 resize-none"
                  />
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-[#D4A373]">{(form.tasteDescription || '').length}/300 characters</span>
                  </div>
                </div>
              </div>
            </div>
          </form>

          <SheetFooter className="p-6 bg-white border-t border-[#D4A373]/10 flex flex-row justify-end gap-3">
            <button 
              type="button" 
              onClick={closeModal} 
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-[#1A2744] hover:bg-[#FAF6E6] border border-[#D4A373]/10 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              form="product-form"
              disabled={loading} 
              className={`px-8 py-2.5 rounded-xl text-sm font-bold text-[#F5ECD7] flex items-center gap-2 shadow-lg hover:shadow-xl transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1A2744] hover:bg-[#D4A373] hover:text-[#1A2744]'}`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                editingId ? 'Save Changes' : 'Create Product'
              )}
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

    </div>
  );
};

export default Products;
