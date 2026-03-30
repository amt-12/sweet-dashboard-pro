import { Truck, MapPin, CheckCircle, Clock, Phone, AlertTriangle, RefreshCw, Navigation, User, ChevronRight, Hash, Sparkles } from "lucide-react";
import { useState } from "react";

const initialDeliveries = [
  { id: "#DEL-001", orderId: "#ORD-001", address: "123 Main St, Springfield", driver: "Mike Ross", status: "Delivered", time: "10:30 AM" },
  { id: "#DEL-002", orderId: "#ORD-002", address: "456 Oak Ave, Metropolis", driver: "Harvey Specter", status: "En Route", time: "02:15 PM" },
  { id: "#DEL-003", orderId: "#ORD-005", address: "789 Pine Ln, Gotham", driver: "Donna Paulsen", status: "Scheduled", time: "Pending" },
];

const Delivery = () => {
    const [loading, setLoading] = useState(false);

    return (
        <div className="space-y-10 animate-in fade-in duration-700 font-lora pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-bold font-dancing text-chocolate">Deliveries</h2>
                    <p className="text-sm text-chocolate-light font-medium mt-1">
                        Track your artisanal creations as they make their way to your patrons.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        className="p-3 bg-white border border-chocolate/10 rounded-full text-chocolate hover:bg-strawberry/5 transition-all shadow-sm group"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
                    </button>
                    <button className="px-6 py-3 bg-chocolate text-white rounded-full flex items-center gap-2 shadow-bakery hover:shadow-bakery-lg hover:bg-strawberry transition-all duration-300">
                        <User size={18} />
                        <span className="font-bold text-xs uppercase tracking-widest text-[#F5ECD7]">Manage Drivers</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-7 bg-white/60 backdrop-blur-md p-10 rounded-[2.5rem] shadow-bakery border border-chocolate/5 flex flex-col">
                    <div className="flex items-center justify-between mb-10 border-b border-chocolate/5 pb-6">
                        <h3 className="text-2xl font-bold font-playfair text-chocolate flex items-center gap-3">
                            <Navigation className="text-strawberry rotate-45" size={24} />
                            Active Tracking
                        </h3>
                        <span className="px-4 py-1.5 bg-chocolate text-white rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                            {initialDeliveries.length} Packages
                        </span>
                    </div>

                    <div className="space-y-8">
                        {initialDeliveries.map((delivery) => (
                            <div key={delivery.id} className="group relative flex items-start gap-6 p-8 rounded-[2rem] bg-white border border-chocolate/5 hover:border-strawberry/20 hover:shadow-bakery-lg transition-all duration-500">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-strawberry/5 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-strawberry/10" />
                                
                                <div className={`p-4 rounded-2xl shadow-sm border transform -rotate-3 group-hover:rotate-0 transition-transform duration-500 ${
                                    delivery.status === "Delivered" ? "bg-green-50 text-green-600 border-green-100" :
                                    delivery.status === "En Route" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                    "bg-chocolate/5 text-chocolate/40 border-chocolate/5"
                                }`}>
                                    <Truck size={24} />
                                </div>

                                <div className="flex-1 space-y-4 relative z-10">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Hash size={12} className="text-strawberry/40" />
                                                <span className="text-[10px] font-mono font-bold text-chocolate/30 uppercase tracking-widest">{delivery.orderId}</span>
                                            </div>
                                            <h4 className="text-xl font-bold text-chocolate group-hover:text-strawberry transition-colors italic leading-tight">{delivery.address}</h4>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-[9px] font-bold text-chocolate/40 uppercase tracking-widest">Expected Time</span>
                                            <span className="text-xs font-bold text-chocolate italic bg-chocolate/5 px-3 py-1 rounded-full">{delivery.time}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-chocolate/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-chocolate text-white flex items-center justify-center font-bold text-[10px] shadow-sm transform -rotate-6">
                                                {delivery.driver.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-bold text-chocolate/20 uppercase tracking-widest">Courier</span>
                                                <span className="text-xs font-bold text-chocolate italic">{delivery.driver}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border shadow-sm ${
                                                delivery.status === "Delivered" ? "bg-green-50 text-green-700 border-green-100" :
                                                delivery.status === "En Route" ? "bg-blue-50 text-blue-700 border-blue-100" :
                                                "bg-chocolate/5 text-chocolate/40 border-chocolate/10"
                                            }`}>
                                                {delivery.status}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-4 pt-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-300">
                                        <button className="text-[9px] font-bold text-strawberry uppercase tracking-widest flex items-center gap-1.5 hover:underline decoration-2 underline-offset-4">
                                            <Navigation size={12} /> View Map
                                        </button>
                                        <button className="text-[9px] font-bold text-chocolate-light uppercase tracking-widest flex items-center gap-1.5 hover:underline decoration-2 underline-offset-4">
                                            <Phone size={12} /> Contact Driver
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-5 space-y-10">
                    <div className="bg-white/60 backdrop-blur-md p-10 rounded-[2.5rem] shadow-bakery border border-chocolate/5">
                        <div className="flex items-center gap-4 mb-10 border-b border-chocolate/5 pb-6">
                            <div className="w-12 h-12 bg-chocolate text-white rounded-2xl flex items-center justify-center shadow-bakery transform rotate-3">
                                <Sparkles size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold font-playfair text-chocolate">Performance</h3>
                                <p className="text-[10px] text-chocolate/40 font-bold uppercase tracking-widest">Real-time statistics</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-8 rounded-[2rem] bg-white border border-chocolate/5 shadow-sm group hover:shadow-bakery transition-all duration-500">
                                <span className="text-[9px] font-bold text-chocolate/30 uppercase tracking-widest mb-2 block">Grand Total</span>
                                <div className="flex items-baseline gap-2">
                                    <h4 className="text-4xl font-bold font-playfair text-chocolate group-hover:text-strawberry transition-colors">24</h4>
                                    <span className="text-[10px] text-green-600 font-bold uppercase tracking-widest">+12%</span>
                                </div>
                                <p className="text-[9px] text-chocolate/20 font-bold uppercase tracking-widest mt-2 italic">Successful deliveries</p>
                            </div>
                             <div className="p-8 rounded-[2rem] bg-white border border-chocolate/5 shadow-sm group hover:shadow-bakery transition-all duration-500">
                                <span className="text-[9px] font-bold text-chocolate/30 uppercase tracking-widest mb-2 block">Punctuality</span>
                                <div className="flex items-baseline gap-2">
                                    <h4 className="text-4xl font-bold font-playfair text-chocolate group-hover:text-strawberry transition-colors">98%</h4>
                                </div>
                                <p className="text-[9px] text-chocolate/20 font-bold uppercase tracking-widest mt-2 italic">Precise on-time rate</p>
                            </div>
                             <div className="p-8 rounded-[2rem] bg-chocolate text-[#F5ECD7] shadow-bakery group hover:bg-strawberry transition-all duration-500 col-span-2 relative overflow-hidden">
                                <Clock size={40} className="absolute right-6 top-6 opacity-10 group-hover:rotate-12 transition-transform" />
                                <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest mb-2 block">Avg Wait</span>
                                <h4 className="text-5xl font-bold font-playfair">35m</h4>
                                <p className="text-[9px] font-bold uppercase tracking-widest mt-3 italic opacity-60">Journey starts to finish</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-strawberry/5 p-10 rounded-[2.5rem] border border-strawberry/20 flex flex-col gap-6 shadow-bakery relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-strawberry/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                        
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="p-4 bg-white rounded-2xl text-strawberry shadow-sm transform -rotate-3">
                                <AlertTriangle size={32} />
                            </div>
                            <div>
                                 <h4 className="font-bold text-chocolate text-xl font-playfair group-hover:text-strawberry transition-colors">Logistical Alert</h4>
                                 <p className="text-[10px] font-bold text-strawberry uppercase tracking-widest italic mt-1">Resource constraints detected</p>
                            </div>
                        </div>
                        <p className="text-sm text-chocolate-light font-medium italic leading-relaxed relative z-10 px-2">
                            Two couriers are currently away. Deliveries in the <span className="font-bold text-chocolate">Downtown Precinct</span> may experience minor delays of 10-15 minutes.
                        </p>
                        <button className="w-full py-4 bg-white text-strawberry rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm hover:bg-strawberry hover:text-white transition-all relative z-10 border border-strawberry/10 active:scale-95">
                            Request Secondary Courier
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Delivery;
