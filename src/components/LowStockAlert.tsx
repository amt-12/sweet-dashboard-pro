import { AlertTriangle, Milk, CheckSquare, ShoppingBag, Droplet } from "lucide-react";

const lowStockItems = [
	{ name: "Vanilla Extract", stock: 2, unit: "bottles", icon: Droplet },
	{ name: "Butter", stock: 3, unit: "kg", icon: Milk },
	{ name: "Dark Chocolate", stock: 5, unit: "bars", icon: CheckSquare },
	{ name: "Strawberries", stock: 1, unit: "kg", icon: ShoppingBag },
];

const LowStockAlert = () => {
	return (
		<div className="bakery-card border-l-4 border-l-strawberry">
			<div className="flex items-center justify-between mb-4">
				<h3 className="font-dancing text-lg font-bold text-foreground">
					Low Stock Alert ⚠️
				</h3>
				<span className="text-xs font-semibold px-2 py-1 rounded-full bg-strawberry-light text-strawberry">
					{lowStockItems.length} Items
				</span>
			</div>
			<div className="space-y-3">
				{lowStockItems.map((item) => (
					<div
						key={item.name}
						className="flex items-center justify-between p-3 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors"
					>
						<div className="flex items-center gap-3">
							<div className="w-8 h-8 rounded-full bg-chocolate/10 flex items-center justify-center text-chocolate">
								<item.icon size={16} />
							</div>
							<span className="text-sm font-medium text-foreground">
								{item.name}
							</span>
						</div>
						<span className="text-xs font-bold px-2 py-1 rounded-full bg-destructive/10 text-destructive">
							{item.stock} {item.unit} left
						</span>
					</div>
				))}
			</div>
			<button className="w-full mt-4 py-2.5 rounded-full bg-chocolate text-cream text-sm font-semibold hover:opacity-90 transition-opacity">
				Restock Now
			</button>
		</div>
	);
};

export default LowStockAlert;
