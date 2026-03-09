const products = [
  { name: "Chocolate Croissant", sold: 84, emoji: "🥐", progress: 84 },
  { name: "Strawberry Cupcake", sold: 72, emoji: "🧁", progress: 72 },
  { name: "Vanilla Macaron", sold: 65, emoji: "🍬", progress: 65 },
  { name: "Blueberry Muffin", sold: 58, emoji: "🫐", progress: 58 },
  { name: "Red Velvet Cake", sold: 45, emoji: "🎂", progress: 45 },
];

const PopularProducts = () => {
  return (
    <div className="bakery-card animate-fade-in" style={{ animationDelay: "400ms" }}>
      <h3 className="font-fredoka text-lg font-bold text-foreground mb-1">Popular Products 🌟</h3>
      <p className="text-sm text-muted-foreground mb-4">Top sellers this week</p>
      <div className="space-y-4">
        {products.map((product) => (
          <div key={product.name} className="flex items-center gap-3">
            <span className="text-2xl">{product.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold text-foreground truncate">{product.name}</span>
                <span className="text-xs text-muted-foreground ml-2">{product.sold} sold</span>
              </div>
              <div className="chocolate-progress h-2.5">
                <div
                  className="chocolate-progress-fill"
                  style={{ width: `${product.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularProducts;
