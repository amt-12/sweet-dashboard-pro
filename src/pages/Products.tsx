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

  if (loading) return <div className="p-8 text-center text-secondary-foreground font-lora">Loading bakery items... 🥐</div>;
  if (error) return <div className="p-8 text-center text-destructive font-lora">Error: {error}</div>;

  return (
    <div className="space-y-6 animate-fade-in font-lora">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-dancing text-foreground">Product Management 🧁</h2>
          <p className="text-muted-foreground">Manage your bakery items, prices, and stock.</p>
        </div>
        <button className="bakery-btn bg-chocolate text-cream flex items-center gap-2 shadow-lg hover:shadow-xl hover:bg-chocolate-light transition-all">
          <Plus size={18} /> Add New Product
        </button>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-bakery shadow-sm border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search products by name or category..." 
            className="w-full pl-9 pr-4 py-2 rounded-full bg-secondary text-sm outline-none focus:ring-2 focus:ring-chocolate/20 transition-all"
          />
        </div>
        <button className="p-2 bg-secondary rounded-full text-foreground hover:bg-secondary/80 transition-colors">
          <Filter size={18} />
        </button>
      </div>

      <div className="bakery-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary/50 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="p-4 pl-6">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="p-4 pl-6 flex items-center gap-3">
                    <span className="text-2xl">{product.image || "🍰"}</span>
                    <span className="font-semibold text-foreground">{product.name}</span>
                  </td>
                  <td className="p-4 text-muted-foreground">{product.category}</td>
                  <td className="p-4 font-medium text-foreground">${product.price.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${product.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {product.stock} in stock
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2 hover:bg-primary/10 rounded-full text-primary transition-colors">
                        <Edit size={16} />
                      </button>
                      <button className="p-2 hover:bg-destructive/10 rounded-full text-destructive transition-colors">
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
