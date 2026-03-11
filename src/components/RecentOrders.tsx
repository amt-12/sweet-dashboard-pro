import { Check, ChefHat, Package, Clock } from "lucide-react";

const orders = [
	{ id: "#1024", customer: "Sarah Johnson", items: "2x Croissant, 1x Latte", total: "$18.50", status: "Completed", icon: Check },
	{ id: "#1023", customer: "Mike Chen", items: "Custom Birthday Cake", total: "$85.00", status: "Preparing", icon: ChefHat },
	{ id: "#1022", customer: "Emma Wilson", items: "6x Macarons, 2x Eclair", total: "$32.00", status: "Ready", icon: Package },
	{ id: "#1021", customer: "James Brown", items: "1x Wedding Cake Tasting", total: "$45.00", status: "Pending", icon: Clock },
	{ id: "#1020", customer: "Lisa Park", items: "12x Cookie Box", total: "$28.00", status: "Completed", icon: Check },
];

const RecentOrders = () => {
	return (
		<div className="bg-white rounded-2xl p-6 border border-[#D4A373]/20 shadow-sm col-span-2">
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-2">
			        <h3 className="font-playfair text-xl font-bold text-[#1A2744]">Recent Orders</h3>
				</div>
				<button className="text-xs font-bold text-[#D4A373] hover:text-[#1A2744] uppercase tracking-wider transition-colors">View All</button>
			</div>
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="text-left text-xs font-bold text-[#8D6E63] uppercase tracking-wider border-b border-[#D4A373]/20">
							<th className="pb-4 pl-2">Order ID</th>
							<th className="pb-4">Customer</th>
							<th className="pb-4">Items</th>
							<th className="pb-4">Total</th>
							<th className="pb-4 text-center">Status</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-[#D4A373]/10">
						{orders.map((order) => (
							<tr key={order.id} className="hover:bg-[#F5ECD7]/30 transition-colors group">
								<td className="py-4 pl-2 text-sm font-bold text-[#1A2744] font-mono">{order.id}</td>
								<td className="py-4 text-sm font-medium text-[#1A2744]">{order.customer}</td>
								<td className="py-4 text-sm text-[#8D6E63]">{order.items}</td>
								<td className="py-4 text-sm font-bold text-[#1A2744]">{order.total}</td>
								<td className="py-4 text-center">
									<span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                        order.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                        order.status === 'Preparing' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                        order.status === 'Ready' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                        'bg-gray-50 text-[#8D6E63] border-gray-200'
                                    }`}>
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
