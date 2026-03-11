import { Truck, MapPin, CheckCircle, Clock, Phone, AlertTriangle } from "lucide-react";

const deliveries = [
  { id: "#DEL-001", orderId: "#ORD-001", address: "123 Main St, Springfield", driver: "Mike Ross", status: "Delivered", time: "10:30 AM" },
  { id: "#DEL-002", orderId: "#ORD-002", address: "456 Oak Ave, Metropolis", driver: "Harvey Specter", status: "Out for Delivery", time: "02:15 PM" },
  { id: "#DEL-003", orderId: "#ORD-005", address: "789 Pine Ln, Gotham", driver: "Donna Paulsen", status: "Pending", time: "-" },
];

const Delivery = () => {
    return (
        <div className="space-y-8 animate-fade-in font-lora">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold font-playfair text-[#1A2744]">Delivery Tracker <span className="inline-block animate-bounce-x">🚚</span></h2>
                    <p className="text-[#8D6E63] mt-1">Track recent orders and driver status.</p>
                </div>
                <button className="px-5 py-2.5 bg-[#D4A373] text-white rounded-full font-bold shadow-md hover:bg-[#c49265] transition-all flex items-center gap-2">
                    <Truck size={18} />
                    Manage Drivers
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#D4A373]/20">
                    <h3 className="text-xl font-bold mb-6 font-playfair text-[#1A2744] flex items-center gap-2">
                        Active Deliveries <span className="text-sm font-normal text-[#8D6E63] bg-[#F5ECD7] px-2 py-0.5 rounded-full ml-auto">3 Active</span>
                    </h3>
                    <div className="space-y-4">
                        {deliveries.map((delivery) => (
                            <div key={delivery.id} className="flex items-start gap-4 p-5 rounded-xl bg-[#F5ECD7]/20 border border-[#D4A373]/10 hover:border-[#D4A373]/30 transition-colors group">
                                <div className={`p-3 rounded-full shadow-sm border ${delivery.status === "Delivered" ? "bg-green-100 text-green-600 border-green-200" :
                                    delivery.status === "Out for Delivery" ? "bg-blue-100 text-blue-600 border-blue-200" :
                                        "bg-gray-100 text-gray-500 border-gray-200"
                                    }`}>
                                    <Truck size={20} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-[#1A2744] text-lg">{delivery.orderId}</h4>
                                        <span className="text-xs font-bold text-[#8D6E63] bg-white border border-[#D4A373]/20 px-2 py-1 rounded-full shadow-sm">
                                            {delivery.time}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[#6D4C41] flex items-center gap-1.5 mt-1 font-medium">
                                        <MapPin size={16} className="text-[#D4A373]" /> {delivery.address}
                                    </p>
                                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#D4A373]/10">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-[#1A2744] text-white flex items-center justify-center text-xs font-bold">
                                                {delivery.driver.charAt(0)}
                                            </div>
                                            <span className="text-sm font-bold text-[#1A2744]">{delivery.driver}</span>
                                        </div>
                                        <span className={`text-xs font-bold uppercase tracking-wider ${delivery.status === "Delivered" ? "text-green-600" :
                                            delivery.status === "Out for Delivery" ? "text-blue-600" :
                                                "text-gray-500"
                                            }`}>
                                            {delivery.status}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                                        <button className="text-xs font-bold text-[#D4A373] hover:underline">View Map</button>
                                        <button className="text-xs font-bold text-[#D4A373] hover:underline">Contact Driver</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#D4A373]/20">
                        <h3 className="text-xl font-bold mb-6 font-playfair text-[#1A2744]">Delivery Overview</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 rounded-xl bg-[#F5ECD7]/30 border border-[#D4A373]/10 flex flex-col items-center justify-center text-center">
                                <span className="text-4xl font-bold font-playfair text-[#1A2744] mb-1">24</span>
                                <span className="text-xs font-bold text-[#8D6E63] uppercase tracking-wide">Total Deliveries</span>
                            </div>
                             <div className="p-5 rounded-xl bg-[#F5ECD7]/30 border border-[#D4A373]/10 flex flex-col items-center justify-center text-center">
                                <span className="text-4xl font-bold font-playfair text-[#1A2744] mb-1">98%</span>
                                <span className="text-xs font-bold text-[#8D6E63] uppercase tracking-wide">On Time</span>
                            </div>
                             <div className="p-5 rounded-xl bg-[#F5ECD7]/30 border border-[#D4A373]/10 flex flex-col items-center justify-center text-center col-span-2">
                                <span className="text-4xl font-bold font-playfair text-[#1A2744] mb-1">35m</span>
                                <span className="text-xs font-bold text-[#8D6E63] uppercase tracking-wide">Avg Delivery Time</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex items-start gap-4">
                        <div className="p-2 bg-red-100 rounded-full text-red-500 shrink-0">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                             <h4 className="font-bold text-red-700 text-lg mb-1 font-playfair">Driver Shortage Alert</h4>
                             <p className="text-red-600/80 text-sm">2 drivers are currently unavailable. Deliveries may be delayed by up to 15 minutes in the Downtown area.</p>
                             <button className="mt-3 text-xs font-bold text-red-700 bg-red-100 px-3 py-1.5 rounded-full hover:bg-red-200 transition-colors">Assign Relief Driver</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Delivery;
