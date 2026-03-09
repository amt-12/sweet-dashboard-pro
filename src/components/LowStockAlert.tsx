import { AlertTriangle } from "lucide-react";

const lowStockItems = [
  { name: "Vanilla Extract", stock: 2, unit: "bottles", emoji: "🍶" },
  { name: "Butter", stock: 3, unit: "kg", emoji: "🧈" },
  { name: "Dark Chocolate", stock: 5, unit: "bars", emoji: "🍫" },
  { name: "Strawberries", stock: 1, unit: "kg", emoji: "🍓" },
];

const LowStockAlert = () => {
  return (
    <div className="bakery-card border-destructive/30 animate-fade-in" style={{ animationDelay: "600ms" }}>
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={18} className="text-accent" />
        <h3 className="font-fredoka text-lg font-bold text-foreground">Low Stock Alert ⚠️</h3>
      </div>
      <div className="space-y-3">
        {lowStockItems.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between p-3 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{item.emoji}</span>
              <span className="text-sm font-medium text-foreground">{item.name}</span>
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-destructive/10 text-destructive">
              {item.stock} {item.unit} left
            </span>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 py-2.5 rounded-full bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
        Restock Now 📦
      </button>
    </div>
  );
};

export default LowStockAlert;
