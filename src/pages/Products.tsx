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

const MAX_BYTES = 500 * 1024; // 500KB

const estimateDataUriSize = (dataUri: string) => {
  if (!dataUri || !dataUri.includes(',')) return 0;
  const base64Part = dataUri.split(',')[1];
  return Math.round((base64Part.length * 3) / 4);
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

  // Ingredient modal state: show modal, options (id + name), selected id and quantity
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [ingredientOptions, setIngredientOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<string>(''); // holds ingredient id
  const [ingredientQty, setIngredientQty] = useState<number>(100);

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
      api.ingredientDetails.getAll().catch(() => []),
    ]).then(([cats, flvs, wts, typesRes, occ, shp, thm, ingredientsRes]) => {
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

      const ings = (ingredientsRes || []).map((i: any) => ({
        id: i._id || i.id,
        name: i.name || ''
      })).filter((i: any) => i.name);
      setIngredientOptions(ings);
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
    <div className="space-y-8 animate-in fade-in duration-700 font-lora">

      {/* ── Page Header ───────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold font-dancing text-chocolate">
            Couture Menu{" "}
            <span className="inline-block animate-bounce text-strawberry text-2xl">🧁</span>
          </h2>
          <p className="text-sm text-chocolate-light font-medium mt-1">
            Meticulously manage your exquisite bakery offerings and inventory.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {products.length > 0 && (
            <div className="px-5 py-2.5 rounded-2xl bg-white border border-chocolate/10 text-sm font-bold text-chocolate flex items-center gap-2 shadow-bakery">
              <Package size={16} className="text-strawberry" />
              {products.length} {products.length === 1 ? 'Creation' : 'Creations'}
            </div>
          )}
          <button
            onClick={openAdd}
            className="px-6 py-3 bg-chocolate text-white rounded-full flex items-center gap-2 shadow-bakery hover:shadow-bakery-lg hover:bg-strawberry transition-all duration-300 group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            <span className="font-bold text-xs uppercase tracking-widest">New Delight</span>
          </button>
        </div>
      </div>

      {/* ── Search Bar ────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-3xl shadow-bakery border border-chocolate/5">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/30 group-focus-within:text-strawberry transition-colors w-4 h-4" />
          <input
            type="text"
            placeholder="Search our fine collection..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-transparent focus:border-strawberry/20 focus:bg-white text-sm text-chocolate placeholder:text-chocolate/30 outline-none transition-all"
          />
        </div>
        <button className="p-3 bg-white rounded-2xl text-chocolate hover:bg-strawberry hover:text-white transition-all shadow-sm border border-chocolate/5">
          <Filter size={18} />
        </button>
      </div>

      {/* ── Product Cards Grid ────────────────────────────────────── */}
      {products.length === 0 ? (
        <div className="bg-white/50 backdrop-blur-sm rounded-[2rem] border border-chocolate/10 shadow-bakery p-20 flex flex-col items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-chocolate/10 to-strawberry/10 flex items-center justify-center border border-white/40 shadow-inner">
            <Package size={40} className="text-chocolate/30" />
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold font-dancing text-chocolate">The pantry is empty</p>
            <p className="text-sm text-chocolate-light font-medium mt-1">Shall we begin by adding an exquisite new item?</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product: any) => {
            const imgSrc = getImageSrc(product.image, product.images?.[0]?.base64);
            const stock = Number(product.stock) || 0;
            const stockLow = stock > 0 && stock <= 5;
            const stockOut = stock === 0;
            return (
              <div
                key={product.id}
                className="bg-white rounded-[2rem] border border-chocolate/5 shadow-bakery hover:shadow-bakery-lg transition-all duration-500 overflow-hidden group flex flex-col relative"
              >
                {/* Cover image */}
                <div className="relative w-full h-52 bg-cream overflow-hidden">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-30">
                      <Package size={48} className="text-chocolate" />
                    </div>
                  )}

                  {/* Badges overlay */}
                  <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none">
                    {product.category && (
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-chocolate text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm border border-white/20">
                        {product.category}
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm backdrop-blur-md ${
                      stockOut
                        ? 'bg-red-500/90 text-white'
                        : stockLow
                        ? 'bg-amber-400/90 text-white'
                        : 'bg-emerald-500/90 text-white'
                    }`}>
                      {stockOut ? 'Out' : stockLow ? `Low: ${stock}` : `Luxury`}
                    </span>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-chocolate/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Body */}
                <div className="flex flex-col flex-1 p-6 space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold text-chocolate text-base leading-tight truncate group-hover:text-strawberry transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-lg font-bold text-strawberry whitespace-nowrap">
                        ₹{(Number(product.price) || 0).toLocaleString()}
                      </p>
                    </div>
                    {product.tasteDescription && (
                      <p className="text-xs text-chocolate-light line-clamp-2 italic font-medium leading-relaxed">
                        {product.tasteDescription}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-4 mt-auto">
                    <button
                      onClick={() => openEdit(product)}
                      className="flex-1 px-4 py-2.5 rounded-full text-xs font-bold text-white bg-chocolate hover:bg-strawberry transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Edit size={14} />
                      Detail
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2.5 rounded-full text-red-500 hover:text-white hover:bg-red-500 border border-red-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Sheet open={showModal} onOpenChange={(open) => !open && closeModal()}>
        <SheetContent side="right" className="flex flex-col h-full bg-[#FAFBFD] p-0 border-l border-chocolate/10">
          <SheetHeader className="p-8 bg-white border-b border-chocolate/5 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-strawberry/5 rounded-full -mr-16 -mt-16 blur-3xl" />
             <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 bg-chocolate text-white rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform">
                  <Package size={28} />
                </div>
                <div>
                  <SheetTitle className="text-3xl font-bold text-chocolate font-dancing">
                    {editingId ? 'Edit Couture Item' : 'New creation'}
                  </SheetTitle>
                  <SheetDescription className="text-chocolate-light font-medium flex items-center gap-1.5 mt-0.5">
                    {editingId ? (
                      <>Refining the artistry of <span className="text-strawberry font-bold">{form.name}</span></>
                    ) : 'Introduce a new sensory delight to your collection.'}
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
                            if (f.size > MAX_BYTES) { toast.error('Image must be 500KB or smaller'); return; }
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
                            if (f.size > MAX_BYTES) { toast.error(`${f.name} exceeds 500KB and was skipped`); return; }
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
                    onChange={(e) => {
                      const val = e.target.value || '';
                      // if user pasted data URI, enforce size
                      if (val.startsWith('data:')) {
                        const size = estimateDataUriSize(val);
                        if (size > MAX_BYTES) { toast.error('Data URI image must be 500KB or smaller'); return; }
                        // accept
                        setForm({...form, image: val, imagePreview: null, imageFile: null});
                      } else {
                        setForm({...form, image: val, imagePreview: null, imageFile: null});
                      }
                    }} 
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
                  <div className="flex items-center gap-3">
                    <div className="flex flex-wrap gap-2">
                      {(form.ingredients || []).length > 0 ? (form.ingredients || []).map((ing, idx) => (
                        <span key={idx} className="flex items-center gap-1 bg-[#FAF6E6] text-sm text-[#1A2744] px-2 py-0.5 rounded-full border border-[#D4A373]/20">
                          <span className="text-xs">{ing}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...(form.ingredients || [])];
                              next.splice(idx, 1);
                              setForm({ ...form, ingredients: next });
                            }}
                            className="p-0.5 opacity-70 hover:opacity-100 ml-1"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      )) : <span className="text-xs text-slate-400">No ingredients</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        // open inline modal to add ingredient + grams
                        setSelectedIngredient(ingredientOptions[0]?.id || '');
                        setIngredientQty(100);
                        setShowIngredientModal(true);
                      }}
                      className="ml-auto px-3 py-2 bg-[#1A2744] text-white rounded text-xs hover:bg-[#D4A373] transition-colors"
                    >
                      Add Ingredient
                    </button>
                  </div>

                  {/* Ingredient add modal */}
                  {showIngredientModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                      <div className="absolute inset-0 bg-black/40" onClick={() => setShowIngredientModal(false)} />
                      <div className="relative bg-white rounded-lg p-5 w-full max-w-md shadow-lg z-10">
                        <h4 className="text-lg font-semibold mb-3">Add Ingredient</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm block mb-1">Ingredient</label>
                            <select value={selectedIngredient} onChange={(e) => setSelectedIngredient(e.target.value)} className="w-full p-2 border rounded">
                              <option value="">Select ingredient</option>
                              {ingredientOptions.map((opt) => (
                                <option key={opt.id} value={opt.id}>{opt.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-sm block mb-1">Quantity (grams)</label>
                            <input type="number" value={ingredientQty} onChange={(e) => setIngredientQty(Number(e.target.value) || 0)} className="w-full p-2 border rounded" />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                          <button type="button" onClick={() => setShowIngredientModal(false)} className="px-3 py-2 rounded border">Cancel</button>
                          <button type="button" onClick={() => {
                            if (!selectedIngredient) { toast.error('Select an ingredient'); return; }
                            if (!ingredientQty || ingredientQty <= 0) { toast.error('Enter quantity in grams'); return; }
                            const picked = ingredientOptions.find(i => i.id === selectedIngredient);
                            const name = picked?.name || selectedIngredient;
                            const entry = `${name} (${ingredientQty}g)`;
                            setForm(prev => ({ ...prev, ingredients: [...(prev.ingredients || []), entry] }));
                            setShowIngredientModal(false);
                          }} className="px-3 py-2 bg-[#1A2744] text-white rounded">Add</button>
                        </div>
                      </div>
                    </div>
                  )}
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

          <SheetFooter className="p-8 bg-white border-t border-chocolate/5 flex flex-row items-center justify-between gap-4">
            <button 
              type="button" 
              onClick={closeModal} 
              className="px-6 py-3 rounded-full text-sm font-bold text-chocolate hover:bg-chocolate/5 border border-chocolate/10 transition-all font-lora"
            >
              Close Studio
            </button>
            <button 
              type="submit" 
              form="product-form"
              disabled={loading} 
              className={`px-10 py-3 rounded-full text-sm font-bold text-white flex items-center gap-2 shadow-bakery hover:shadow-bakery-lg transition-all duration-300 ${loading ? 'bg-chocolate/40 cursor-not-allowed' : 'bg-chocolate hover:bg-strawberry'}`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Preserving...
                </>
              ) : (
                editingId ? 'Update Artistry' : 'Unveil Masterpiece'
              )}
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

    </div>
  );
};

export default Products;
