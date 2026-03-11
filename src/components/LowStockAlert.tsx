import { AlertTriangle, Milk, CheckSquare, ShoppingBag, Droplet } from "lucide-react";

const lowStockItems = [
	{ name: "Vanilla Extract", stock: 2, unit: "bottles", icon: Droplet },
	{ name: "Butter", stock: 3, unit: "kg", icon: Milk },
	{ name: "Dark Chocolate", stock: 5, unit: "bars", icon: CheckSquare },
	{ name: "Strawberries", stock: 1, unit: "kg", icon: ShoppingBag },
];

const LowStockAlert = () => {
	return (
		<div className="bg-white rounded-2xl p-6 border border-[#D4A373]/20 shadow-sm relative overflow-hidden">
			{/* Decorative stripe */}
			<div className="absolute top-0 left-0 bottom-0 w-1.5 bg-red-400"></div>

			<div className="flex items-center justify-between mb-6 pl-2">
				<div>
					<h3 className="font-playfair text-xl font-bold text-[#1A2744]">
						Low Stock Alert
					</h3>
					<p className="text-xs text-red-400 uppercase tracking-wider font-bold mt-1">
						Action needed
					</p>
				</div>
				<span className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center font-bold text-xs border border-red-100 animate-pulse">
					{lowStockItems.length}
				</span>
			</div>

			<div className="space-y-3 pl-2">
				{lowStockItems.map((item) => (
					<div
						key={item.name}
						className="flex items-center justify-between p-3 rounded-xl bg-[#FAF6E6] hover:bg-[#F5ECD7] transition-colors group border border-transparent hover:border-[#D4A373]/30"
					>
						<div className="flex items-center gap-3">
							<div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#1A2744] shadow-sm">
								<item.icon size={16} />
							</div>
							<span className="text-sm font-bold text-[#1A2744]">
								{item.name}
							</span>
						</div>
						<span className="text-[10px] font-bold px-2 py-1 rounded-md bg-white border border-red-100 text-red-500 uppercase tracking-wide">
							{item.stock} {item.unit} left
						</span>
					</div>
				))}
			</div>

			<button className="w-full mt-6 py-3 rounded-xl bg-[#1A2744] text-[#F5ECD7] text-xs font-bold uppercase tracking-widest hover:bg-[#D4A373] hover:text-[#1A2744] transition-all shadow-md ml-1" style={{ width: "calc(100% - 4px)" }}>
				Restock Now
			</button>
		</div>
	);
};

export default LowStockAlert;
