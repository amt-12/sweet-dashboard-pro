import { Plus, Search, Edit, Trash2, Filter } from "lucide-react";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setProducts, setLoading, setError } from "../store/slices/productSlice";
import { api } from "../services/api";

const Products = () => {
  const dispatch = useAppDispatch();
  const { items: products, loading, error } = useAppSelector((state) => state.products);

  useEffect(() => {
    const fetchProducts = async () => {
      dispatch(setLoading(true));
      try {
        const data = await api.products.getAll();
        dispatch(setProducts(data));
      } catch (err) {
        dispatch(setError("Failed to fetch products"));
      } finally {
        dispatch(setLoading(false));
      }
    };
    
    fetchProducts();
  }, [dispatch]);

  if (loading) return <div className="p-8 text-center text-[#1A2744] font-playfair animate-pulse">Loading bakery items... 🥐</div>;
  if (error) return <div className="p-8 text-center text-red-500 font-inter">Error: {error}</div>;

  return (
    <div className="space-y-6 animate-fade-in font-inter">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-playfair text-[#1A2744]">Product Management</h2>
          <p className="text-sm text-[#8D6E63] font-medium mt-1">Manage your bakery items, prices, and stock.</p>
        </div>
        <button className="px-5 py-2.5 bg-[#1A2744] text-[#F5ECD7] rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl hover:bg-[#D4A373] hover:text-[#1A2744] transition-all duration-300 group">
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
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-[#FAF6E6]/50 transition-colors group">
                  <td className="p-4 pl-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#FAF6E6] flex items-center justify-center text-xl border border-[#D4A373]/10">
                        {product.image || "🍰"}
                    </div>
                    <span className="font-bold text-[#1A2744] font-playfair">{product.name}</span>
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
                       <button className="p-2 hover:bg-[#1A2744] hover:text-[#F5ECD7] rounded-lg text-[#1A2744] transition-colors">
                        <Edit size={16} />
                      </button>
                      <button className="p-2 hover:bg-red-500 hover:text-white rounded-lg text-red-400 transition-colors">
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
    </div>
  );
};

export default Products;
