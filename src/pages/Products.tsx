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

const isOversizeDataUri = (value?: string | null) => {
  if (!value || typeof value !== 'string' || !value.startsWith('data:')) return false;
  return estimateDataUriSize(value) > MAX_BYTES;
};

// TagInput: small inline tag editor for ingredients
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
    <div className="flex flex-wrap gap-2 items-center p-3 rounded-2xl bg-white border border-chocolate/10 focus-within:border-strawberry/30 transition-all shadow-sm min-h-[50px]">
      {value.map((tag, i) => (
        <span key={i} className="flex items-center gap-1.5 bg-cream/50 text-xs font-bold text-chocolate px-3 py-1.5 rounded-full border border-chocolate/5 shadow-sm group">
          <span>{tag}</span>
          <button type="button" onClick={() => remove(i)} className="p-0.5 text-chocolate/40 hover:text-strawberry transition-colors">
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        className="flex-1 min-w-[120px] outline-none text-sm placeholder:text-chocolate/30 bg-transparent py-1"
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

// Selectable Badge Group for multiple choices
const SelectableBadgeGroup = ({ 
  options, 
  selected, 
  onChange, 
  label 
}: { 
  options: string[], 
  selected: string[], 
  onChange: (next: string[]) => void, 
  label: string 
}) => {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-chocolate/60 uppercase tracking-widest px-1">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 border ${
                isSelected 
                  ? 'bg-chocolate text-white border-chocolate shadow-md scale-105' 
                  : 'bg-white text-chocolate/60 border-chocolate/10 hover:border-strawberry/30 hover:text-strawberry'
              }`}
            >
              {opt}
            </button>
          );
        })}
        {options.length === 0 && <p className="text-[10px] italic text-chocolate/40 px-1">No options available</p>}
      </div>
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

  // helper to convert File to data URL (used only to upload to backend which will send to Cloudinary)
  const fileToDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateForm();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    if (isOversizeDataUri(form.image)) {
      toast.error('Cover image must be 500KB or smaller');
      return;
    }

    const oversizeGalleryImage = (form.galleryPreviews || []).find((gp) => isOversizeDataUri(gp.base64));
    if (oversizeGalleryImage) {
      toast.error('Gallery image must be 500KB or smaller');
      return;
    }

    dispatch(setLoading(true));

    // prepare payload: convert any local File objects to data URLs so backend uploads to Cloudinary
    const preparePayload = async () => {
      const payload: any = {
        name: form.name,
        category: form.category,
        price: Number(form.price) || 0,
        stock: Number(form.stock) || 0,
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

      // primary image: prefer explicit remote/data URL, otherwise convert local file to data URL for upload
      if (form.image && typeof form.image === 'string' && (form.image.startsWith('http') || form.image.startsWith('data:'))) {
        // if it's already a URL or a data URI, send it as-is (backend will handle data URIs)
        payload.img = form.image;
      } else if (form.imageFile) {
        // convert local File to data URL so backend can upload to Cloudinary
        try {
          payload.img = await fileToDataUrl(form.imageFile);
        } catch (e) {
          payload.img = '';
        }
      }

      // gallery images: map each preview - if it has a file or base64 preview, send as base64 so backend uploads to Cloudinary
      payload.images = await Promise.all((form.galleryPreviews || []).map(async (gp) => {
        // if we already have a base64 string, prefer that
        if (gp.base64 && typeof gp.base64 === 'string' && gp.base64.startsWith('data:')) {
          return { base64: gp.base64 };
        }
        // if there is a File object, convert to data URL
        if (gp.file instanceof File) {
          try {
            const d = await fileToDataUrl(gp.file);
            return { base64: d };
          } catch (e) {
            // fallback to sending the preview URL if conversion fails
            return { url: gp.url || '' };
          }
        }
        // otherwise send the URL (could already be Cloudinary link)
        return { url: gp.url || '' };
      }));

      return payload;
    };

    (async () => {
      try {
        const payload = await preparePayload();

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
      } catch (err: any) {
        dispatch(setError(err?.message || 'Image upload failed'));
        toast.error(err?.message || 'Image upload failed');
        dispatch(setLoading(false));
      }
    })();
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

          <form id="product-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-chocolate/10">
                <div className="p-2 bg-cream rounded-xl">
                    <Info size={18} className="text-chocolate" />
                </div>
                <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-chocolate/80">Essence of Creation</h4>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-chocolate/60 uppercase tracking-widest px-1">
                    Delight Name <span className="text-strawberry">*</span>
                  </label>
                  <input 
                    required
                    value={form.name} 
                    onChange={(e) => setForm({...form, name: e.target.value})} 
                    placeholder="e.g. Midnight Velvet Truffle"
                    className={`w-full p-4 rounded-2xl bg-white border ${errors.name ? 'border-red-500 focus:ring-red-100' : 'border-chocolate/10 focus:border-strawberry/30'} outline-none shadow-sm transition-all focus:ring-4 focus:ring-strawberry/5 text-chocolate font-medium placeholder:text-chocolate/20`} 
                  />
                  {errors.name && <p className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-wider">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-chocolate/60 uppercase tracking-widest px-1">Collection</label>
                    <div className="relative">
                        <select
                        value={form.category}
                        onChange={(e) => setForm({...form, category: e.target.value})}
                        className="w-full p-4 rounded-2xl bg-white border border-chocolate/10 outline-none shadow-sm transition-all focus:border-strawberry/30 text-chocolate font-medium appearance-none cursor-pointer"
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
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                            <Layers size={14} />
                        </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-chocolate/60 uppercase tracking-widest px-1">Investment (₹)</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/30 font-bold">₹</div>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={form.price} 
                        onChange={(e) => setForm({...form, price: e.target.value === '' ? '' as any : Number(e.target.value)})} 
                        className={`w-full pl-10 pr-4 py-4 rounded-2xl bg-white border ${errors.price ? 'border-red-500' : 'border-chocolate/10'} outline-none shadow-sm transition-all focus:border-strawberry/30 text-chocolate font-bold`} 
                      />
                    </div>
                    {errors.price && <p className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-wider">{errors.price}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-chocolate/60 uppercase tracking-widest px-1">Available Reserve (Stock)</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/30">
                        <Package size={16} />
                    </div>
                    <input 
                      type="number" 
                      value={form.stock} 
                      onChange={(e) => setForm({...form, stock: e.target.value === '' ? '' as any : Number(e.target.value)})} 
                      className={`w-full pl-11 pr-4 py-4 rounded-2xl bg-white border ${errors.stock ? 'border-red-500' : 'border-chocolate/10'} outline-none shadow-sm transition-all focus:border-strawberry/30 text-chocolate font-medium`} 
                    />
                  </div>
                  {errors.stock && <p className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-wider">{errors.stock}</p>}
                </div>
              </div>

              {/* Character Details */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-chocolate/60 uppercase tracking-widest px-1">Primary Flavor</label>
                  <select
                    value={form.flavor}
                    onChange={(e) => setForm({...form, flavor: e.target.value})}
                    className="w-full p-4 rounded-2xl bg-white border border-chocolate/10 outline-none shadow-sm transition-all focus:border-strawberry/30 text-chocolate font-medium appearance-none cursor-pointer text-sm"
                  >
                    <option value="">Select Signature Flavor</option>
                    {flavorsList.map((f) => (<option key={f} value={f}>{f}</option>))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-chocolate/60 uppercase tracking-widest px-1">Standard Weight</label>
                  <select
                    value={(form.weight && form.weight[0]) || ''}
                    onChange={(e) => setForm({...form, weight: e.target.value ? [e.target.value] : []})}
                    className="w-full p-4 rounded-2xl bg-white border border-chocolate/10 outline-none shadow-sm transition-all focus:border-strawberry/30 text-chocolate font-medium appearance-none cursor-pointer text-sm"
                  >
                    <option value="">Choose Scale</option>
                    {weightsList.map((w) => (<option key={w} value={w}>{w}</option>))}
                  </select>
                </div>
              </div>

              {/* Selectable Badges for Multi-selects */}
              <div className="space-y-6">
                <SelectableBadgeGroup 
                    label="Artistry Types" 
                    options={typesList} 
                    selected={form.type || []} 
                    onChange={(next) => setForm({...form, type: next})} 
                />
                
                <SelectableBadgeGroup 
                    label="Tailored Occasions" 
                    options={occasionsList} 
                    selected={form.occasion || []} 
                    onChange={(next) => setForm({...form, occasion: next})} 
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectableBadgeGroup 
                        label="Shapes" 
                        options={shapesList} 
                        selected={form.shape || []} 
                        onChange={(next) => setForm({...form, shape: next})} 
                    />
                    <SelectableBadgeGroup 
                        label="Themes" 
                        options={themesList} 
                        selected={form.theme || []} 
                        onChange={(next) => setForm({...form, theme: next})} 
                    />
                </div>
              </div>
            </div>

            {/* Visuals Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-chocolate/10">
                <div className="p-2 bg-cream rounded-xl">
                    <ImageIcon size={18} className="text-chocolate" />
                </div>
                <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-chocolate/80">Visual Identity</h4>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-chocolate/60 uppercase tracking-widest px-1">Master Portrait (Cover)</label>
                  <div className="relative group w-full aspect-[16/9] rounded-[2rem] border-2 border-dashed border-chocolate/10 bg-cream/30 overflow-hidden flex items-center justify-center transition-all hover:border-strawberry/20 hover:bg-cream/50 shadow-inner">
                    {form.imagePreview || form.image ? (
                      <div className="relative w-full h-full">
                        <img src={getImageSrc(form.image, form.imagePreview || undefined)} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-chocolate/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-chocolate/20">
                        <div className="p-5 bg-white rounded-full shadow-bakery">
                            <ImageIcon size={40} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest">Unveil Masterpiece</span>
                      </div>
                    )}
                    <label className="absolute inset-0 flex items-center justify-center cursor-pointer pointer-events-none group-hover:pointer-events-auto">
                      <div className="bg-white/90 backdrop-blur-md px-6 py-2.5 rounded-full shadow-lg text-chocolate font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        {form.image || form.imagePreview ? 'Replace Canvas' : 'Select Photo'}
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null;
                          if (f) {
                            if (f.size > MAX_BYTES) { toast.error('Work of art must be 500KB or smaller'); return; }
                            const url = URL.createObjectURL(f);
                            // Do not convert to base64. Keep file object and object URL preview only.
                            setForm({...form, imageFile: f, imagePreview: url, image: ''});
                          }
                        }} 
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-chocolate/60 uppercase tracking-widest px-1">Gallery Collection</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    {form.galleryPreviews.map((gp, idx) => (
                      <div key={idx} className="relative aspect-square rounded-2xl bg-white overflow-hidden group border border-chocolate/10 shadow-sm hover:shadow-md transition-all">
                        <img src={getImageSrc(gp.url, gp.base64)} alt={`Gallery ${idx}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <button 
                          type="button" 
                          onClick={() => {
                            const next = [...form.galleryPreviews];
                            next.splice(idx, 1);
                            setForm({ ...form, galleryPreviews: next });
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-chocolate/10 bg-cream/10 flex flex-col items-center justify-center cursor-pointer hover:bg-cream/30 hover:border-strawberry/30 transition-all group">
                      <div className="p-2 bg-white rounded-full shadow-sm text-chocolate group-hover:text-strawberry group-hover:scale-110 transition-all duration-300">
                        <Plus size={20} />
                      </div>
                      <span className="text-[10px] font-bold text-chocolate/40 mt-2 uppercase tracking-widest">Add Piece</span>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          const readers = files.map(f => {
                            if (f.size > MAX_BYTES) { toast.error(`${f.name} exceeds 500KB and was skipped`); return Promise.resolve(null); }
                            const url = URL.createObjectURL(f);
                            return new Promise((resolve) => {
                              const fr = new FileReader();
                              fr.onload = () => {
                                const base64 = typeof fr.result === 'string' ? fr.result : null;
                                resolve({ file: f, url, base64 });
                              };
                              fr.onerror = () => resolve({ file: f, url, base64: null });
                              fr.readAsDataURL(f);
                            });
                          });
                          Promise.all(readers).then(results => {
                            const valid = results.filter(r => r !== null);
                            if (valid.length === 0) return;
                            setForm(prev => ({
                              ...prev,
                              galleryPreviews: [...prev.galleryPreviews, ...valid]
                            }));
                          });
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-chocolate/60 uppercase tracking-widest px-1 italic">Distant Artifact (Image URL)</label>
                  <input 
                    value={form.image} 
                    onChange={(e) => {
                      const val = e.target.value || '';
                      // Accept pasted data URIs or remote URLs but do not create base64 previews locally.
                      if (val.startsWith('data:')) {
                        const size = estimateDataUriSize(val);
                        if (size > MAX_BYTES) { toast.error('Pasted image must be 500KB or smaller'); return; }
                        setForm({...form, image: val, imagePreview: null, imageFile: null});
                      } else {
                        setForm({...form, image: val, imagePreview: null, imageFile: null});
                      }
                    }} 
                    className="w-full p-4 text-xs rounded-2xl bg-white border border-chocolate/5 focus:border-strawberry/30 outline-none text-chocolate/60 italic font-medium shadow-inner"
                    placeholder="https://exquisite-bakery.com/masterpiece.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Gastronomy Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-chocolate/10">
                <div className="p-2 bg-cream rounded-xl">
                    <Filter size={18} className="text-chocolate" />
                </div>
                <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-chocolate/80">Gastronomy</h4>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-xs font-bold text-chocolate/60 uppercase tracking-widest">Secret Ingredients</label>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedIngredient(ingredientOptions[0]?.id || '');
                        setIngredientQty(100);
                        setShowIngredientModal(true);
                      }}
                      className="flex items-center gap-1.5 text-[10px] font-bold text-strawberry uppercase tracking-wider hover:text-chocolate transition-colors"
                    >
                      <Plus size={12} />
                      Harvest New
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 min-h-[50px] p-4 bg-white rounded-2xl border border-chocolate/5 shadow-inner">
                    {(form.ingredients || []).length > 0 ? (form.ingredients || []).map((ing, idx) => (
                      <span key={idx} className="flex items-center gap-2 bg-chocolate text-white px-4 py-2 rounded-full shadow-sm animate-in zoom-in duration-300">
                        <span className="text-[11px] font-bold tracking-wide">{ing}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const next = [...(form.ingredients || [])];
                            next.splice(idx, 1);
                            setForm({ ...form, ingredients: next });
                          }}
                          className="p-1 rounded-full bg-white/20 hover:bg-white/40 transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    )) : <p className="text-xs text-chocolate/20 italic font-medium">No ingredients added yet...</p>}
                  </div>

                  {/* Redesigned Ingredient Modal */}
                  {showIngredientModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                      <div className="absolute inset-0 bg-chocolate/60 backdrop-blur-sm" onClick={() => setShowIngredientModal(false)} />
                      <div className="relative bg-[#FAFBFD] rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl z-10 border border-white/20 animate-in zoom-in-95 duration-300 font-lora">
                        <div className="text-center space-y-2 mb-8">
                            <h4 className="text-2xl font-bold text-chocolate font-dancing">Ingredient Detail</h4>
                            <p className="text-xs text-chocolate/40 font-bold uppercase tracking-widest">Add to your masterpiece</p>
                        </div>
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-chocolate/60 uppercase tracking-[0.2em] px-1">Element</label>
                            <select 
                                value={selectedIngredient} 
                                onChange={(e) => setSelectedIngredient(e.target.value)} 
                                className="w-full p-4 rounded-2xl bg-white border border-chocolate/10 outline-none text-chocolate font-medium shadow-sm"
                            >
                              <option value="">Select an element</option>
                              {ingredientOptions.map((opt) => (
                                <option key={opt.id} value={opt.id}>{opt.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-chocolate/60 uppercase tracking-[0.2em] px-1">Portion (Grams)</label>
                            <input 
                                type="number" 
                                value={ingredientQty} 
                                onChange={(e) => setIngredientQty(Number(e.target.value) || 0)} 
                                className="w-full p-4 rounded-2xl bg-white border border-chocolate/10 outline-none text-chocolate font-bold shadow-sm" 
                            />
                          </div>
                        </div>
                        <div className="flex gap-4 mt-10">
                          <button 
                            type="button" 
                            onClick={() => setShowIngredientModal(false)} 
                            className="flex-1 py-4 px-6 rounded-full text-xs font-bold text-chocolate border border-chocolate/10 hover:bg-white transition-all uppercase tracking-widest"
                          >
                            Discard
                          </button>
                          <button 
                            type="button" 
                            onClick={() => {
                              if (!selectedIngredient) { toast.error('Select an element'); return; }
                              if (!ingredientQty || ingredientQty <= 0) { toast.error('Enter a valid portion'); return; }
                              const picked = ingredientOptions.find(i => i.id === selectedIngredient);
                              const name = picked?.name || selectedIngredient;
                              const entry = `${name} (${ingredientQty}g)`;
                              setForm(prev => ({ ...prev, ingredients: [...(prev.ingredients || []), entry] }));
                              setShowIngredientModal(false);
                            }} 
                            className="flex-1 py-4 px-6 bg-chocolate text-white rounded-full text-xs font-bold shadow-lg hover:bg-strawberry hover:shadow-strawberry/20 transition-all uppercase tracking-widest"
                          >
                            Incorporate
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-xs font-bold text-chocolate/60 uppercase tracking-widest">Symphony of Taste (Description)</label>
                    <span className="text-[10px] font-bold text-chocolate/30">{(form.tasteDescription || '').length}/300</span>
                  </div>
                  <textarea 
                    value={form.tasteDescription} 
                    onChange={(e) => setForm({...form, tasteDescription: e.target.value.slice(0, 300)})} 
                    rows={5}
                    placeholder="Describe the sensory experience, the notes of sweetness, and the lingering aftertaste..."
                    className="w-full p-5 rounded-[1.5rem] bg-white border border-chocolate/5 outline-none shadow-sm transition-all focus:border-strawberry/30 resize-none text-chocolate font-medium placeholder:text-chocolate/20 text-sm leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </form>


          <SheetFooter className="p-8 bg-white border-t border-chocolate/10 flex flex-row items-center justify-between gap-6">
            <button 
              type="button" 
              onClick={closeModal} 
              className="px-8 py-4 rounded-full text-xs font-bold text-chocolate/60 uppercase tracking-[0.2em] hover:bg-chocolate/5 transition-all font-lora"
            >
              Discard Changes
            </button>
            <button 
              type="submit" 
              form="product-form"
              disabled={loading} 
              className={`px-12 py-4 rounded-full text-xs font-bold text-white uppercase tracking-[0.2em] flex items-center gap-3 shadow-bakery-lg hover:shadow-bakery-xl hover:scale-[1.02] transition-all duration-300 ${loading ? 'bg-chocolate/40 cursor-not-allowed' : 'bg-chocolate hover:bg-strawberry'}`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Preserving...
                </>
              ) : (
                editingId ? 'Save Artistry' : 'Unveil Masterpiece'
              )}
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

    </div>
  );
};

export default Products;
