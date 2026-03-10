import { Check, ChefHat, Package, Clock } from "lucide-react";

const orders = [
	{ id: "#1024", customer: "Sarah Johnson", items: "2x Croissant, 1x Latte", total: "$18.50", status: "Completed", icon: Check },
	{ id: "#1023", customer: "Mike Chen", items: "Custom Birthday Cake", total: "$85.00", status: "Preparing", icon: ChefHat },
	{ id: "#1022", customer: "Emma Wilson", items: "6x Macarons, 2x Eclair", total: "$32.00", status: "Ready", icon: Package },
	{ id: "#1021", customer: "James Brown", items: "1x Wedding Cake Tasting", total: "$45.00", status: "Pending", icon: Clock },
	{ id: "#1020", customer: "Lisa Park", items: "12x Cookie Box", total: "$28.00", status: "Completed", icon: Check },
];

const statusColors: Record<string, string> = {
	Completed: "bg-mint text-foreground",
	Preparing: "bg-vanilla text-chocolate",
	Ready: "bg-strawberry-light text-strawberry",
	Pending: "bg-caramel-light text-chocolate",
};

const RecentOrders = () => {
	return (
		<div className="bakery-card col-span-2 animate-fade-in" style={{ animationDelay: "500ms" }}>
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<h3 className="font-dancing text-lg font-bold text-foreground">Recent Orders</h3>
				</div>
				<button className="text-sm font-medium text-chocolate hover:underline">View All</button>
			</div>
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="text-left text-xs text-muted-foreground border-b border-border">
							<th className="pb-3 font-medium">Order</th>
							<th className="pb-3 font-medium">Customer</th>
							<th className="pb-3 font-medium">Items</th>
							<th className="pb-3 font-medium">Total</th>
							<th className="pb-3 font-medium">Status</th>
						</tr>
					</thead>
					<tbody>
						{orders.map((order) => (
							<tr key={order.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/30 transition-colors">
								<td className="py-3 text-sm font-semibold text-foreground">{order.id}</td>
								<td className="py-3 text-sm text-foreground">{order.customer}</td>
								<td className="py-3 text-sm text-muted-foreground">{order.items}</td>
								<td className="py-3 text-sm font-semibold text-foreground">{order.total}</td>
								<td className="py-3">
									<span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
										<order.icon className="w-3.5 h-3.5" />
										{order.status}
									</span>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default RecentOrders;
