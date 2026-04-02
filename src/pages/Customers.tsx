import { Search, Mail, Phone, Users, Star, MapPin, Calendar, ShoppingBag, Award, Clock, ArrowRight, X, User, Lock, Plus, RefreshCw, Filter } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { api } from "../services/api";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "../components/ui/sheet";
import { toast } from "sonner";

const Customers = () => {
	const [customers, setCustomers] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

	const [showAddModal, setShowAddModal] = useState(false);
	const [addForm, setAddForm] = useState({ name: "", email: "", phone: "", address: "", password: "" });
	const [addingCustomer, setAddingCustomer] = useState(false);

	const handleAddCustomer = async (e: React.FormEvent) => {
		e.preventDefault();
		setAddingCustomer(true);
		try {
			const res: any = await api.customers.create(addForm);
			if (res && res.customer) {
				setCustomers([res.customer, ...customers]);
			}
			setShowAddModal(false);
			setAddForm({ name: "", email: "", phone: "", address: "", password: "" });
			toast.success("New customer added successfully!");
		} catch (error: any) {
			toast.error(error?.response?.data?.error || error.message || "Failed to add customer");
		} finally {
			setAddingCustomer(false);
		}
	};

	const fetchCustomers = () => {
		setLoading(true);
		api.customers.getAll()
			.then((data) => {
				setCustomers(data || []);
			})
			.catch((err) => {
				toast.error("Failed to load customer records.");
			})
			.finally(() => {
				setLoading(false);
			});
	};

	useEffect(() => {
		fetchCustomers();
	}, []);

	const filteredCustomers = useMemo(() => {
		const q = (searchQuery || '').trim().toLowerCase();
		if (!q) return customers;
		return customers.filter(c => {
			return (
				(c.name || '').toLowerCase().includes(q) ||
				(c.email || '').toLowerCase().includes(q) ||
				(c.phone || '').toString().toLowerCase().includes(q) ||
				(c.address || '').toLowerCase().includes(q)
			);
		});
	}, [customers, searchQuery]);

	const formatDate = (dateStr: string) => {
		if (!dateStr) return "N/A";
		const date = new Date(dateStr);
		return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
	};

	return (
		<div className="space-y-8 animate-in fade-in duration-700 font-lora">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
				<div>
					<h2 className="text-4xl font-bold font-dancing text-chocolate">Customers</h2>
					<p className="text-sm text-chocolate-light font-medium mt-1">
						Manage your bakery's customer database.
					</p>
				</div>
				<div className="flex items-center gap-4">
          <button 
            onClick={fetchCustomers}
            className="p-3 bg-white border border-chocolate/10 rounded-full text-chocolate hover:bg-strawberry/5 transition-all shadow-sm group"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
          </button>
					<button 
						onClick={() => setShowAddModal(true)} 
						className="px-6 py-3 bg-chocolate text-white rounded-full flex items-center gap-2 shadow-bakery hover:shadow-bakery-lg hover:bg-strawberry transition-all duration-300"
					>
						<Plus size={18} />
						<span className="font-bold text-xs uppercase tracking-widest text-[#F5ECD7]">Add Customer</span>
					</button>
				</div>
			</div>

			<div className="flex items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-[2rem] shadow-bakery border border-chocolate/5">
				<div className="relative flex-1 group">
					<Search className="absolute left-5 top-1/2 -translate-y-1/2 text-chocolate/30 group-focus-within:text-strawberry transition-colors w-5 h-5" />
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search customers..."
						className="w-full pl-14 pr-6 py-4 rounded-2xl bg-[#FAF6E6]/50 text-chocolate outline-none border border-transparent focus:border-strawberry/20 focus:bg-white focus:ring-8 focus:ring-strawberry/5 transition-all font-medium placeholder:text-chocolate/20"
					/>
				</div>
				<button type="button" onClick={() => setSearchQuery('')} className="px-4 py-3 bg-white border border-chocolate/10 rounded-2xl text-chocolate hover:bg-strawberry/5 transition-all shadow-sm">Clear</button>
				<button className="p-4 bg-white border border-chocolate/10 rounded-2xl text-chocolate hover:bg-strawberry/5 transition-all shadow-sm">
          <Filter size={20} />
        </button>
			</div>

			<div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-chocolate/5 shadow-bakery overflow-hidden relative">
				<div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-chocolate via-strawberry to-chocolate/20 opacity-80"></div>

				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead className="bg-[#FAF6E6]/40 text-chocolate/40 font-bold uppercase tracking-widest text-[10px] border-b border-chocolate/5">
							<tr>
								<th className="p-8 pl-10">Customer</th>
								<th className="p-8">Contact Info</th>
								<th className="p-8">Address</th>
								<th className="p-8 text-right pr-10">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-chocolate/5">
							{loading && customers.length === 0 ? (
								<tr>
									<td colSpan={4} className="p-24 text-center">
										<div className="flex flex-col items-center justify-center gap-4">
											<div className="w-12 h-12 border-4 border-chocolate/10 border-t-chocolate rounded-full animate-spin"></div>
											<span className="text-chocolate-light font-medium animate-pulse italic">Loading customer data...</span>
										</div>
									</td>
								</tr>
							) : filteredCustomers.length === 0 ? (
								<tr>
									<td colSpan={4} className="p-24 text-center">
										<div className="flex flex-col items-center justify-center gap-3 text-chocolate/20">
											<Users size={48} strokeWidth={1} />
											<span className="font-medium italic">No customers found.</span>
										</div>
									</td>
								</tr>
							) : filteredCustomers.map((customer) => (
								<tr
									key={customer._id || customer.id}
									className="group hover:bg-white/60 transition-all duration-300"
								>
									<td className="p-6 pl-10 border-none">
										<div className="flex items-center gap-5">
											<div className="relative">
												<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-chocolate/10 to-chocolate/5 flex items-center justify-center text-chocolate font-dancing font-bold text-2xl shadow-inner border border-chocolate/5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
													{customer.name?.charAt(0) || '?'}
												</div>
												<div className="absolute -bottom-1 -right-1 w-5 h-5 bg-cream border-2 border-white rounded-full flex items-center justify-center shadow-sm">
													<Star size={10} className="text-strawberry fill-strawberry" />
												</div>
											</div>
											<div className="flex flex-col">
												<span className="font-bold text-chocolate text-base group-hover:text-strawberry transition-colors">
													{customer.name}
												</span>
												<span className="text-[10px] font-bold text-chocolate/30 uppercase tracking-widest mt-0.5">
													ID: {String(customer._id || customer.id || '').substring(0, 8)}
												</span>
											</div>
										</div>
									</td>
									<td className="p-6 border-none">
										<div className="flex flex-col gap-2 text-xs text-chocolate-light font-medium">
											<div className="flex items-center gap-2.5">
												<div className="w-6 h-6 rounded-lg bg-strawberry/5 flex items-center justify-center text-strawberry">
													<Mail size={12} />
												</div>
												{customer.email}
											</div>
											{customer.phone && (
												<div className="flex items-center gap-2.5">
													<div className="w-6 h-6 rounded-lg bg-chocolate/5 flex items-center justify-center text-chocolate">
														<Phone size={12} />
													</div>
													{customer.phone}
												</div>
											)}
										</div>
									</td>
									<td className="p-6 border-none">
										<div className="flex items-start gap-2.5 text-xs text-chocolate-light font-medium max-w-[250px]">
											<MapPin size={16} className="text-strawberry/40 flex-shrink-0 mt-0.5" />
											<span className="line-clamp-2 italic leading-relaxed">
												{customer.address || <span className="opacity-30">No address provided</span>}
											</span>
										</div>
									</td>
									<td className="p-6 pr-10 text-right border-none">
										<button
											onClick={() => setSelectedCustomer(customer)}
											className="ml-auto px-5 py-2.5 rounded-full text-xs font-bold text-chocolate bg-white border border-chocolate/10 hover:border-strawberry hover:bg-strawberry hover:text-white transition-all flex items-center gap-2 shadow-sm group/btn"
										>
											Details
											<ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			<Sheet open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
				<SheetContent side="right" className="flex flex-col h-full bg-[#FAFBFD] p-0 border-l border-chocolate/10">
					{selectedCustomer && (
						<>
							<SheetHeader className="p-10 bg-white border-b border-chocolate/5 relative overflow-hidden">
								<div className="absolute top-0 right-0 w-48 h-48 bg-strawberry/5 rounded-full -mr-24 -mt-24 blur-3xl" />
                <div className="relative flex items-end gap-6">
                  <div className="w-24 h-24 rounded-[1.5rem] bg-chocolate text-white flex items-center justify-center font-dancing text-5xl shadow-bakery transform -rotate-3 hover:rotate-0 transition-transform">
                    {selectedCustomer.name?.charAt(0) || '?'}
                  </div>
                  <div className="mb-2">
                    <SheetTitle className="text-4xl font-bold text-chocolate font-dancing">
                      {selectedCustomer.name}
                    </SheetTitle>
                    <SheetDescription className="text-chocolate-light font-medium flex items-center gap-2 mt-1">
                      <Award size={14} className="text-strawberry" />
                       Customer since {formatDate(selectedCustomer.createdAt)}
                    </SheetDescription>
                  </div>
                </div>
							</SheetHeader>

							<div className="flex-1 overflow-y-auto p-10 space-y-10">
                <section className="space-y-4">
                  <h4 className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] flex items-center gap-2">
                    <User size={12} className="text-strawberry" />
                    Customer Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 rounded-3xl bg-white border border-chocolate/5 shadow-sm space-y-1 hover:shadow-md transition-shadow">
                      <p className="text-[10px] font-bold text-strawberry/60 uppercase tracking-widest">Email</p>
                      <p className="text-sm font-bold text-chocolate truncate">{selectedCustomer.email}</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-white border border-chocolate/5 shadow-sm space-y-1 hover:shadow-md transition-shadow">
                      <p className="text-[10px] font-bold text-strawberry/60 uppercase tracking-widest">Phone</p>
                      <p className="text-sm font-bold text-chocolate">{selectedCustomer.phone || "No phone provided"}</p>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h4 className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] flex items-center gap-2">
                    <MapPin size={12} className="text-strawberry" />
                    Delivery Address
                  </h4>
                  <div className="p-8 rounded-[2rem] bg-chocolate/5 border border-chocolate/5 italic text-chocolate-light text-sm leading-relaxed relative overflow-hidden">
                    <MapPin size={60} className="absolute -right-4 -bottom-4 text-chocolate/5 opacity-50" />
                    {selectedCustomer.address ? selectedCustomer.address : "No address provided for this customer."}
                  </div>
                </section>

                <section className="space-y-4">
                  <h4 className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] flex items-center gap-2">
                    <ShoppingBag size={12} className="text-strawberry" />
                    Order History
                  </h4>
                  <div className="bg-white rounded-3xl border border-chocolate/5 p-8 text-center space-y-2">
                    <p className="text-xs text-chocolate-light font-medium italic">Order history loading...</p>
                    <p className="text-[10px] text-chocolate/20 uppercase tracking-widest font-bold">Coming Soon</p>
                  </div>
                </section>
							</div>

							<SheetFooter className="p-8 bg-white border-t border-chocolate/5 flex flex-row items-center justify-between">
								<div className="text-[10px] font-bold text-chocolate/30 uppercase tracking-widest flex items-center gap-2">
									<Clock size={12} />
									Updated: Just now
								</div>
								<button
									onClick={() => setSelectedCustomer(null)}
									className="px-8 py-3 rounded-full text-xs font-bold text-[#F5ECD7] bg-chocolate hover:bg-strawberry transition-all shadow-bakery uppercase tracking-widest"
								>
									Close
								</button>
							</SheetFooter>
						</>
					)}
				</SheetContent>
			</Sheet>

			<Sheet open={showAddModal} onOpenChange={setShowAddModal}>
				<SheetContent side="right" className="flex flex-col h-full bg-[#FAFBFD] p-0 border-l border-chocolate/10">
					<SheetHeader className="p-10 bg-white border-b border-chocolate/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-strawberry/5 rounded-full -mr-24 -mt-24 blur-3xl" />
						<div className="relative flex items-center gap-5">
							<div className="w-16 h-16 rounded-2xl bg-chocolate text-white flex items-center justify-center shadow-bakery">
								<Plus size={32} />
							</div>
							<div>
								<SheetTitle className="font-dancing text-4xl font-bold text-chocolate">
									Add New Customer
								</SheetTitle>
								<SheetDescription className="text-chocolate-light font-medium italic">
									Create a new customer account.
								</SheetDescription>
							</div>
						</div>
					</SheetHeader>

					<form id="add-customer-form" onSubmit={handleAddCustomer} className="flex-1 overflow-y-auto p-10 space-y-8">
						<div className="space-y-6">
							<div className="space-y-2 group">
								<label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Full Name</label>
								<div className="relative">
									<User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
									<input required value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-medium placeholder:text-chocolate/10" placeholder="e.g. John Doe" />
								</div>
							</div>

							<div className="space-y-2 group">
								<label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Email</label>
								<div className="relative">
									<Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
									<input type="email" required value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })} className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-medium placeholder:text-chocolate/10" placeholder="john@example.com" />
								</div>
							</div>

							<div className="space-y-2 group">
								<label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Phone Number</label>
								<div className="relative">
									<Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
									<input type="tel" required value={addForm.phone} onChange={e => setAddForm({ ...addForm, phone: e.target.value })} className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-medium placeholder:text-chocolate/10" placeholder="+1 (234) 567-890" />
								</div>
							</div>

							<div className="space-y-2 group">
								<label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Address</label>
								<div className="relative">
									<MapPin size={18} className="absolute left-4 top-5 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
									<textarea value={addForm.address} onChange={e => setAddForm({ ...addForm, address: e.target.value })} className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all min-h-[120px] resize-none font-medium placeholder:text-chocolate/10" placeholder="Enter delivery address..." />
								</div>
							</div>

							<div className="space-y-2 group">
								<label className="text-[10px] font-bold text-chocolate/40 uppercase tracking-[0.2em] ml-1">Password</label>
								<div className="relative">
									<Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-strawberry transition-colors" />
									<input type="password" required value={addForm.password} onChange={e => setAddForm({ ...addForm, password: e.target.value })} className="w-full pl-12 pr-6 py-4 bg-white border border-chocolate/10 focus:border-strawberry focus:ring-8 focus:ring-strawberry/5 rounded-2xl text-sm outline-none transition-all font-medium placeholder:text-chocolate/10" placeholder="Enter secure password" />
								</div>
							</div>
						</div>
					</form>

					<SheetFooter className="p-10 bg-white border-t border-chocolate/5 flex flex-row items-center justify-between">
						<button 
              type="button" 
              onClick={() => setShowAddModal(false)} 
              className="px-8 py-3 rounded-full text-xs font-bold text-chocolate bg-white border border-chocolate/10 hover:bg-chocolate/5 transition-all uppercase tracking-widest"
            >
							Cancel
						</button>
						<button 
              type="submit" 
              form="add-customer-form" 
              disabled={addingCustomer} 
              className="px-10 py-4 rounded-full text-xs font-bold text-white bg-chocolate hover:bg-strawberry transition-all shadow-bakery disabled:opacity-50 flex items-center gap-3 uppercase tracking-widest"
            >
							{addingCustomer ? (
								<RefreshCw size={16} className="animate-spin" />
							) : "Add Customer"}
						</button>
					</SheetFooter>
				</SheetContent>
			</Sheet>
		</div>
	);
};

export default Customers;
