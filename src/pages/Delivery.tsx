import { Truck, MapPin, CheckCircle, Clock } from "lucide-react";

const deliveries = [
  { id: "#DEL-001", orderId: "#ORD-001", address: "123 Main St, Springfield", driver: "Mike Ross", status: "Delivered", time: "10:30 AM" },
  { id: "#DEL-002", orderId: "#ORD-002", address: "456 Oak Ave, Metropolis", driver: "Harvey Specter", status: "Out for Delivery", time: "02:15 PM" },
  { id: "#DEL-003", orderId: "#ORD-005", address: "789 Pine Ln, Gotham", driver: "Donna Paulsen", status: "Pending", time: "-" },
];

const Delivery = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-dancing text-foreground">Delivery Management 🚚</h2>
          <p className="text-muted-foreground">Track order deliveries and drivers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-bakery shadow-sm border border-border">
          <h3 className="text-lg font-bold mb-4 font-dancing">Active Deliveries</h3>
          <div className="space-y-4">
            {deliveries.map((delivery) => (
              <div key={delivery.id} className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30 border border-border">
                <div className={`p-3 rounded-full ${
                  delivery.status === "Delivered" ? "bg-green-100 text-green-600" :
                  delivery.status === "Out for Delivery" ? "bg-blue-100 text-blue-600 animate-pulse" :
                  "bg-gray-100 text-gray-500"
                }`}>
                  <Truck size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-foreground">{delivery.orderId}</h4>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">{delivery.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin size={14} /> {delivery.address}
                  </p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm font-medium text-chocolate">Driver: {delivery.driver}</span>
                    <span className={`text-xs font-bold ${
                      delivery.status === "Delivered" ? "text-green-600" :
                      delivery.status === "Out for Delivery" ? "text-blue-600" :
                      "text-gray-500"
                    }`}>
                      {delivery.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card p-6 rounded-bakery shadow-sm border border-border">
             <h3 className="text-lg font-bold mb-4 font-dancing">Delivery Stats</h3>
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-muted-foreground text-sm">Total Deliveries Today</p>
                        <h4 className="text-2xl font-bold">24</h4>
                    </div>
                    <div className="p-3 bg-secondary rounded-full text-foreground"><CheckCircle /></div>
                </div>
                 <div className="flex items-center justify-between">
                    <div>
                        <p className="text-muted-foreground text-sm">Average Delivery Time</p>
                        <h4 className="text-2xl font-bold">35 mins</h4>
                    </div>
                    <div className="p-3 bg-secondary rounded-full text-foreground"><Clock /></div>
                </div>
             </div>
             
             <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm font-medium">⚠️ 2 drivers are currently unavailable.</p>
             </div>
        </div>
      </div>
    </div>
  );
};

export default Delivery;
