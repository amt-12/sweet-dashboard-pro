import { Plus, Search, Edit, Trash2, Filter } from "lucide-react";

const categories = [
	{
		id: 1,
		name: "Cakes",
		description: "Delicious cakes for all occasions",
		items: 24,
		status: "Active",
	},
	{
		id: 2,
		name: "Pastries",
		description: "Flaky and buttery pastries",
		items: 15,
		status: "Active",
	},
	{
		id: 3,
		name: "Cookies",
		description: "Crunchy and chewy cookies",
		items: 30,
		status: "Active",
	},
	{
		id: 4,
		name: "Breads",
		description: "Freshly baked artisan breads",
		items: 10,
		status: "Inactive",
	},
	{
		id: 5,
		name: "Beverages",
		description: "Hot and cold drinks",
		items: 8,
		status: "Active",
	},
];

const Categories = () => {
	return (
		<div className="space-y-8 animate-fade-in font-lora">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h2 className="text-3xl font-bold font-playfair text-[#1A2744]">
						Menu Categories{" "}
						<span className="inline-block hover:scale-110 transition-transform">
							🥞
						</span>
					</h2>
					<p className="text-[#8D6E63] mt-1">
						Organize your delicious offerings.
					</p>
				</div>
				<button className="px-5 py-2.5 bg-[#D4A373] text-white rounded-full font-bold shadow-md hover:bg-[#c49265] transition-all flex items-center gap-2">
					<Plus size={18} /> Add Category
				</button>
			</div>

			<div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-[#D4A373]/20">
				<div className="relative flex-1">
					<Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4A373] w-5 h-5" />
					<input
						type="text"
						placeholder="Search categories..."
						className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#F5ECD7]/30 text-[#1A2744] outline-none focus:ring-2 focus:ring-[#D4A373]/50 transition-all placeholder:text-[#8D6E63]/60"
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{categories.map((category) => (
					<div
						key={category.id}
						className="bg-white p-6 rounded-2xl shadow-sm border border-[#D4A373]/20 hover:shadow-bakery-lg hover:-translate-y-1 transition-all duration-300 group"
					>
						<div className="flex justify-between items-start mb-4">
							<div className="w-14 h-14 rounded-2xl bg-[#F5ECD7]/50 flex items-center justify-center text-[#D4A373] font-playfair font-bold text-2xl border border-[#D4A373]/20 shadow-inner">
								{category.name.charAt(0)}
							</div>
							<div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
								<button className="p-2 bg-[#F5ECD7] rounded-full text-[#8D6E63] hover:text-[#1A2744] hover:bg-[#D4A373] hover:text-white transition-all shadow-sm">
									<Edit size={16} />
								</button>
								<button className="p-2 bg-red-50 rounded-full text-red-400 hover:text-white hover:bg-red-500 transition-all shadow-sm">
									<Trash2 size={16} />
								</button>
							</div>
						</div>
						<h3 className="text-xl font-bold font-playfair text-[#1A2744] mb-2">
							{category.name}
						</h3>
						<p className="text-sm text-[#8D6E63] mb-4 line-clamp-2">
							{category.description}
						</p>
						<div className="flex items-center justify-between pt-4 border-t border-[#D4A373]/10">
							<span className="text-xs font-bold uppercase tracking-wider bg-[#F5ECD7] px-3 py-1 rounded-full text-[#8D6E63]">
								{category.items} Items
							</span>
							<span
								className={`text-xs font-bold ${
									category.status === "Active"
										? "text-green-600"
										: "text-gray-400"
								}`}
							>
								● {category.status}
							</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default Categories;
