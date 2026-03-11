import { Croissant, Cookie, Cake } from "lucide-react";

const products = [
	{ name: "Chocolate Croissant", sold: 84, icon: Croissant, progress: 84 },
	{ name: "Strawberry Cupcake", sold: 72, icon: Cake, progress: 72 },
	{ name: "Vanilla Macaron", sold: 65, icon: Cookie, progress: 65 },
	{ name: "Blueberry Muffin", sold: 58, icon: Cookie, progress: 58 },
	{ name: "Red Velvet Cake", sold: 45, icon: Cake, progress: 45 },
];

const PopularProducts = () => {
	return (
		<div className="bg-white rounded-2xl p-6 border border-[#D4A373]/20 shadow-sm animate-fade-in">
			<div className="mb-6">
				<h3 className="font-playfair text-xl font-bold text-[#1A2744]">
					Popular Products
				</h3>
				<p className="text-xs text-[#8D6E63] uppercase tracking-wider font-bold mt-1">
					This week's favorites
				</p>
			</div>

			<div className="space-y-5">
				{products.map((product, i) => (
					<div key={product.name} className="group">
						<div className="flex items-center gap-4 mb-2">
							<div
								className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300 ${
									i === 0
										? "bg-[#1A2744] text-[#F5ECD7]"
										: "bg-[#F5ECD7] text-[#1A2744] group-hover:bg-[#1A2744] group-hover:text-[#F5ECD7]"
								}`}
							>
								<product.icon className="w-5 h-5" />
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex justify-between items-center mb-1">
									<span className="text-sm font-bold text-[#1A2744] font-playfair truncate">
										{product.name}
									</span>
									<span className="text-xs font-bold text-[#D4A373]">
										{product.sold} sold
									</span>
								</div>
								{/* Custom Progress Bar */}
								<div className="h-2 w-full bg-[#FAF6E6] rounded-full overflow-hidden">
									<div
										className="h-full bg-[#D4A373] rounded-full relative"
										style={{ width: `${product.progress}%` }}
									>
										{/* Shimmer effect */}
										<div className="absolute top-0 left-0 bottom-0 right-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]"></div>
									</div>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default PopularProducts;
