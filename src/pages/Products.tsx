import { Plus, Minus, Search, Edit, Trash2, Filter, X, Package, DollarSign, Layers, Info, Image as ImageIcon, Eye, ChevronRight, ChevronDown } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setProducts, setLoading, setError } from "../store/slices/productSlice";
import { api } from "../services/api";
import axiosInstance from "../services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Checkbox } from "../components/ui/checkbox";
import { ScrollArea } from "../components/ui/scroll-area";
import { toast } from "sonner";
import { Link } from 'react-router-dom';

interface ProductImage {
  url: string;
  base64?: string;
}

interface Product {
  id?: string;
  _id?: string;
  name: string;
  category: string;
  mrp: number | string;
  sellingPrice: number | string;
  stock: number | string;
  image: string;
  images?: ProductImage[];
  flavor?: any; // can be string (legacy) or object { _id, name }
  ingredients?: any[];
  type?: any[];
  weight?: any[];
  pricesByWeight?: number[];
  variants?: { weight?: any; mrp: number; sellingPrice: number; stock: number }[];
  occasion?: any[];
  shape?: any[];
  theme?: any[];
  tasteDescription?: string;
  totalNutrition?: any;
  [key: string]: any;
}

interface ProductForm extends Product {
  price: number | string;
  stock: number | string;
  imageFile?: File | null;
  imagePreview?: string | null;
  galleryPreviews: { file?: File, url: string, base64?: string }[];
}

const emptyForm: ProductForm = {
  name: "",
  category: "Cakes",
  mrp: 0,
  sellingPrice: 0,
  stock: 0,
  image: "",
  images: [],
  flavor: [],
  ingredients: [],
  type: [],
  weight: [],
  occasion: [],
  shape: [],
  theme: [],
  variants: [],
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
  options: { id: string, name: string }[],
  selected: string[],
  onChange: (next: string[]) => void,
  label: string
}) => {
  const toggle = (optId: string) => {
    if (selected.includes(optId)) {
      onChange(selected.filter(s => s !== optId));
    } else {
      onChange([...selected, optId]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-chocolate uppercase tracking-wider px-1">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggle(opt.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 border ${isSelected
                ? 'bg-chocolate text-white border-chocolate shadow-md scale-105'
                : 'bg-white text-chocolate border-chocolate/30 hover:border-strawberry/30 hover:text-strawberry'
                }`}
            >
              {opt.name}
            </button>
          );
        })}
        {options.length === 0 && <p className="text-xs italic text-chocolate/60 px-1">No options available</p>}
      </div>
    </div>
  );
};

// MultiSelect Dropdown for a cleaner UI
const MultiSelectDropdown = ({
  options,
  selected,
  onChange,
  label,
  placeholder = "Select options"
}: {
  options: { id: string, name: string }[],
  selected: string[],
  onChange: (next: string[]) => void,
  label: string,
  placeholder?: string
}) => {
  const toggle = (optId: string) => {
    if (selected.includes(optId)) {
      onChange(selected.filter(s => s !== optId));
    } else {
      onChange([...selected, optId]);
    }
  };

  const selectedNames = options
    .filter(o => selected.includes(o.id))
    .map(o => o.name);

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-chocolate uppercase tracking-wider px-1">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-chocolate/30 hover:border-strawberry/30 transition-all shadow-sm min-h-[54px] text-left"
          >
            <div className="flex flex-wrap gap-1.5 items-center overflow-hidden">
              {selectedNames.length > 0 ? (
                selectedNames.map((name, i) => (
                  <span key={i} className="bg-strawberry text-[10px] font-bold text-white px-2 py-1 rounded-lg border border-strawberry/10 shadow-sm animate-in zoom-in-95 duration-200">
                    {name}
                  </span>
                ))
              ) : (
                <span className="text-sm text-chocolate/40 font-medium">{placeholder}</span>
              )}
            </div>
            <ChevronDown size={14} className="text-chocolate/40 shrink-0 ml-2" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-2 bg-white rounded-2xl border border-chocolate/10 shadow-bakery-xl font-lora" align="start">
          <div className="space-y-1 max-h-[300px] overflow-y-auto no-scrollbar p-1">
            {options.length === 0 && <p className="text-xs italic text-chocolate/60 p-4 text-center">No options available</p>}
            {options.map((opt) => {
              const isSelected = selected.includes(opt.id);
              return (
                <div
                  key={opt.id}
                  onClick={() => toggle(opt.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all hover:bg-strawberry/5 group cursor-pointer ${isSelected ? 'text-strawberry bg-strawberry/5' : 'text-chocolate'}`}
                >
                  <Checkbox 
                    checked={isSelected} 
                    onCheckedChange={() => toggle(opt.id)}
                    className={`border-chocolate/20 data-[state=checked]:bg-strawberry data-[state=checked]:border-strawberry`}
                  />
                  <span>{opt.name}</span>
                </div>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

interface GroupOption {
  id: string;
  name: string;
  sub?: string[];
  subthemes?: string[];
  suboccasions?: string[];
  subitems?: string[];
  categories?: string[];
}

// helper matches (case-insensitive, tolerant to simple plural)
const matches = (a?: string | null, b?: string | null) => {
  if (!a || !b) return false;
  const A = String(a).toLowerCase().trim();
  const B = String(b).toLowerCase().trim();
  if (A === B) return true;
  if (A === B + 's' || B === A + 's') return true;
  return false;
};

// Grouped selectable badges: supports parent items with optional subitems. Parent has separate expand control.
const GroupedSelectableBadgeGroup = ({
  options,
  selected,
  onChange,
  label
}: {
  options: GroupOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  label: string;
}) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleSelect = (id: string) => {
    if (!id) return;
    if (selected.includes(id)) onChange(selected.filter(s => s !== id));
    else onChange([...selected, id]);
  };

  const toggleExpand = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-chocolate uppercase tracking-wider px-1">{label}</label>
      <div className="space-y-2">
        {options.length === 0 && <p className="text-xs italic text-chocolate/60 px-1">No options available</p>}
        {options.map((opt) => {
          const id = opt.id;
          const name = opt.name;
          const subs: string[] = Array.isArray(opt.sub) ? opt.sub : (Array.isArray(opt.suboccasions) ? opt.suboccasions : (Array.isArray(opt.subthemes) ? opt.subthemes : (Array.isArray(opt.subitems) ? opt.subitems : (opt.sub || [])))) as string[];
          const isParentSelected = selected.includes(id);
          const isExpanded = Boolean(expanded[id]);

          return (
            <div key={id} className="bg-white rounded-2xl p-3 border border-chocolate/30 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleSelect(id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 border ${isParentSelected ? 'bg-chocolate text-white border-chocolate shadow-md' : 'bg-white text-chocolate border-chocolate/30 hover:border-strawberry/30 hover:text-strawberry'}`}
                  >
                    {name}
                  </button>
                  {subs && subs.length > 0 && (
                    <button type="button" onClick={() => toggleExpand(id)} className="p-2 rounded-full text-chocolate/50 hover:text-chocolate transition-colors">
                      <ChevronRight className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                  )}
                </div>
              </div>

              {isExpanded && subs && subs.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {subs.map((s) => {
                    const isSel = selected.includes(s); // subs are still strings in the model
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSelect(s)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isSel ? 'bg-chocolate text-white' : 'bg-white text-chocolate border border-chocolate/30 hover:bg-cream/20'}`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Grouped MultiSelect Dropdown
const GroupedMultiSelectDropdown = ({
  options,
  selected,
  onChange,
  label,
  placeholder = "Select options"
}: {
  options: GroupOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  label: string;
  placeholder?: string;
}) => {
  const toggleSelect = (id: string) => {
    if (!id) return;
    if (selected.includes(id)) onChange(selected.filter(s => s !== id));
    else onChange([...selected, id]);
  };

  const getSelectedNames = () => {
    const names: string[] = [];
    options.forEach(opt => {
      if (selected.includes(opt.id)) names.push(opt.name);
      const subs: string[] = Array.isArray(opt.sub) ? opt.sub : (Array.isArray(opt.suboccasions) ? opt.suboccasions : (Array.isArray(opt.subthemes) ? opt.subthemes : (Array.isArray(opt.subitems) ? opt.subitems : (opt.sub || [])))) as string[];
      subs.forEach(s => {
        if (selected.includes(s)) names.push(s);
      });
    });
    return names;
  };

  const selectedNames = getSelectedNames();

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-chocolate uppercase tracking-wider px-1">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-chocolate/30 hover:border-strawberry/30 transition-all shadow-sm min-h-[54px] text-left"
          >
            <div className="flex flex-wrap gap-1.5 items-center overflow-hidden">
              {selectedNames.length > 0 ? (
                <>
                  {selectedNames.slice(0, 3).map((name, i) => (
                    <span key={i} className="bg-strawberry text-[10px] font-bold text-white px-2 py-1 rounded-lg border border-strawberry/10 shadow-sm animate-in zoom-in-95 duration-200">
                      {name}
                    </span>
                  ))}
                  {selectedNames.length > 3 && (
                    <span className="text-[10px] font-black text-strawberry/60 ml-1">+{selectedNames.length - 3} more</span>
                  )}
                </>
              ) : (
                <span className="text-sm text-chocolate/40 font-medium">{placeholder}</span>
              )}
            </div>
            <ChevronDown size={14} className="text-chocolate/40 shrink-0 ml-2" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-2 bg-white rounded-2xl border border-chocolate/10 shadow-bakery-xl font-lora" align="start">
          <ScrollArea className="h-80 w-full pr-2">
            <div className="space-y-3 p-1">
              {options.length === 0 && <p className="text-xs italic text-chocolate/60 p-4 text-center">No options available</p>}
              {options.map((opt) => {
                const id = opt.id;
                const name = opt.name;
                const subs: string[] = Array.isArray(opt.sub) ? opt.sub : (Array.isArray(opt.suboccasions) ? opt.suboccasions : (Array.isArray(opt.subthemes) ? opt.subthemes : (Array.isArray(opt.subitems) ? opt.subitems : (opt.sub || [])))) as string[];
                const isParentSelected = selected.includes(id);

                return (
                  <div key={id} className="space-y-1">
                    <div
                      onClick={() => toggleSelect(id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-black transition-all hover:bg-strawberry/5 cursor-pointer ${isParentSelected ? 'text-strawberry bg-strawberry/5' : 'text-chocolate'}`}
                    >
                      <Checkbox 
                        checked={isParentSelected} 
                        onCheckedChange={() => toggleSelect(id)}
                        className={`border-chocolate/20 data-[state=checked]:bg-strawberry data-[state=checked]:border-strawberry`}
                      />
                      <span>{name}</span>
                    </div>
                    {subs && subs.length > 0 && (
                      <div className="pl-8 grid grid-cols-1 gap-1">
                        {subs.map((s) => {
                          const isSel = selected.includes(s);
                          return (
                            <div
                              key={s}
                              onClick={() => toggleSelect(s)}
                              className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:bg-strawberry/5 cursor-pointer ${isSel ? 'text-strawberry' : 'text-chocolate/60'}`}
                            >
                               <Checkbox 
                                checked={isSel} 
                                onCheckedChange={() => toggleSelect(s)}
                                className={`h-3.5 w-3.5 border-chocolate/20 data-[state=checked]:bg-strawberry data-[state=checked]:border-strawberry`}
                              />
                              <span>{s}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
};


const Products = () => {
  const dispatch = useAppDispatch();
  const { items: products, loading, error } = useAppSelector((state) => state.products);

  // dropdown lists from API
  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [categoriesData, setCategoriesData] = useState<{ id: string, name: string }[]>([]);
  const [flavorsList, setFlavorsList] = useState<{ id: string, name: string, categories?: string[] }[]>([]);
  const [weightsList, setWeightsList] = useState<{ id: string, name: string, categories?: string[] }[]>([]);
  const [typesList, setTypesList] = useState<{ id: string, name: string, categories?: string[] }[]>([]);
  const [occasionsList, setOccasionsList] = useState<GroupOption[]>([]);
  const [shapesList, setShapesList] = useState<{ id: string, name: string, categories?: string[] }[]>([]);
  const [themesList, setThemesList] = useState<GroupOption[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12); // items per page
  // Search query for product list
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Reset to first page when search query, selected category, or page size changes
  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedCategory, pageSize]);

  // Ingredient modal state: show modal, options (id + name), selected id and quantity
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [ingredientOptions, setIngredientOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<string>(''); // holds ingredient id
  const [ingredientQty, setIngredientQty] = useState<number>(100);

  // Stock adjustment reason modal
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [stockReason, setStockReason] = useState('');
  const [originalProduct, setOriginalProduct] = useState<Product | null>(null);

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
      url: img.url || img.img || img.path || img.filename || '',
      base64: img.base64 || img.imgBase64 || img.data || undefined,
    };
  }, []);

  const normalizeSingle = useCallback((p: any) => {
    const imgs = (p.images || []).map((it: any) => normalizeImage(it));
    const getVal = (it: any) => it?.name || it?.title || String(it || '');
    const getId = (val: any) => val?._id || val?.id || (typeof val === 'string' ? val : '');
    const getIds = (val: any) => {
      if (!val) return [];
      const arr = Array.isArray(val) ? val : [val];
      return arr.map(it => getId(it)).filter(Boolean);
    };
    const normalizedVariants = Array.isArray(p.variants)
      ? p.variants.map((v: any) => ({
        weight: v.weight?._id || v.weight?.id || String(v.weight || ''),
        mrp: Number(v.mrp || v.price) || 0,
        sellingPrice: Number(v.sellingPrice) || 0,
        stock: Number(v.stock) || 0
      }))
      : (p.weight || []).map((w: any, i: number) => ({
        weight: w?._id || w?.id || String(w || ''),
        mrp: (p.pricesByWeight && p.pricesByWeight[i]) || Number(p.price) || 0,
        sellingPrice: 0,
        stock: 0
      }));

    return {
      // preserve all original properties
      ...p,
      id: p._id || p.id,
      // normalize images array to consistent shape
      images: imgs,
      // prefer base64 image coming from backend (imgBase64) then first gallery base64 then fallback to stored paths
      image: p.imgBase64 || imgs.find((i: any) => i.base64)?.base64 || p.img || imgs.find((i: any) => i.url)?.url || p.image || '/placeholder.svg',
      // for the table display: extract name(s)
      flavorDisplay: p.flavor ? (Array.isArray(p.flavor) ? p.flavor.map(it => getVal(it)).join(', ') : getVal(p.flavor)) : '',
      // ensure we store the clean ID array for components & updates
      flavor: getIds(p.flavor),
      ingredients: Array.isArray(p.ingredients) ? p.ingredients.map((i: any) => {
        // new shape: { ingredient: {_id, name}, qty }
        const ingObj = i?.ingredient || i;
        const id = ingObj?._id || ingObj?.id || String(ingObj || '');
        const name = (typeof ingObj === 'object' && (ingObj.name || ingObj.title)) || '';
        const qty = Number(i?.qty) || 0;
        return { id: String(id), name: String(name), qty };
      }).filter((i: any) => i.id) : [],
      tasteDescription: p.tasteDescription || p.description || '',
      // ensure shape/theme are arrays of IDs for components
      shape: getIds(p.shape),
      theme: getIds(p.theme),
      weight: getIds(p.weight),
      occasion: getIds(p.occasion),
      type: getIds(p.type),
      variants: normalizedVariants,
      mrp: p.mrp || (normalizedVariants.length > 0 ? normalizedVariants[0].mrp : 0) || Number(p.price) || 0,
      sellingPrice: p.sellingPrice || (normalizedVariants.length > 0 ? normalizedVariants[0].sellingPrice : 0) || Number(p.price) || 0,
      stock: (normalizedVariants.length > 0 ? normalizedVariants.reduce((s: number, v: any) => s + (Number(v.stock) || 0), 0) : (Number(p.stock) || 0)),
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
      const toObjects = (arr: any[]) => (arr || []).map((it: any) => ({
        id: it._id || it.id || String(it),
        name: it.name || it.title || it.label || it.type || String(it),
        categories: it.categories ? it.categories.map((c: any) => c._id || c) : (it.category ? [it.category._id || it.category] : [])
      })).filter(it => it.id && it.name);

      setCategoriesData(toObjects(cats));
      setCategoriesList((cats || []).map((it: any) => typeof it === 'string' ? it : (it.name || it.title || '')));
      setFlavorsList((flvs || []).map((it: any) => ({
        id: it._id || it.id || String(it),
        name: it.name || it.title || it.label || it.type || String(it),
        categories: it.categories ? it.categories.map((c: any) => c._id || c) : (it.category ? [it.category._id || it.category] : [])
      })).filter(it => it.id && it.name));
      setWeightsList(toObjects(wts));
      setTypesList(toObjects(typesRes));

      const normalizeGroups = (arr: any[]): GroupOption[] => (arr || []).map((it: any) => {
        if (!it) return null as any;
        const id = it._id || it.id || String(it);
        const name = it.name || it.title || it.label || it.type || '';
        const sub = Array.isArray(it.subthemes) ? it.subthemes : (Array.isArray(it.suboccasions) ? it.suboccasions : (Array.isArray(it.sub) ? it.sub : (it.subitems || [])));
        const cats = it.categories ? it.categories.map((c: any) => c._id || c) : (it.category ? [it.category._id || it.category] : []);
        return { id, name, sub: (sub || []).map((s: any) => String(s)).filter(Boolean), categories: cats } as GroupOption;
      }).filter(Boolean) as GroupOption[];

      setOccasionsList(normalizeGroups(occ));
      setShapesList(toObjects(shp));
      setThemesList(normalizeGroups(thm));

      const ings = (ingredientsRes || []).map((i: any) => ({
        id: i._id || i.id,
        name: i.name || ''
      })).filter((i: any) => i.name);
      setIngredientOptions(ings);
    }).catch(() => { }).finally(() => { mounted = false; });
    return () => { mounted = false; };
  }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setErrors({});
    setEditingId(null);
    setShowModal(true);
  };



  const openEdit = (p: Product) => {
    const id = p.id || p._id;
    const imgs = (p.images || []).map((it: any) => normalizeImage(it));
    const getId = (val: any) => val?._id || val?.id || (typeof val === 'string' ? val : '');
    const getIds = (val: any) => {
      if (!val) return [];
      const arr = Array.isArray(val) ? val : [val];
      return arr.map(it => getId(it)).filter(Boolean);
    };

    setForm({
      name: p.name || '',
      category: p.category || 'Cakes',
      price: Number(p.price) || 0,
      stock: Number(p.stock) || 0,
      image: p.imgBase64 || imgs.find(i => i.base64)?.base64 || p.image || p.img || imgs.find(i => i.url)?.url || '/placeholder.svg',
      images: imgs,
      flavor: getIds(p.flavor),
      ingredients: Array.isArray(p.ingredients) ? p.ingredients.map((i: any) => {
        // new shape: { ingredient: {_id, name}, qty }
        const ingObj = i?.ingredient || i;
        const id = ingObj?._id || ingObj?.id || String(ingObj || '');
        const name = (typeof ingObj === 'object' && (ingObj.name || ingObj.title)) || '';
        const qty = Number(i?.qty) || 0;
        return { id: String(id), name: String(name), qty };
      }).filter((i: any) => i.id) : [],
      tasteDescription: p.tasteDescription || p.description || '',
      imageFile: null,
      imagePreview: p.imgBase64 || imgs.find(i => i.base64)?.base64 || p.image || p.img || imgs.find(i => i.url)?.url || null,
      galleryPreviews: imgs.map(im => ({ url: im.url || '', base64: im.base64 })),
      type: getIds(p.type),
      occasion: getIds(p.occasion),
      shape: getIds(p.shape),
      theme: getIds(p.theme),
      variants: Array.isArray(p.variants)
        ? p.variants.map((v: any) => ({
          mrp: Number(v.mrp || v.price) || 0,
          sellingPrice: Number(v.sellingPrice) || 0,
          stock: Number(v.stock) || 0
        }))
        : [],
    });
    setErrors({});
    setEditingId(p.id);
    setOriginalProduct(p);
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
    setOriginalProduct(null);
    setStockReason('');
    setShowReasonModal(false);
  };

  const validateForm = () => {
    const next: Record<string, string> = {};
    if (!form.name || !form.name.trim()) next.name = 'Name is required';
    // Global price/stock validations removed as per user request to use variants only
    return next;
  };

  const buildDisplayFields = () => {
    const selectedFlavors = Array.isArray(form.flavor) ? form.flavor : (form.flavor ? [form.flavor] : []);
    const flvs = selectedFlavors.map(id => flavorsList.find(f => f.id === id)?.name).filter(Boolean).join(', ');
    return {
      flavor: flvs || (form.flavor && typeof form.flavor === 'string' ? form.flavor : ''),
      ingredients: (form.ingredients || []).map((i: any) => ({ ...i }))
    };
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

    // Check for stock decrease in VARIANTS if editing
    if (editingId && originalProduct && !stockReason) {
      let isVariantDecrease = false;
      const nextVariants = form.variants || [];
      const origVariants = (originalProduct as any).variants || [];

      for (const v of nextVariants) {
        const orig = origVariants.find((o: any) => o.weight === v.weight);
        if (orig && Number(v.stock) < Number(orig.stock)) {
          isVariantDecrease = true;
          break;
        }
      }

      if (isVariantDecrease) {
        setShowReasonModal(true);
        return;
      }
    }

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

    // prepare payload: derive weight from variants and build final payload
    const preparePayload = async () => {
      // Ensure variants have valid weights (fallback to first weightsList item or "500g")
      const cleanedVariants = (form.variants || []).map(v => ({
        weight: v.weight || weightsList[0]?.id || 'Custom',
        mrp: Number(v.mrp) || 0,
        sellingPrice: Number(v.sellingPrice) || 0,
        stock: Number(v.stock) || 0,
      }));

      const payload: any = {
        name: form.name,
        category: form.category,
        price: cleanedVariants.length > 0 ? Number(cleanedVariants[0].sellingPrice) || 0 : 0,
        // Total stock = sum of all variant stocks
        stock: cleanedVariants.reduce((s, v) => s + (Number(v.stock) || 0), 0) || Number(form.stock) || 0,
        flavor: Array.isArray(form.flavor) ? form.flavor.filter(Boolean) : (form.flavor ? [form.flavor] : []),
        type: Array.isArray(form.type) ? form.type.filter(Boolean) : [],
        weight: cleanedVariants.map(v => v.weight).filter(Boolean),
        pricesByWeight: cleanedVariants.map(v => v.mrp),
        occasion: Array.isArray(form.occasion) ? form.occasion.filter(Boolean) : [],
        shape: Array.isArray(form.shape) ? form.shape.filter(Boolean) : [],
        theme: Array.isArray(form.theme) ? form.theme.filter(Boolean) : [],
        variants: cleanedVariants.map(v => ({
          weight: v.weight,
          mrp: v.mrp,
          sellingPrice: v.sellingPrice,
          stock: v.stock
        })),
        // send [{ingredient: ObjectId, qty: Number}] — backend schema shape
        ingredients: (form.ingredients || []).map((it: any) => ({
          ingredient: typeof it === 'string' ? it : (it.id || it._id || String(it)),
          qty: Number(it?.qty) || 0,
        })).filter((it: any) => it.ingredient),
        tasteDescription: form.tasteDescription || '',
        lastStockAdjustmentReason: stockReason || undefined,
      };

      // primary image
      if (form.image && typeof form.image === 'string' && (form.image.startsWith('http') || form.image.startsWith('data:'))) {
        payload.img = form.image;
      } else if (form.imageFile) {
        try { payload.img = await fileToDataUrl(form.imageFile); } catch (e) { payload.img = ''; }
      }

      // gallery images
      payload.images = await Promise.all((form.galleryPreviews || []).map(async (gp) => {
        if (gp.base64 && typeof gp.base64 === 'string' && gp.base64.startsWith('data:')) return { base64: gp.base64 };
        if (gp.file instanceof File) {
          try { const d = await fileToDataUrl(gp.file); return { base64: d }; }
          catch (e) { return { url: gp.url || '' }; }
        }
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
              const saved = normalizeSingle(res || (res as any)?.data || {});
              const next = products.map((it: any) => (it.id === editingId ? saved : it));
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
              const saved = normalizeSingle(res || (res as any)?.data || {});
              const displayFields = buildDisplayFields();
              const created = { ...saved, ...displayFields };
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

  // --- Compute filtered products and pagination outside of JSX to avoid runtime reference errors ---
  const q = (searchQuery || '').trim().toLowerCase();
  const filteredProducts = products.filter((p: Product) => {
    // 1. Category Filter
    if (selectedCategory !== "All" && p.category !== selectedCategory) return false;

    // 2. Search Filter
    if (!q) return true;
    const id = String(p.id || '').toLowerCase();
    const name = String(p.name || '').toLowerCase();
    const category = String(p.category || '').toLowerCase();
    const flavor = String(p.flavor || '').toLowerCase();
    const items = Array.isArray(p.ingredients) ? p.ingredients.join(' ').toLowerCase() : String(p.ingredients || '').toLowerCase();
    const orderNumber = String(p.orderNumber || '').toLowerCase();
    const price = String(p.price || '').toLowerCase();
    return id.includes(q) || name.includes(q) || category.includes(q) || flavor.includes(q) || items.includes(q) || orderNumber.includes(q) || price.includes(q);
  });

  const total = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, currentPage), totalPages);
  const start = (current - 1) * pageSize;
  const pageItems = filteredProducts.slice(start, start + pageSize);

  // Keep currentPage within valid bounds when filteredProducts.length or pageSize change
  useEffect(() => {
    const tp = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
    const newCurrent = Math.min(Math.max(1, currentPage), tp);
    if (newCurrent !== currentPage) setCurrentPage(newCurrent);
  }, [filteredProducts.length, pageSize, currentPage]);

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

  const activeCategoryId = categoriesData.find(c => c.name === form.category)?.id;
  const filteredWeights = weightsList.filter(w => !activeCategoryId || (w.categories && w.categories.includes(activeCategoryId)));
  const filteredTypes = typesList.filter(t => !activeCategoryId || (t.categories && t.categories.includes(activeCategoryId)));
  const filteredOccasions = occasionsList.filter(o => !activeCategoryId || (o.categories && o.categories.includes(activeCategoryId)));
  const filteredShapes = shapesList.filter(s => !activeCategoryId || (s.categories && s.categories.includes(activeCategoryId)));
  const filteredThemes = themesList.filter(t => !activeCategoryId || (t.categories && t.categories.includes(activeCategoryId)));

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
            placeholder="Search by name, category, flavor, or id..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-transparent focus:border-strawberry/20 focus:bg-white text-sm text-chocolate placeholder:text-chocolate/30 outline-none transition-all"
          />
        </div>
        <button className="p-3 bg-white rounded-2xl text-chocolate hover:bg-strawberry hover:text-white transition-all shadow-sm border border-chocolate/5">
          <Filter size={18} />
        </button>
      </div>

      {/* ── Filter Section (Category Buttons) ────────────────────── */}
      <div className="bg-white/40 backdrop-blur-sm p-6 rounded-[2rem] border border-chocolate/5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-4 bg-strawberry rounded-full" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-chocolate/40">Select Category</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {['All', ...categoriesList].map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 border ${isActive
                  ? 'bg-chocolate text-white border-chocolate shadow-bakery shadow-chocolate/20 scale-105'
                  : 'bg-white text-chocolate/60 border-chocolate/10 hover:border-strawberry/30 hover:text-strawberry hover:bg-white'
                  }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Product Cards Grid ────────────────────────────────────── */}
      {products.length === 0 ? (
        <div className="bg-white/50 backdrop-blur-sm rounded-[2.5rem] border border-chocolate/5 shadow-bakery p-32 flex flex-col items-center gap-8 text-center animate-in zoom-in duration-700">
          <div className="w-24 h-24 rounded-full bg-cream/50 flex items-center justify-center border border-white/40 shadow-inner group overflow-hidden">
            <Package size={40} className="text-chocolate/20 group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-bold font-dancing text-chocolate">The pantry is empty</h3>
            <p className="text-sm text-chocolate-light font-medium italic">Shall we begin by adding an exquisite new item?</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-chocolate/5 shadow-bakery overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-chocolate/[0.02] text-chocolate/40 font-bold uppercase tracking-widest text-[10px] border-b border-chocolate/5">
                <tr>
                  <th className="p-4 pl-6">Image</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Flavor</th>
                  <th className="p-4">MRP</th>
                  <th className="p-4">Selling Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-chocolate/5 text-sm">
                {pageItems.map((product: Product) => (
                  <tr key={product.id} className="group hover:bg-strawberry/[0.02] transition-colors">
                    <td className="p-4 pl-6 w-24">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-cream/20">
                        <img src={getImageSrc(product.image, product.images?.[0]?.base64)} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="p-4 font-bold text-chocolate whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] md:max-w-[200px]">{product.name}</td>
                    <td className="p-4 text-chocolate/70">{product.category}</td>
                    <td className="p-4 text-chocolate/70">{product.flavorDisplay || (product.ingredients?.length ? 'Crafted' : 'Classic')}</td>
                    <td className="p-4 text-chocolate/40 line-through decoration-strawberry/30 text-xs">CA${(Number(product.mrp) || 0).toLocaleString()}</td>
                    <td className="p-4 text-strawberry font-bold">CA${(Number(product.sellingPrice) || 0).toLocaleString()}</td>
                    <td className="p-4 font-bold text-chocolate">{Number(product.stock) || 0}</td>
                    <td className="p-4 pr-6 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button onClick={() => openEdit(product)} className="px-3 py-2 bg-chocolate text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-strawberry transition-all flex items-center gap-2">
                          <Edit size={14} /> Edit
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="px-3 py-2 bg-white text-red-400 rounded-full border border-red-50 shadow-sm hover:bg-red-500 hover:text-white transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between p-4 border-t border-chocolate/5 bg-white">
            <div className="text-sm text-chocolate/70">Showing {(total === 0 ? 0 : (Math.min(total, (currentPage - 1) * pageSize + 1)))} - {Math.min(total, currentPage * pageSize)} of {total}</div>
            <div className="flex items-center gap-2">
              <button disabled={currentPage <= 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="px-3 py-2 rounded-xl bg-white border border-chocolate/10 hover:bg-chocolate/5 disabled:opacity-50">Prev</button>
              {/* pages */}
              {Array.from({ length: Math.max(1, Math.ceil(total / pageSize)) }).map((_, i) => {
                const p = i + 1;
                return (
                  <button key={p} onClick={() => setCurrentPage(p)} className={`px-3 py-2 rounded-xl ${currentPage === p ? 'bg-strawberry text-white' : 'bg-white border border-chocolate/10 hover:bg-chocolate/5'}`}>{p}</button>
                );
              })}
              <button disabled={currentPage >= Math.ceil(total / pageSize)} onClick={() => setCurrentPage(p => Math.min(Math.ceil(total / pageSize), p + 1))} className="px-3 py-2 rounded-xl bg-white border border-chocolate/10 hover:bg-chocolate/5 disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={showModal} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-[95vw] md:max-w-[70vw] lg:max-w-5xl h-[90vh] flex flex-col p-0 bg-[#FAFBFD] border-none overflow-hidden rounded-[2.5rem]">
          <form id="product-form" onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
            <DialogHeader className="p-8 bg-white border-b border-chocolate/5 relative shrink-0">
              <div className="absolute top-0 right-0 w-32 h-32 bg-strawberry/5 rounded-full -mr-16 -mt-16 blur-3xl" />
              <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 bg-chocolate text-white rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform shrink-0">
                  <Package size={28} />
                </div>
                <div>
                  <DialogTitle className="text-3xl font-bold text-chocolate font-dancing">
                    {editingId ? 'Edit Product' : 'Add New Product'}
                  </DialogTitle>
                  <DialogDescription className="text-chocolate-light font-medium flex items-center gap-1.5 mt-0.5">
                    {editingId ? (
                      <>Updating details for <span className="text-strawberry font-bold">{form.name}</span></>
                    ) : 'Create a new item for your bakery menu.'}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-8 no-scrollbar">

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Left Column: Form Details (8/12) */}
                <div className="lg:col-span-12 space-y-10">

                  {/* 1. Essence Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-3 border-b border-chocolate/10">
                      <div className="p-2 bg-cream rounded-xl">
                        <Info size={18} className="text-chocolate" />
                      </div>
                      <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-chocolate/80">Essence of Creation</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold text-chocolate uppercase tracking-wider px-1">
                          Product Name <span className="text-strawberry">*</span>
                        </label>
                        <input
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="e.g. Chocolate Truffle Cake"
                          className={`w-full p-4 rounded-2xl bg-white border ${errors.name ? 'border-red-500 focus:ring-red-100' : 'border-chocolate/30 focus:border-strawberry/30'} outline-none shadow-sm transition-all focus:ring-4 focus:ring-strawberry/5 text-chocolate font-bold text-sm placeholder:text-chocolate/40`}
                        />
                        {errors.name && <p className="text-xs font-bold text-red-500 mt-1 uppercase tracking-wider">{errors.name}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-chocolate uppercase tracking-wider px-1">Category</label>
                        <Select
                          value={form.category}
                          onValueChange={(val) => {
                            const nextForm: ProductForm = { ...form, category: val };
                            const selectedCat = categoriesData.find(c => c.name === val);
                            const catId = selectedCat?.id;

                            if (catId) {
                              // Filter Flavor if not compatible
                              if (Array.isArray(form.flavor)) {
                                nextForm.flavor = form.flavor.filter(id => {
                                  const f = flavorsList.find(flv => flv.id === id);
                                  return !f || !f.categories || f.categories.length === 0 || f.categories.includes(catId);
                                });
                              }

                              // Filter multi-select fields (type, occasion, shape, theme)
                              const filterIncompatible = (selectedIds: string[], list: any[]) => {
                                return selectedIds.filter(id => {
                                  const item = list.find(it => it.id === id);
                                  // If item has categories and doesn't match current, remove it
                                  if (item && item.categories && item.categories.length > 0) {
                                    return item.categories.includes(catId);
                                  }
                                  return true; // Keep if no categories defined (fallback)
                                });
                              };

                              nextForm.type = filterIncompatible(form.type || [], typesList);
                              nextForm.occasion = filterIncompatible(form.occasion || [], occasionsList);
                              nextForm.shape = filterIncompatible(form.shape || [], shapesList);
                              nextForm.theme = filterIncompatible(form.theme || [], themesList);

                              // Filter variants weight - keep only compatible ones
                              if (Array.isArray(form.variants)) {
                                nextForm.variants = form.variants.filter(v => {
                                  const w = weightsList.find(wt => wt.id === v.weight);
                                  if (w && w.categories && w.categories.length > 0) {
                                    return w.categories.includes(catId);
                                  }
                                  return true;
                                });
                              }
                            }

                            setForm(nextForm);
                          }}
                        >
                          <SelectTrigger className="w-full p-6 h-auto rounded-2xl bg-white border border-chocolate/30 outline-none shadow-sm transition-all focus:ring-4 focus:ring-strawberry/5 focus:border-strawberry/30 text-chocolate font-bold group">
                            <div className="flex items-center gap-2">
                              <Layers size={14} className="text-chocolate/60 group-hover:text-strawberry transition-colors" />
                              <SelectValue placeholder="Select Collection" />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-chocolate/30 shadow-bakery-xl font-lora">
                            {categoriesList && categoriesList.length > 0 ? (
                              categoriesList.map((c) => (
                                <SelectItem key={c} value={c} className="focus:bg-strawberry/5 focus:text-strawberry py-3">{c}</SelectItem>
                              ))
                            ) : (
                              <>
                                <SelectItem value="Cakes" className="focus:bg-strawberry/5 focus:text-strawberry py-3">Cakes</SelectItem>
                                <SelectItem value="Breads" className="focus:bg-strawberry/5 focus:text-strawberry py-3">Breads</SelectItem>
                                <SelectItem value="Pastries" className="focus:bg-strawberry/5 focus:text-strawberry py-3">Pastries</SelectItem>
                                <SelectItem value="Cookies" className="focus:bg-strawberry/5 focus:text-strawberry py-3">Cookies</SelectItem>
                                <SelectItem value="Custom" className="focus:bg-strawberry/5 focus:text-strawberry py-3">Custom</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                          <label className="text-sm font-bold text-chocolate uppercase tracking-wider">Price Variants</label>
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...(form.variants || [])];
                              next.push({ weight: '', mrp: 0, sellingPrice: 0, stock: 0 });
                              setForm({ ...form, variants: next });
                            }}
                            className="px-3 py-1.5 bg-chocolate text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-strawberry transition-all flex items-center gap-2"
                          >
                            <Plus size={12} /> Add Variant
                          </button>
                        </div>

                        <div className="space-y-3">
                          {(form.variants && form.variants.length > 0) ? (
                            form.variants.map((v, i) => (
                              <div key={i} className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-chocolate/5 shadow-sm group animate-in slide-in-from-left duration-300">
                                <div className="flex-1 space-y-1">
                                  <label className="text-xs font-bold text-chocolate uppercase tracking-wide px-1">Weight</label>
                                  <div className="relative">
                                    <Select
                                      value={v.weight || ''}
                                      onValueChange={(val) => {
                                        const next = [...(form.variants || [])];
                                        next[i] = { ...next[i], weight: val };
                                        setForm({ ...form, variants: next });
                                      }}
                                    >
                                      <SelectTrigger className="w-full px-3 h-11 rounded-xl bg-white border border-chocolate/30 outline-none text-chocolate font-bold text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50">
                                        <div className="flex items-center gap-2">
                                          <SelectValue placeholder="Select Weight" />
                                        </div>
                                      </SelectTrigger>
                                      <SelectContent className="rounded-2xl border-chocolate/30 shadow-bakery-xl font-lora">
                                        {filteredWeights.map((w: any) => (
                                          <SelectItem key={w.id} value={w.id} className="focus:bg-strawberry/5 focus:text-strawberry py-2 text-sm">
                                            {w.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div className="flex-1 space-y-1">
                                  <label className="text-xs font-bold text-chocolate uppercase tracking-wide px-1">MRP (CA$)</label>
                                  <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-chocolate/50 font-bold text-xs">CA$</div>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={v.mrp}
                                      onChange={(e) => {
                                        const next = [...(form.variants || [])];
                                        next[i] = { ...next[i], mrp: e.target.value === '' ? 0 : Number(e.target.value) };
                                        setForm({ ...form, variants: next });
                                      }}
                                      className="w-full pl-10 pr-3 h-11 rounded-xl bg-white border border-chocolate/30 outline-none text-chocolate font-bold text-sm"
                                    />
                                  </div>
                                </div>

                                <div className="flex-1 space-y-1">
                                  <label className="text-xs font-bold text-chocolate uppercase tracking-wide px-1">Selling Price</label>
                                  <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-chocolate/50 font-bold text-xs">CA$</div>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={v.sellingPrice}
                                      onChange={(e) => {
                                        const next = [...(form.variants || [])];
                                        next[i] = { ...next[i], sellingPrice: e.target.value === '' ? 0 : Number(e.target.value) };
                                        setForm({ ...form, variants: next });
                                      }}
                                      className="w-full pl-10 pr-3 h-11 rounded-xl bg-white border border-chocolate/30 outline-none text-chocolate font-bold text-sm"
                                    />
                                  </div>
                                </div>

                                <div className="flex-1 space-y-1">
                                  <label className="text-xs font-bold text-chocolate uppercase tracking-wide px-1">Stock (qty)</label>
                                  <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-chocolate/30 h-11 w-full">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const next = [...(form.variants || [])];
                                        const cur = Number((next[i] as any).stock) || 0;
                                        const newVal = Math.max(0, cur - 1);
                                        (next[i] as any).stock = newVal;
                                        setForm({ ...form, variants: next });

                                        // Trigger reason modal immediately if we are in Edit Mode and stock is decreasing below original
                                        if (editingId && originalProduct) {
                                          const origVariant = (originalProduct.variants || []).find(o => o.weight === v.weight);
                                          const origStock = origVariant ? Number(origVariant.stock) : Number(originalProduct.stock);
                                          if (newVal < origStock && !stockReason) {
                                            setShowReasonModal(true);
                                          }
                                        }
                                      }}
                                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-cream/20 text-chocolate hover:bg-strawberry hover:text-white transition-all shadow-sm"
                                    >
                                      <Minus size={14} />
                                    </button>
                                    <input
                                      type="number"
                                      min="0"
                                      value={(v as any).stock ?? 0}
                                      onChange={(e) => {
                                        const next = [...(form.variants || [])];
                                        const val = e.target.value === '' ? 0 : Number(e.target.value);
                                        (next[i] as any).stock = val;
                                        setForm({ ...form, variants: next });
                                      }}
                                      className="flex-1 text-center bg-transparent border-none outline-none text-chocolate font-bold text-sm w-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const next = [...(form.variants || [])];
                                        const cur = Number((next[i] as any).stock) || 0;
                                        (next[i] as any).stock = cur + 1;
                                        setForm({ ...form, variants: next });
                                      }}
                                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-cream/20 text-chocolate hover:bg-strawberry hover:text-white transition-all shadow-sm"
                                    >
                                      <Plus size={14} />
                                    </button>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = (form.variants || []).filter((_, idx) => idx !== i);
                                    setForm({ ...form, variants: next });
                                  }}
                                  className="mt-5 p-2 text-chocolate/20 hover:text-strawberry transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))
                          ) : (
                            <div
                              onClick={() => {
                                const next = [...(form.variants || [])];
                                const defaultWeight = weightsList[0]?.id || "";
                                next.push({ weight: defaultWeight, mrp: 0, sellingPrice: 0, stock: 0 });
                                setForm({ ...form, variants: next });
                              }}
                              className="p-8 border-2 border-dashed border-chocolate/5 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-strawberry/20 hover:bg-strawberry/[0.01] transition-all group"
                            >
                              <div className="w-10 h-10 rounded-full bg-cream/50 flex items-center justify-center text-chocolate/30 group-hover:scale-110 transition-transform">
                                <Plus size={20} />
                              </div>
                              <span className="text-[10px] font-bold text-chocolate/30 mt-3 uppercase tracking-widest">No variants added</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>






                  {/* 2. Visual Identity Grid Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 pb-3 border-b border-chocolate/10">
                        <div className="p-2 bg-cream rounded-xl">
                          <ImageIcon size={18} className="text-chocolate" />
                        </div>
                        <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-chocolate/80">Cover Image</h4>
                      </div>

                      <div className="relative group w-full aspect-[16/10] rounded-3xl border-2 border-dashed border-chocolate/10 bg-cream/30 overflow-hidden flex items-center justify-center transition-all hover:border-strawberry/20 hover:bg-cream/50 shadow-inner">
                        {form.imagePreview || form.image ? (
                          <div className="relative w-full h-full">
                            <img src={getImageSrc(form.image, form.imagePreview || undefined)} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-chocolate/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="bg-white/90 backdrop-blur-md px-6 py-2.5 rounded-full shadow-lg text-chocolate font-bold text-xs uppercase tracking-widest transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                Update Image
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-3 text-chocolate/20">
                            <div className="p-5 bg-white rounded-full shadow-bakery">
                              <ImageIcon size={40} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest">Upload Image</span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const f = e.target.files?.[0] || null;
                            if (f) {
                              if (f.size > MAX_BYTES) { toast.error('Work of art must be 500KB or smaller'); return; }
                              const url = URL.createObjectURL(f);
                              setForm({ ...form, imageFile: f, imagePreview: url, image: '' });
                            }
                          }}
                        />
                      </div>
                      <input
                        value={form.image}
                        onChange={(e) => setForm({ ...form, image: e.target.value })}
                        className="w-full p-4 text-xs rounded-xl bg-white border border-chocolate/30 focus:border-strawberry/30 outline-none text-chocolate italic font-bold shadow-sm"
                        placeholder="Or paste an image URL..."
                      />
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-3 pb-3 border-b border-chocolate/10">
                        <div className="p-2 bg-cream rounded-xl">
                          <Layers size={18} className="text-chocolate" />
                        </div>
                        <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-chocolate/80">Product Gallery</h4>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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
                        <label className="aspect-square rounded-2xl border-2 border-dashed border-chocolate/30 bg-white flex flex-col items-center justify-center cursor-pointer hover:bg-cream/30 hover:border-strawberry/30 transition-all group">
                          <div className="p-2 bg-white rounded-full shadow-sm text-chocolate group-hover:text-strawberry group-hover:scale-110 transition-all duration-300 border border-chocolate/10">
                            <Plus size={20} />
                          </div>
                          <span className="text-xs font-bold text-chocolate mt-2 uppercase tracking-widest">Add Image</span>
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
                  </div>

                  {/* 3. Gastronomy & Specifications Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 pb-3 border-b border-chocolate/10">
                        <div className="p-2 bg-cream rounded-xl">
                          <Filter size={18} className="text-chocolate" />
                        </div>
                        <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-chocolate/80">Ingredients & Taste</h4>
                      </div>

                      <div className="space-y-4">
                        {/* Ingredient list and Taste description */}
                        <div className="flex items-center justify-between px-1">
                          <label className="text-xs font-bold text-chocolate uppercase tracking-wider">Secret Ingredients</label>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedIngredient(ingredientOptions[0]?.id || '');
                              setIngredientQty(100);
                              setShowIngredientModal(true);
                            }}
                            className="flex items-center gap-1.5 text-xs font-bold text-strawberry uppercase tracking-wider hover:text-chocolate transition-colors"
                          >
                            <Plus size={12} /> Add New
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 min-h-[80px] p-4 bg-white rounded-2xl border border-chocolate/5 shadow-inner content-start">
                          {(form.ingredients || []).length > 0 ? (form.ingredients || []).map((ing: any, idx) => {
                            const display = typeof ing === 'string' ? ing : `${ing.name}${ing.qty ? ` (${ing.qty}g)` : ''}`;
                            return (
                              <span key={idx} className="flex items-center gap-2 bg-chocolate text-white px-3 py-1.5 rounded-full shadow-sm animate-in zoom-in duration-300">
                                <span className="text-[10px] font-bold tracking-wide">{display}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = [...(form.ingredients || [])];
                                    next.splice(idx, 1);
                                    setForm({ ...form, ingredients: next });
                                  }}
                                  className="p-1 rounded-full bg-white/20 hover:bg-white/40 transition-colors"
                                >
                                  <X size={8} />
                                </button>
                              </span>
                            );
                          }) : <p className="text-xs text-chocolate/20 italic font-medium">No ingredients added yet...</p>}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between px-1">
                            <label className="text-xs font-bold text-chocolate uppercase tracking-wider">Taste Description</label>
                          </div>
                          <textarea
                            value={form.tasteDescription}
                            onChange={(e) => setForm({ ...form, tasteDescription: e.target.value.slice(0, 300) })}
                            rows={4}
                            placeholder="Describe the sensory experience..."
                            className="w-full p-4 rounded-2xl bg-white border border-chocolate/30 outline-none shadow-sm transition-all focus:border-strawberry/30 resize-none text-chocolate font-bold placeholder:text-chocolate/40 text-sm leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-3 pb-3 border-b border-chocolate/10">
                        <div className="p-2 bg-cream rounded-xl">
                          <Layers size={18} className="text-chocolate" />
                        </div>
                        <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-chocolate/80">Specifications</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[450px] pr-2 no-scrollbar p-1">
                        <MultiSelectDropdown
                          label="Flavor Palette"
                          options={flavorsList.filter(f => !activeCategoryId || (f.categories && f.categories.includes(activeCategoryId)))}
                          selected={Array.isArray(form.flavor) ? form.flavor : []}
                          onChange={(next) => setForm({ ...form, flavor: next })}
                          placeholder="Select flavors..."
                        />
                        <MultiSelectDropdown
                          label="Artistry Types"
                          options={filteredTypes}
                          selected={form.type || []}
                          onChange={(next) => setForm({ ...form, type: next })}
                          placeholder="Select artistry types..."
                        />
                        <MultiSelectDropdown
                          label="Shapes"
                          options={filteredShapes}
                          selected={form.shape || []}
                          onChange={(next) => setForm({ ...form, shape: next })}
                          placeholder="Select shapes..."
                        />
                        <GroupedMultiSelectDropdown
                          label="Tailored Occasions"
                          options={filteredOccasions}
                          selected={form.occasion || []}
                          onChange={(next) => setForm({ ...form, occasion: next })}
                          placeholder="Select occasions..."
                        />
                        <GroupedMultiSelectDropdown
                          label="Themes"
                          options={filteredThemes}
                          selected={form.theme || []}
                          onChange={(next) => setForm({ ...form, theme: next })}
                          placeholder="Select themes..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>



            {/* Ingredient Modal Overlay */}
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
                      <Select
                        value={selectedIngredient}
                        onValueChange={(val) => setSelectedIngredient(val)}
                      >
                        <SelectTrigger className="w-full p-4 h-auto rounded-2xl bg-white border border-chocolate/10 outline-none shadow-sm transition-all focus:ring-4 focus:ring-strawberry/5 focus:border-strawberry/30 text-chocolate font-medium group">
                          <SelectValue placeholder="Select an ingredient" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-chocolate/10 shadow-bakery-xl font-lora">
                          {ingredientOptions.map((opt) => (
                            <SelectItem key={opt.id} value={opt.id} className="focus:bg-strawberry/5 focus:text-strawberry py-3">{opt.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                        if (!selectedIngredient) { toast.error('Select an ingredient'); return; }
                        if (!ingredientQty || ingredientQty <= 0) { toast.error('Enter valid portion'); return; }
                        const picked = ingredientOptions.find(i => i.id === selectedIngredient);
                        if (!picked) return;
                        const entry = { id: picked.id, name: picked.name, qty: ingredientQty };
                        setForm(prev => ({ ...prev, ingredients: [...(prev.ingredients || []), entry] }));
                        setShowIngredientModal(false);
                      }}
                      className="flex-1 py-4 px-6 bg-chocolate text-white rounded-full text-xs font-bold shadow-lg hover:bg-strawberry hover:shadow-strawberry/20 transition-all uppercase tracking-widest"
                    >
                      Add Ingredient
                    </button>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="p-8 bg-white border-t border-chocolate/10 flex flex-row items-center justify-between gap-6 shrink-0">
              <button
                type="button"
                onClick={closeModal}
                className="px-8 py-4 rounded-full text-xs font-bold text-chocolate/60 uppercase tracking-[0.2em] hover:bg-chocolate/5 transition-all font-lora"
              >
                Discard Changes
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-12 py-4 rounded-full text-xs font-bold text-white uppercase tracking-[0.2em] flex items-center gap-3 shadow-bakery-lg hover:shadow-bakery-xl hover:scale-[1.02] transition-all duration-300 ${loading ? 'bg-chocolate/40 cursor-not-allowed' : 'bg-chocolate hover:bg-strawberry'}`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Preserving...
                  </>
                ) : (
                  editingId ? 'Update Product' : 'Add Product'
                )}
              </button>
            </DialogFooter>
          </form>

          {/* Stock Adjustment Reason Modal */}
          {showReasonModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-chocolate/90 backdrop-blur-md" />
              <div className="relative bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl z-10 border border-white/20 animate-in zoom-in-95 duration-300 font-lora">
                <div className="text-center space-y-3 mb-8">
                  <div className="w-20 h-20 bg-strawberry/10 text-strawberry rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
                    <Package size={40} />
                  </div>
                  <h4 className="text-4xl font-bold text-chocolate font-dancing tracking-wide">Audit Detail Required</h4>
                  <p className="text-[10px] text-chocolate/40 font-black uppercase tracking-[0.3em] leading-relaxed">
                    Manual Inventory Deduction
                  </p>
                  <div className="h-px w-10 bg-strawberry/20 mx-auto mt-4" />
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-chocolate/60 uppercase tracking-widest px-1">Quick Selection</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setStockReason("Manually Delivered");
                          setShowReasonModal(false);
                          toast.success("Reason set: Manually Delivered");
                        }}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-strawberry/10 text-strawberry border border-strawberry/20 hover:bg-strawberry hover:text-white transition-all text-[11px] font-black uppercase tracking-wider group scale-95 hover:scale-100"
                      >
                        <Package size={14} className="group-hover:rotate-12 transition-transform" />
                        Manually Delivered
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-chocolate/60 uppercase tracking-widest px-1">Or Type Manually</label>
                    <textarea
                      value={stockReason}
                      onChange={(e) => setStockReason(e.target.value)}
                      placeholder="e.g. Quality check, expired batch..."
                      className="w-full p-6 rounded-[24px] bg-cream/20 border border-chocolate/5 outline-none text-chocolate font-medium placeholder:text-chocolate/20 text-sm h-36 resize-none focus:border-strawberry/30 transition-all shadow-inner"
                      autoFocus
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      disabled={!stockReason.trim()}
                      onClick={() => {
                        setShowReasonModal(false);
                        toast.success("Reason captured. You can now finalize your edits.");
                      }}
                      className={`w-full py-5 rounded-full text-xs font-black shadow-lg transition-all uppercase tracking-[0.2em] ${stockReason.trim()
                        ? 'bg-chocolate text-white hover:bg-strawberry shadow-chocolate/20 scale-[1.02]'
                        : 'bg-chocolate/10 text-chocolate/30 cursor-not-allowed'
                        }`}
                    >
                      Confirm Reason
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowReasonModal(false);
                        setStockReason("");
                        toast.info("Stock adjustment cancelled.");
                      }}
                      className="w-full py-4 rounded-full text-[10px] font-bold text-chocolate/40 hover:bg-cream/50 transition-all uppercase tracking-widest"
                    >
                      Clear & Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
