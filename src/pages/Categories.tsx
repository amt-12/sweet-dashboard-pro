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
		<div className="space-y-6 animate-fade-in">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h2 className="text-2xl font-bold font-dancing text-foreground">
						Categories 📂
					</h2>
					<p className="text-muted-foreground">
						Organize your products into categories.
					</p>
				</div>
				<button className="bakery-btn bg-chocolate text-cream flex items-center gap-2 shadow-lg hover:shadow-xl hover:bg-chocolate-light transition-all">
					<Plus size={18} /> Add Category
				</button>
			</div>

			<div className="flex items-center gap-4 bg-card p-4 rounded-bakery shadow-sm border border-border">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
					<input
						type="text"
						placeholder="Search categories..."
						className="w-full pl-9 pr-4 py-2 rounded-full bg-secondary text-sm outline-none focus:ring-2 focus:ring-chocolate/20 transition-all"
					/>
				</div>
				<button className="p-2 bg-secondary rounded-full text-foreground hover:bg-secondary/80 transition-colors">
					<Filter size={18} />
				</button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{categories.map((category) => (
					<div
						key={category.id}
						className="bg-card p-6 rounded-bakery shadow-sm border border-border hover:shadow-md transition-shadow group"
					>
						<div className="flex justify-between items-start mb-4">
							<div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xl">
								{category.name.charAt(0)}
							</div>
							<div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
								<button className="p-2 hover:bg-secondary rounded-full text-muted-foreground hover:text-chocolate transition-colors">
									<Edit size={16} />
								</button>
								<button className="p-2 hover:bg-secondary rounded-full text-muted-foreground hover:text-destructive transition-colors">
									<Trash2 size={16} />
								</button>
							</div>
						</div>
						<h3 className="text-lg font-bold text-foreground mb-2">
							{category.name}
						</h3>
						<p className="text-sm text-muted-foreground mb-4">
							{category.description}
						</p>
						<div className="flex items-center justify-between pt-4 border-t border-border">
							<span className="text-sm font-medium bg-secondary px-2 py-1 rounded-md text-foreground">
								{category.items} Products
							</span>
							<span
								className={`text-xs font-bold px-2 py-1 rounded-full ${
									category.status === "Active"
										? "bg-green-100 text-green-700"
										: "bg-gray-100 text-gray-500"
								}`}
							>
								{category.status}
							</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default Categories;
