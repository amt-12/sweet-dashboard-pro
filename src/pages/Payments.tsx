import { Search, CreditCard, DollarSign, Calendar, TrendingUp, Check, Clock, AlertCircle, RefreshCw, FileDown, User, Hash, Tag, Info } from "lucide-react";
import { useState } from "react";

const initialPayments = [
  { id: "#PAY-001", orderId: "#ORD-001", customer: "Alice Johnson", amount: 54.00, method: "Credit Card", status: "Completed", date: "2024-03-10" },
  { id: "#PAY-002", orderId: "#ORD-002", customer: "Bob Smith", amount: 21.00, method: "PayPal", status: "Completed", date: "2024-03-11" },
  { id: "#PAY-003", orderId: "#ORD-003", customer: "Charlie Brown", amount: 6.00, method: "Cash", status: "Pending", date: "2024-03-11" },
  { id: "#PAY-004", orderId: "#ORD-004", customer: "Diana Prince", amount: 24.00, method: "Credit Card", status: "Refunded", date: "2024-03-09" },
  { id: "#PAY-005", orderId: "#ORD-005", customer: "Evan Wright", amount: 35.00, method: "Debit Card", status: "Completed", date: "2024-03-08" },
];

const Payments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredPayments = initialPayments.filter(p => 
    p.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.orderId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-lora">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold font-dancing text-chocolate">Payments</h2>
          <p className="text-sm text-chocolate-light font-medium mt-1">
            Track all financial transactions and showroom sales.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            className="p-3 bg-white border border-chocolate/10 rounded-full text-chocolate hover:bg-strawberry/5 transition-all shadow-sm group"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
          </button>
          <button className="px-6 py-3 bg-chocolate text-white rounded-full flex items-center gap-2 shadow-bakery hover:shadow-bakery-lg hover:bg-strawberry transition-all duration-300">
            <FileDown size={18} />
            <span className="font-bold text-xs uppercase tracking-widest text-[#F5ECD7]">Download Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2rem] shadow-bakery border border-chocolate/5 flex items-center gap-6 group hover:shadow-bakery-lg transition-all duration-500">
          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 shadow-sm border border-green-200 transform rotate-3 group-hover:rotate-0 transition-transform">
            <DollarSign size={32} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-chocolate/40 uppercase tracking-widest mb-1 ml-1">Total Earnings</p>
            <h3 className="text-3xl font-bold font-playfair text-chocolate">$12,450.00</h3>
          </div>
        </div>
        
        <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2rem] shadow-bakery border border-chocolate/5 flex items-center gap-6 group hover:shadow-bakery-lg transition-all duration-500">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm border border-blue-200 transform -rotate-3 group-hover:rotate-0 transition-transform">
            <CreditCard size={32} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-chocolate/40 uppercase tracking-widest mb-1 ml-1">Transactions</p>
            <h3 className="text-3xl font-bold font-playfair text-chocolate">1,240</h3>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2rem] shadow-bakery border border-chocolate/5 flex items-center gap-6 group hover:shadow-bakery-lg transition-all duration-500">
          <div className="w-16 h-16 rounded-2xl bg-yellow-100 flex items-center justify-center text-yellow-600 shadow-sm border border-yellow-200 transform rotate-6 group-hover:rotate-0 transition-transform">
            <Clock size={32} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-chocolate/40 uppercase tracking-widest mb-1 ml-1">Pending Amount</p>
            <h3 className="text-3xl font-bold font-playfair text-chocolate">$345.00</h3>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-[2rem] shadow-bakery border border-chocolate/5">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-chocolate/30 group-focus-within:text-strawberry transition-colors w-5 h-5" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search payments by ID or customer..." 
            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-[#FAF6E6]/50 text-chocolate outline-none border border-transparent focus:border-strawberry/20 focus:bg-white focus:ring-8 focus:ring-strawberry/5 transition-all font-medium placeholder:text-chocolate/20" 
          />
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-lg rounded-[2.5rem] border border-chocolate/5 shadow-bakery overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-chocolate/5 text-chocolate/40 font-bold uppercase tracking-widest text-[10px] border-b border-chocolate/5">
                <th className="p-8">Payment ID</th>
                <th className="p-8">Order</th>
                <th className="p-8">Customer</th>
                <th className="p-8 text-center">Amount</th>
                <th className="p-8">Method</th>
                <th className="p-8">Status</th>
                <th className="p-8 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-chocolate/5">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-strawberry/5 transition-colors group">
                  <td className="p-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-chocolate/5 rounded-lg text-chocolate/40">
                        <Hash size={14} />
                      </div>
                      <span className="font-mono text-xs font-bold text-chocolate-light">{payment.id}</span>
                    </div>
                  </td>
                  <td className="p-8">
                    <span className="font-bold text-strawberry hover:underline cursor-pointer transition-all uppercase tracking-widest text-[10px]">{payment.orderId}</span>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-chocolate text-[#F5ECD7] flex items-center justify-center font-bold text-[10px]">
                        {payment.customer.charAt(0)}
                      </div>
                      <span className="font-bold text-chocolate text-sm italic">{payment.customer}</span>
                    </div>
                  </td>
                  <td className="p-8 text-center">
                    <span className="font-bold text-chocolate font-mono text-base">${payment.amount.toFixed(2)}</span>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                      <CreditCard size={14} className="text-strawberry/60" />
                      <span className="text-[11px] font-bold uppercase tracking-widest text-chocolate/60">{payment.method}</span>
                    </div>
                  </td>
                  <td className="p-8">
                     <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-sm ${
                      payment.status === "Completed" ? "bg-green-100 text-green-700 border border-green-200" :
                      payment.status === "Pending" ? "bg-yellow-100 text-yellow-700 border border-yellow-200" :
                      "bg-red-100 text-red-700 border border-red-200"
                    }`}>
                      {payment.status === "Completed" ? <Check size={10} /> :
                       payment.status === "Pending" ? <Clock size={10} /> :
                       <AlertCircle size={10} />
                      }
                      {payment.status}
                    </span>
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[11px] font-bold text-chocolate-light italic">{payment.date}</span>
                      <span className="text-[8px] uppercase tracking-widest text-chocolate/20 font-bold">Recorded</span>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-chocolate/5 rounded-full flex items-center justify-center text-chocolate/10">
                        <CreditCard size={40} />
                      </div>
                      <p className="text-chocolate-light font-medium italic">No transactions found for this search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-white/40 p-8 rounded-[2.5rem] border border-chocolate/5 flex items-center gap-6">
        <div className="p-4 bg-chocolate/5 rounded-2xl text-chocolate/40">
          <Info size={24} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-chocolate uppercase tracking-widest">Financial Transparency</h4>
          <p className="text-xs text-chocolate-light font-medium italic mt-1 leading-relaxed">
            All transaction data is encrypted and synced with the main ledger. For disputes or refunds, please visit the order management section.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Payments;
