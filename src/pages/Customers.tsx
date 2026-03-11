import { Search, Mail, Phone, Users, Star } from "lucide-react";

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
		<div className="space-y-8 animate-fade-in font-lora">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h2 className="text-3xl font-bold font-playfair text-[#1A2744]">
						Our Customers{" "}
						<span className="inline-block animate-bounce text-[#D4A373]">
							👥
						</span>
					</h2>
					<p className="text-[#8D6E63] mt-1">
						Manage profiles, order history, and loyalty rewards.
					</p>
				</div>
				<button className="px-5 py-2.5 bg-[#D4A373] text-white rounded-full font-bold shadow-md hover:bg-[#c49265] transition-all flex items-center gap-2">
					<Users size={18} />
					Add Customer
				</button>
			</div>

			<div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-[#D4A373]/20">
				<div className="relative flex-1">
					<Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4A373] w-5 h-5" />
					<input
						type="text"
						placeholder="Search by name, email, or phone..."
						className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#F5ECD7]/30 text-[#1A2744] outline-none focus:ring-2 focus:ring-[#D4A373]/50 transition-all placeholder:text-[#8D6E63]/60"
					/>
				</div>
			</div>

			<div className="bg-white rounded-2xl border border-[#D4A373]/20 shadow-sm overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left">
						<thead className="bg-[#F5ECD7]/30 text-[#8D6E63] font-bold uppercase tracking-wider text-xs border-b border-[#D4A373]/20">
							<tr>
								<th className="p-5 pl-8">Customer</th>
								<th className="p-5">Contact Details</th>
								<th className="p-5">Orders</th>
								<th className="p-5">Total Spent</th>
								<th className="p-5">Loyalty Points</th>
								<th className="p-5 text-right pr-8">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-[#D4A373]/10">
							{customers.map((customer) => (
								<tr
									key={customer.id}
									className="hover:bg-[#F5ECD7]/20 transition-colors group"
								>
									<td className="p-4 pl-8">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-full bg-[#F5ECD7] flex items-center justify-center text-[#D4A373] font-playfair font-bold text-lg border border-[#D4A373]/20 shadow-sm">
												{customer.name.charAt(0)}
											</div>
											<div className="flex flex-col">
												<span className="font-bold text-[#1A2744]">
													{customer.name}
												</span>
												<span className="text-xs text-[#8D6E63]">
													ID: #{customer.id}
												</span>
											</div>
										</div>
									</td>
									<td className="p-4">
										<div className="flex flex-col gap-1 text-sm text-[#6D4C41]">
											<div className="flex items-center gap-2">
												<Mail size={14} className="text-[#D4A373]" />
												{customer.email}
											</div>
											<div className="flex items-center gap-2">
												<Phone size={14} className="text-[#D4A373]" />
												{customer.phone}
											</div>
										</div>
									</td>
									<td className="p-4">
										<span className="px-3 py-1 bg-[#F5ECD7] text-[#8D6E63] rounded-full text-xs font-bold">
											{customer.orders} Orders
										</span>
									</td>
									<td className="p-4 text-[#1A2744] font-bold font-mono">
										${customer.spent.toFixed(2)}
									</td>
									<td className="p-4">
										<div className="flex items-center gap-1.5 text-[#D4A373] font-bold">
											<Star size={16} fill="currentColor" />
											{customer.loyaltyPoints} pts
										</div>
									</td>
									<td className="p-4 pr-8 text-right">
										<button className="text-sm font-bold text-[#D4A373] hover:text-[#1A2744] transition-colors underline decoration-dotted underline-offset-4">
											View Profile
										</button>
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
