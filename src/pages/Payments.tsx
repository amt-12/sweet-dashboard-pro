import { Search, CreditCard, DollarSign, Calendar, TrendingUp, Check, Clock, AlertCircle } from "lucide-react";

const payments = [
  { id: "#PAY-001", orderId: "#ORD-001", customer: "Alice Johnson", amount: 54.00, method: "Credit Card", status: "Completed", date: "2024-03-10" },
  { id: "#PAY-002", orderId: "#ORD-002", customer: "Bob Smith", amount: 21.00, method: "PayPal", status: "Completed", date: "2024-03-11" },
  { id: "#PAY-003", orderId: "#ORD-003", customer: "Charlie Brown", amount: 6.00, method: "Cash", status: "Pending", date: "2024-03-11" },
  { id: "#PAY-004", orderId: "#ORD-004", customer: "Diana Prince", amount: 24.00, method: "Credit Card", status: "Refunded", date: "2024-03-09" },
  { id: "#PAY-005", orderId: "#ORD-005", customer: "Evan Wright", amount: 35.00, method: "Debit Card", status: "Completed", date: "2024-03-08" },
];

const Payments = () => {
  return (
    <div className="space-y-8 animate-fade-in font-lora">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-playfair text-[#1A2744]">Transactions <span className="inline-block animate-pulse">💳</span></h2>
          <p className="text-[#8D6E63] mt-1">Track transaction history and payment status.</p>
        </div>
        <button className="px-5 py-2.5 bg-[#D4A373] text-white rounded-full font-bold shadow-md hover:bg-[#c49265] transition-all flex items-center gap-2">
            <DollarSign size={18} />
            Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#D4A373]/20 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-full bg-green-100/50 flex items-center justify-center text-green-600 shadow-sm border border-green-200">
            <DollarSign size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-[#8D6E63] uppercase tracking-wide">Total Revenue</p>
            <h3 className="text-3xl font-bold font-playfair text-[#1A2744]">$12,450.00</h3>
          </div>
        </div>
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#D4A373]/20 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-full bg-blue-100/50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-200">
            <CreditCard size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-[#8D6E63] uppercase tracking-wide">Transactions</p>
            <h3 className="text-3xl font-bold font-playfair text-[#1A2744]">1,240</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#D4A373]/20 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-full bg-yellow-100/50 flex items-center justify-center text-yellow-600 shadow-sm border border-yellow-200">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-[#8D6E63] uppercase tracking-wide">Pending</p>
            <h3 className="text-3xl font-bold font-playfair text-[#1A2744]">$345.00</h3>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-[#D4A373]/20">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4A373] w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search payments by ID, customer, or amount..." 
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#F5ECD7]/30 text-[#1A2744] outline-none focus:ring-2 focus:ring-[#D4A373]/50 transition-all placeholder:text-[#8D6E63]/60"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#D4A373]/20 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F5ECD7]/30 text-[#8D6E63] font-bold uppercase tracking-wider text-xs border-b border-[#D4A373]/20">
              <tr>
                <th className="p-5 pl-6">ID</th>
                <th className="p-5">Order ID</th>
                <th className="p-5">Customer</th>
                <th className="p-5">Amount</th>
                <th className="p-5">Method</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right pr-6">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4A373]/10">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-[#F5ECD7]/20 transition-colors group">
                  <td className="p-5 pl-6 font-mono text-xs font-bold text-[#8D6E63]">{payment.id}</td>
                  <td className="p-5 font-bold text-[#D4A373] hover:underline cursor-pointer">{payment.orderId}</td>
                  <td className="p-5 font-medium text-[#1A2744]">{payment.customer}</td>
                  <td className="p-5 font-bold text-[#1A2744] font-mono">${payment.amount.toFixed(2)}</td>
                  <td className="p-5 text-sm text-[#6D4C41] flex items-center gap-2">
                      <CreditCard size={14} className="text-[#D4A373]" />
                      {payment.method}
                  </td>
                  <td className="p-5">
                     <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border ${
                      payment.status === "Completed" ? "bg-green-100/50 text-green-700 border-green-200" :
                      payment.status === "Pending" ? "bg-yellow-100/50 text-yellow-700 border-yellow-200" :
                      "bg-red-100/50 text-red-700 border-red-200"
                    }`}>
                      {payment.status === "Completed" ? <Check size={12} /> :
                       payment.status === "Pending" ? <Clock size={12} /> :
                       <AlertCircle size={12} />
                      }
                      {payment.status}
                    </span>
                  </td>
                  <td className="p-5 text-right text-sm text-[#8D6E63] pr-6 font-mono">{payment.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;
