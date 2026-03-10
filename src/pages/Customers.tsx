import { Search, Mail, Phone, Users } from "lucide-react";

const customers = [
	{
		id: 1,
		name: "Alice Johnson",
		email: "alice@example.com",
		phone: "+1 234-567-8901",
		orders: 12,
		spent: 450.0,
		loyaltyPoints: 120,
	},
	{
		id: 2,
		name: "Bob Smith",
		email: "bob@example.com",
		phone: "+1 987-654-3210",
		orders: 5,
		spent: 125.5,
		loyaltyPoints: 45,
	},
	{
		id: 3,
		name: "Charlie Brown",
		email: "charlie@example.com",
		phone: "+1 555-123-4567",
		orders: 3,
		spent: 45.0,
		loyaltyPoints: 10,
	},
	{
		id: 4,
		name: "Diana Prince",
		email: "diana@example.com",
		phone: "+1 444-555-6666",
		orders: 20,
		spent: 890.0,
		loyaltyPoints: 350,
	},
	{
		id: 5,
		name: "Evan Wright",
		email: "evan@example.com",
		phone: "+1 777-888-9999",
		orders: 1,
		spent: 35.0,
		loyaltyPoints: 5,
	},
];

const Customers = () => {
	return (
		<div className="space-y-6 animate-fade-in">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h2 className="text-2xl font-bold font-dancing text-foreground">
						Customers 👥
					</h2>
					<p className="text-muted-foreground">
						Manage customer details and loyalty points.
					</p>
				</div>
			</div>

			<div className="flex items-center gap-4 bg-card p-4 rounded-bakery shadow-sm border border-border">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
					<input
						type="text"
						placeholder="Search customers..."
						className="w-full pl-9 pr-4 py-2 rounded-full bg-secondary text-sm outline-none focus:ring-2 focus:ring-chocolate/20 transition-all"
					/>
				</div>
			</div>

			<div className="bakery-card overflow-hidden p-0">
				<div className="overflow-x-auto">
					<table className="w-full text-left">
						<thead className="bg-secondary/50 text-muted-foreground font-medium border-b border-border">
							<tr>
								<th className="p-4 pl-6">Customer</th>
								<th className="p-4">Contact</th>
								<th className="p-4">Total Orders</th>
								<th className="p-4">Total Spent</th>
								<th className="p-4">Loyalty Points</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border">
							{customers.map((customer) => (
								<tr
									key={customer.id}
									className="hover:bg-secondary/20 transition-colors"
								>
									<td className="p-4 pl-6">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-chocolate font-bold">
												{customer.name.charAt(0)}
											</div>
											<span className="font-semibold text-foreground">
												{customer.name}
											</span>
										</div>
									</td>
									<td className="p-4 text-sm text-muted-foreground">
										<div className="flex flex-col gap-1">
											<span className="flex items-center gap-1">
												<Mail size={12} /> {customer.email}
											</span>
											<span className="flex items-center gap-1">
												<Phone size={12} /> {customer.phone}
											</span>
										</div>
									</td>
									<td className="p-4 font-medium">{customer.orders}</td>
									<td className="p-4 font-bold text-chocolate">
										${customer.spent.toFixed(2)}
									</td>
									<td className="p-4">
										<span className="px-2.5 py-1 rounded-full bg-mint/20 text-mint-darker text-xs font-bold border border-mint/30">
											{customer.loyaltyPoints} pts
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default Customers;
