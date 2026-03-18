import { Search, Mail, Phone, Users, Star, MapPin, Calendar, ShoppingBag, Award, Clock, ArrowRight, X, User, Lock } from "lucide-react";
import { useState, useEffect } from "react";
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
			toast.success("Customer added successfully!");
		} catch (error: any) {
			console.error("Failed to add customer:", error);
			toast.error(error?.response?.data?.error || error.message || "Failed to add customer");
		} finally {
			setAddingCustomer(false);
		}
	};

	useEffect(() => {
		api.customers.getAll()
			.then((data) => {
				setCustomers(data || []);
			})
			.catch((err) => {
				console.error("Failed to fetch customers:", err);
			})
			.finally(() => {
				setLoading(false);
			});
	}, []);

	const filteredCustomers = customers.filter(c =>
		c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
		c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
		c.phone?.includes(searchQuery)
	);

	const formatDate = (dateStr: string) => {
		if (!dateStr) return "N/A";
		const date = new Date(dateStr);
		return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
	};

	return (
		<div className="space-y-8 animate-fade-in font-inter">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h2 className="text-3xl font-bold font-playfair text-[#1A2744]">
						Our Customers{" "}
						<span className="inline-block animate-bounce text-[#D4A373]">
							👥
						</span>
					</h2>
					<p className="text-[#8D6E63] mt-1 font-medium">
						Manage profiles, contact details, and view loyalty information.
					</p>
				</div>
				<button onClick={() => setShowAddModal(true)} className="px-6 py-3 bg-[#1A2744] text-[#F5ECD7] rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-[#D4A373] hover:text-[#1A2744] transition-all duration-300 flex items-center gap-2 group">
					<Users size={18} className="group-hover:scale-110 transition-transform" />
					<span className="uppercase tracking-wider text-xs">Add Customer</span>
				</button>
			</div>

			<div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-[#D4A373]/20">
				<div className="relative flex-1 group">
					<Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A2744]/40 group-focus-within:text-[#D4A373] transition-colors w-5 h-5" />
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search by name, email, or phone..."
						className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#FAF6E6] text-[#1A2744] outline-none border border-transparent focus:border-[#D4A373]/30 focus:bg-white focus:ring-4 focus:ring-[#D4A373]/10 transition-all font-medium placeholder:text-[#1A2744]/40 placeholder:font-normal"
					/>
				</div>
			</div>

			<div className="bg-white rounded-2xl border border-[#D4A373]/20 shadow-lg overflow-hidden relative">
				{/* Decorative background accent */}
				<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4A373] to-[#F5ECD7]"></div>

				<div className="overflow-x-auto">
					<table className="w-full text-left">
						<thead className="bg-[#FAF6E6] text-[#1A2744]/60 font-bold uppercase tracking-wider text-xs border-b border-[#D4A373]/20">
							<tr>
								<th className="p-5 pl-8">Customer</th>
								<th className="p-5">Contact Details</th>
								<th className="p-5">Address</th>
								<th className="p-5 text-right pr-8">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-[#D4A373]/10">
							{loading ? (
								<tr>
									<td colSpan={4} className="p-12 text-center">
										<div className="flex flex-col items-center justify-center gap-3">
											<div className="w-8 h-8 border-4 border-[#D4A373]/30 border-t-[#D4A373] rounded-full animate-spin"></div>
											<span className="text-[#8D6E63] font-medium animate-pulse">Loading customers...</span>
										</div>
									</td>
								</tr>
							) : filteredCustomers.length === 0 ? (
								<tr>
									<td colSpan={4} className="p-12 text-center">
										<div className="flex flex-col items-center justify-center gap-2 text-[#8D6E63]">
											<Users size={32} className="opacity-20 mb-2" />
											<span className="font-medium">No customers found.</span>
											{searchQuery && <span className="text-sm">Try adjusting your search query.</span>}
										</div>
									</td>
								</tr>
							) : filteredCustomers.map((customer) => (
								<tr
									key={customer._id || customer.id}
									className="hover:bg-[#FAF6E6]/40 transition-colors group"
								>
									<td className="p-4 pl-8">
										<div className="flex items-center gap-4">
											<div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4A373] to-[#c49265] flex items-center justify-center text-white font-playfair font-bold text-xl shadow-md border border-white group-hover:scale-105 transition-transform">
												{customer.name?.charAt(0) || '?'}
											</div>
											<div className="flex flex-col">
												<span className="font-bold text-[#1A2744] text-base group-hover:text-[#D4A373] transition-colors">
													{customer.name}
												</span>
												<span className="text-xs font-mono text-[#8D6E63]/70 font-medium">
													#{String(customer._id || customer.id || '').substring(0, 8)}
												</span>
											</div>
										</div>
									</td>
									<td className="p-4">
										<div className="flex flex-col gap-1.5 text-sm text-[#1A2744]/80 font-medium">
											<div className="flex items-center gap-2">
												<Mail size={14} className="text-[#D4A373]" />
												{customer.email}
											</div>
											{customer.phone && (
												<div className="flex items-center gap-2">
													<Phone size={14} className="text-[#D4A373]" />
													{customer.phone}
												</div>
											)}
										</div>
									</td>
									<td className="p-4">
										<div className="flex items-start gap-2 text-sm text-[#1A2744]/70 font-medium max-w-[250px]">
											<MapPin size={16} className="text-[#D4A373] flex-shrink-0 mt-0.5" />
											<span className="truncate whitespace-normal line-clamp-2">
												{customer.address || <span className="text-[#1A2744]/40 italic">No address provided</span>}
											</span>
										</div>
									</td>
									<td className="p-4 pr-8 text-right">
										<button
											onClick={() => setSelectedCustomer(customer)}
											className="px-4 py-2 rounded-lg text-sm font-bold text-[#D4A373] bg-[#D4A373]/10 hover:bg-[#D4A373] hover:text-white transition-all flex items-center gap-2 ml-auto"
										>
											View Profile
											<ArrowRight size={14} />
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			<Sheet open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
				<SheetContent side="right" className="w-full md:w-[35vw] lg:w-[35vw] p-0 flex flex-col gap-0 bg-[#FAFAFA] border-l-[#D4A373]/20 shadow-2xl">
					{selectedCustomer && (
						<>
							{/* Premium Modal Header */}
							<div className="relative h-40 bg-gradient-to-br from-[#1A2744] to-[#2c3e50] p-6 flex items-end">
								{/* Decorative Background Elements */}
								<div className="absolute top-0 right-0 w-32 h-32 bg-white flex items-center justify-center opacity-5 rounded-bl-full">
									<Star size={100} />
								</div>

								{/* Close Button */}
								<button
									onClick={() => setSelectedCustomer(null)}
									className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm shadow-sm"
								>
									<X size={20} />
								</button>

								<div className="absolute -bottom-12 left-8 p-1 bg-[#FAFAFA] rounded-3xl shadow-xl">
									<div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#D4A373] to-[#c49265] flex items-center justify-center text-white font-playfair font-bold text-4xl shadow-inner border border-white/20">
										{selectedCustomer.name?.charAt(0) || '?'}
									</div>
								</div>
							</div>

							<div className="flex-1 overflow-y-auto px-8 pt-16 pb-8 space-y-8">
								{/* Title Section */}
								<div>
									<h2 className="text-3xl font-playfair font-bold text-[#1A2744]">
										{selectedCustomer.name}
									</h2>
									<div className="flex items-center gap-2 text-[#8D6E63] font-mono text-xs mt-1 bg-[#D4A373]/10 px-2 py-1 rounded inline-flex">
										ID: {selectedCustomer._id || selectedCustomer.id}
									</div>
								</div>

								{/* Info Cards */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{/* Contact Card */}
									<div className="p-5 rounded-2xl bg-white border border-[#D4A373]/20 shadow-sm space-y-4 col-span-1 md:col-span-2 hover:shadow-md transition-shadow">
										<div className="flex items-center gap-2 text-[#1A2744] font-bold text-sm uppercase tracking-wider mb-2">
											<User size={16} className="text-[#D4A373]" />
											Contact Information
										</div>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div className="flex items-start gap-3">
												<div className="p-2 bg-[#FAF6E6] rounded-lg text-[#D4A373]">
													<Mail size={16} />
												</div>
												<div className="overflow-hidden">
													<p className="text-[10px] font-bold text-[#8D6E63] uppercase tracking-wider">Email</p>
													<p className="text-sm font-medium text-[#1A2744] truncate">{selectedCustomer.email}</p>
												</div>
											</div>
											<div className="flex items-start gap-3">
												<div className="p-2 bg-[#FAF6E6] rounded-lg text-[#D4A373]">
													<Phone size={16} />
												</div>
												<div>
													<p className="text-[10px] font-bold text-[#8D6E63] uppercase tracking-wider">Phone</p>
													<p className="text-sm font-medium text-[#1A2744]">{selectedCustomer.phone || "Not provided"}</p>
												</div>
											</div>
										</div>
									</div>

									{/* Address Card */}
									<div className="p-5 rounded-2xl bg-white border border-[#D4A373]/20 shadow-sm space-y-3 col-span-1 md:col-span-2 hover:shadow-md transition-shadow">
										<div className="flex items-center gap-2 text-[#1A2744] font-bold text-sm uppercase tracking-wider mb-1">
											<MapPin size={16} className="text-[#D4A373]" />
											Delivery Address
										</div>
										<div className="bg-[#FAF6E6]/50 p-4 rounded-xl border border-[#D4A373]/10">
											<p className="text-sm text-[#1A2744] font-medium leading-relaxed">
												{selectedCustomer.address ? selectedCustomer.address : <span className="text-[#1A2744]/40 italic">No delivery address provided by this customer.</span>}
											</p>
										</div>
									</div>

									{/* Member Since Card */}
									<div className="p-5 rounded-2xl bg-gradient-to-br from-[#1A2744] to-[#2c3e50] shadow-md text-white space-y-1 relative overflow-hidden group">
										<div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
											<Calendar size={80} />
										</div>
										<p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Member Since</p>
										<p className="text-lg font-bold font-playfair">{formatDate(selectedCustomer.createdAt)}</p>
									</div>

									{/* Role / Status Card */}
									<div className="p-5 rounded-2xl bg-gradient-to-br from-[#D4A373] to-[#c49265] shadow-md text-white space-y-1 relative overflow-hidden group">
										<div className="absolute -right-4 -top-4 opacity-20 group-hover:scale-110 transition-transform duration-500">
											<Award size={80} />
										</div>
										<p className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Account Role</p>
										<p className="text-lg font-bold font-playfair capitalize">{selectedCustomer.role || 'Customer'}</p>
									</div>
								</div>

							</div>

							{/* Footer */}
							<SheetFooter className="p-6 bg-white border-t border-[#D4A373]/10 flex flex-row justify-between items-center sm:justify-between">
								<p className="text-xs text-[#8D6E63] font-medium flex items-center gap-1">
									<Clock size={12} />
									Last updated: Today
								</p>
								<button
									onClick={() => setSelectedCustomer(null)}
									className="px-6 py-2.5 rounded-xl text-sm font-bold text-[#1A2744] bg-[#FAF6E6] border border-transparent hover:border-[#D4A373]/30 hover:bg-[#D4A373] hover:text-white transition-colors"
								>
									Close Profile
								</button>
							</SheetFooter>
						</>
					)}
				</SheetContent>
			</Sheet>

			{/* Add Customer Modal */}
			<Sheet open={showAddModal} onOpenChange={(open) => !open && setShowAddModal(false)}>
				<SheetContent side="right" className="w-full md:w-[32vw] lg:w-[32vw] p-0 flex flex-col gap-0 bg-[#FAFAFA] border-l-[#D4A373]/20 shadow-2xl">
					<SheetHeader className="p-6 bg-white border-b border-[#D4A373]/10">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-[#1A2744] flex items-center justify-center text-white">
								<Users size={20} />
							</div>
							<div>
								<SheetTitle className="font-playfair text-2xl font-bold text-[#1A2744]">
									Add New Customer
								</SheetTitle>
								<SheetDescription className="text-[#8D6E63] font-medium">
									Register a new customer to the bakery.
								</SheetDescription>
							</div>
						</div>
					</SheetHeader>

					<form id="add-customer-form" onSubmit={handleAddCustomer} className="flex-1 overflow-y-auto p-6 space-y-6">
						<div className="space-y-5">
							<div className="space-y-1.5 group">
								<label className="text-xs font-bold text-[#1A2744] uppercase tracking-wider ml-1">Full Name</label>
								<div className="relative">
									<User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1A2744]/30 group-focus-within:text-[#D4A373] transition-colors" />
									<input required value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} className="w-full pl-11 pr-4 py-3 bg-white border border-[#D4A373]/20 focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/20 rounded-xl text-sm outline-none transition-all" placeholder="Enter Full Name" />
								</div>
							</div>

							<div className="space-y-1.5 group">
								<label className="text-xs font-bold text-[#1A2744] uppercase tracking-wider ml-1">Email Address</label>
								<div className="relative">
									<Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1A2744]/30 group-focus-within:text-[#D4A373] transition-colors" />
									<input type="email" required value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })} className="w-full pl-11 pr-4 py-3 bg-white border border-[#D4A373]/20 focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/20 rounded-xl text-sm outline-none transition-all" placeholder="Enter Email Address" />
								</div>
							</div>

							<div className="space-y-1.5 group">
								<label className="text-xs font-bold text-[#1A2744] uppercase tracking-wider ml-1">Phone Number</label>
								<div className="relative">
									<Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1A2744]/30 group-focus-within:text-[#D4A373] transition-colors" />
									<input type="tel" required value={addForm.phone} onChange={e => setAddForm({ ...addForm, phone: e.target.value })} className="w-full pl-11 pr-4 py-3 bg-white border border-[#D4A373]/20 focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/20 rounded-xl text-sm outline-none transition-all" placeholder="Enter Phone Number" />
								</div>
							</div>

							<div className="space-y-1.5 group">
								<label className="text-xs font-bold text-[#1A2744] uppercase tracking-wider ml-1">Delivery Address</label>
								<div className="relative">
									<MapPin size={18} className="absolute left-3.5 top-3.5 text-[#1A2744]/30 group-focus-within:text-[#D4A373] transition-colors" />
									<textarea value={addForm.address} onChange={e => setAddForm({ ...addForm, address: e.target.value })} className="w-full pl-11 pr-4 py-3 bg-white border border-[#D4A373]/20 focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/20 rounded-xl text-sm outline-none transition-all min-h-[100px] resize-none" placeholder="Enter Complete Delivery Address" />
								</div>
							</div>

							<div className="space-y-1.5 group">
								<label className="text-xs font-bold text-[#1A2744] uppercase tracking-wider ml-1">Account Password</label>
								<div className="relative">
									<Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1A2744]/30 group-focus-within:text-[#D4A373] transition-colors" />
									<input type="password" required value={addForm.password} onChange={e => setAddForm({ ...addForm, password: e.target.value })} className="w-full pl-11 pr-4 py-3 bg-white border border-[#D4A373]/20 focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/20 rounded-xl text-sm outline-none transition-all" placeholder="Create a password" />
								</div>
							</div>
						</div>
					</form>

					<SheetFooter className="p-6 bg-white border-t border-[#D4A373]/10 flex flex-row justify-end gap-3">
						<button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-[#1A2744] hover:bg-[#FAF6E6] border border-[#D4A373]/10 transition-colors">
							Cancel
						</button>
						<button type="submit" form="add-customer-form" disabled={addingCustomer} className="px-8 py-2.5 rounded-xl text-sm font-bold text-[#F5ECD7] flex items-center gap-2 shadow-lg hover:shadow-xl transition-all bg-[#1A2744] hover:bg-[#D4A373] hover:text-[#1A2744] disabled:opacity-70">
							{addingCustomer ? (
								<><div className="w-4 h-4 border-2 border-[#1A2744]/20 border-t-[#D4A373] rounded-full animate-spin" /> Saving</>
							) : "Save Customer"}
						</button>
					</SheetFooter>
				</SheetContent>
			</Sheet>
		</div>
	);
};

export default Customers;
