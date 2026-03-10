import { Search, CreditCard, DollarSign, Calendar } from "lucide-react";

const payments = [
  { id: "#PAY-001", orderId: "#ORD-001", customer: "Alice Johnson", amount: 54.00, method: "Credit Card", status: "Completed", date: "2024-03-10" },
  { id: "#PAY-002", orderId: "#ORD-002", customer: "Bob Smith", amount: 21.00, method: "PayPal", status: "Completed", date: "2024-03-11" },
  { id: "#PAY-003", orderId: "#ORD-003", customer: "Charlie Brown", amount: 6.00, method: "Cash", status: "Pending", date: "2024-03-11" },
  { id: "#PAY-004", orderId: "#ORD-004", customer: "Diana Prince", amount: 24.00, method: "Credit Card", status: "Refunded", date: "2024-03-09" },
  { id: "#PAY-005", orderId: "#ORD-005", customer: "Evan Wright", amount: 35.00, method: "Debit Card", status: "Completed", date: "2024-03-08" },
];

const Payments = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-dancing text-foreground">Payments 💳</h2>
          <p className="text-muted-foreground">Track transaction history and payment status.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-card p-6 rounded-bakery shadow-sm border border-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <h3 className="text-2xl font-bold text-foreground">$12,450.00</h3>
          </div>
        </div>
         <div className="bg-card p-6 rounded-bakery shadow-sm border border-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Transactions</p>
            <h3 className="text-2xl font-bold text-foreground">1,240</h3>
          </div>
        </div>
        <div className="bg-card p-6 rounded-bakery shadow-sm border border-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pending</p>
            <h3 className="text-2xl font-bold text-foreground">$345.00</h3>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-bakery shadow-sm border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search payments..." 
            className="w-full pl-9 pr-4 py-2 rounded-full bg-secondary text-sm outline-none focus:ring-2 focus:ring-chocolate/20 transition-all"
          />
        </div>
      </div>

      <div className="bakery-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary/50 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="p-4 pl-6">ID</th>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Method</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right pr-6">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="p-4 pl-6 font-mono text-xs text-muted-foreground">{payment.id}</td>
                  <td className="p-4 font-medium text-chocolate">{payment.orderId}</td>
                  <td className="p-4 text-foreground">{payment.customer}</td>
                  <td className="p-4 font-bold text-foreground">${payment.amount.toFixed(2)}</td>
                  <td className="p-4 text-sm text-muted-foreground">{payment.method}</td>
                  <td className="p-4">
                     <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      payment.status === "Completed" ? "bg-green-100 text-green-700" :
                      payment.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="p-4 text-right text-sm text-muted-foreground pr-6">{payment.date}</td>
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
