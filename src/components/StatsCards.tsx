import {
	ShoppingBag,
	DollarSign,
	TrendingUp,
	Users,
} from "lucide-react";

const stats = [
	{
		title: "Today's Orders",
		value: "48",
		change: "+12%",
		icon: ShoppingBag,
		color: "bg-chocolate text-cream",
		trend: "up" as const,
	},
	{
		title: "Revenue",
		value: "$2,840",
		change: "+8.5%",
		icon: DollarSign,
		color: "bg-chocolate text-cream",
		trend: "up" as const,
	},
	{
		title: "Products Sold",
		value: "156",
		change: "+23%",
		icon: TrendingUp,
		color: "bg-chocolate text-cream",
		trend: "up" as const,
	},
	{
		title: "New Customers",
		value: "12",
		change: "+4",
		icon: Users,
		color: "bg-chocolate text-cream",
		trend: "up" as const,
	},
];

const StatsCards = () => {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
			{stats.map((stat, i) => (
				<div
					key={stat.title}
					className="bg-white rounded-2xl p-6 border border-[#D4A373]/20 shadow-sm hover:shadow-md transition-all duration-300 group"
					style={{ animationDelay: `${i * 100}ms` }}
				>
                    <div className="flex items-start justify-between mb-4">
                        <div
                            className={`w-12 h-12 rounded-xl bg-[#F5ECD7] text-[#1A2744] flex items-center justify-center group-hover:bg-[#1A2744] group-hover:text-[#F5ECD7] transition-colors duration-300`}
                        >
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                             stat.change.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                            {stat.change}
                        </span>
                    </div>
					
					<div>
						<p className="text-xs text-[#8D6E63] font-bold uppercase tracking-wider mb-1">
							{stat.title}
						</p>
						<h3 className="text-2xl font-playfair font-bold text-[#1A2744]">
							{stat.value}
						</h3>
					</div>
				</div>
			))}
		</div>
	);
};

export default StatsCards;
