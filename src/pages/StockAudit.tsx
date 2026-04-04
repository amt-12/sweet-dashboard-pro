import { Search, Package, Calendar, User, Info, ArrowRight, History } from "lucide-react";
import { useEffect, useState } from "react";
import axiosInstance from "../services/api";

interface StockLog {
    _id: string;
    productId: string;
    productName: string;
    variantWeight: string;
    oldStock: number;
    newStock: number;
    difference: number;
    reason: string;
    adjustedBy: string;
    timestamp: string;
}

const StockAudit = () => {
    const [logs, setLogs] = useState<StockLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("All");

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(`/stock-adjustments?search=${search}`);
            setLogs(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch audit logs:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [search]);

    const filteredLogs = logs.filter(log => {
        if (activeTab === "All") return true;
        if (activeTab === "Manually Delivered") return log.reason === "Manually Delivered";
        if (activeTab === "Other") return log.reason !== "Manually Delivered";
        return true;
    });

    return (
        <div className="space-y-8 p-8 min-h-screen bg-[#FAFBFD] font-lora pb-32">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-bold font-dancing text-chocolate">
                        Inventory Audit Trail{" "}
                        <span className="inline-block animate-pulse text-strawberry text-2xl">📋</span>
                    </h2>
                    <p className="text-sm text-chocolate-light font-medium mt-1">
                        A detailed history of all manual variant stock adjustments and their reasons.
                    </p>
                </div>
                <div className="hidden md:flex px-5 py-2.5 rounded-2xl bg-white border border-chocolate/10 text-sm font-bold text-chocolate items-center gap-2 shadow-bakery">
                    <History size={16} className="text-strawberry" />
                    {filteredLogs.length} Records Found
                </div>
            </div>

            {/* View Filter Tabs */}
            <div className="flex flex-wrap items-center gap-3 bg-white/40 p-2 rounded-[2rem] border border-chocolate/5 w-fit">
                {["All", "Manually Delivered", "Other"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                            activeTab === tab 
                                ? "bg-chocolate text-white shadow-bakery-lg scale-105" 
                                : "bg-white text-chocolate/40 hover:text-chocolate border border-chocolate/5 hover:border-strawberry/20"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Search Filter */}
            <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-3xl shadow-bakery border border-chocolate/5">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/30 group-focus-within:text-strawberry transition-colors w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by product name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-transparent focus:border-strawberry/20 focus:bg-white text-sm text-chocolate placeholder:text-chocolate/30 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Audit Table */}
            <div className="bg-white rounded-[2rem] border border-chocolate/5 shadow-bakery overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-chocolate/[0.02] text-chocolate/40 font-bold uppercase tracking-widest text-[10px] border-b border-chocolate/5">
                            <tr>
                                <th className="p-6">Timestamp & Admin</th>
                                <th className="p-6">Product Details</th>
                                <th className="p-6">Adjustment</th>
                                <th className="p-6">Stock Bridge</th>
                                <th className="p-6">Reason for Deduction</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-chocolate/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 border-4 border-chocolate/10 border-t-chocolate rounded-full animate-spin" />
                                            <span className="text-xs font-bold text-chocolate/40 uppercase tracking-widest">Loading entry history...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-32 text-center">
                                        <div className="w-20 h-20 bg-cream/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Package size={32} className="text-chocolate/10" />
                                        </div>
                                        <p className="text-sm font-bold text-chocolate/40 uppercase tracking-widest">No matching audit logs found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log._id} className="hover:bg-cream/10 transition-colors group">
                                        <td className="p-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-xs font-black text-chocolate tracking-tighter">
                                                    <Calendar size={12} className="text-strawberry/50" />
                                                    {new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-chocolate-light uppercase tracking-widest opacity-60">
                                                    <User size={10} /> {log.adjustedBy}
                                                </div>
                                                <div className="text-[10px] text-chocolate/20">
                                                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 text-chocolate">
                                            <div className="font-black text-sm tracking-tight">{log.productName}</div>
                                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-strawberry/70 mt-1">
                                                {log.variantWeight} Variant
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${log.difference < 0 ? 'bg-red-50 text-red-500 shadow-sm border border-red-100' : 'bg-green-50 text-green-500 shadow-sm border border-green-100'}`}>
                                                {log.difference > 0 ? '+' : ''}{log.difference} Units
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2 font-black tabular-nums">
                                                <span className="text-chocolate/30 text-sm line-through">{log.oldStock}</span>
                                                <ArrowRight size={14} className="text-strawberry/40" />
                                                <span className="text-lg text-chocolate">{log.newStock}</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="relative group/reason max-w-xs">
                                                <div className="flex items-start gap-2 bg-white border border-chocolate/10 p-3 rounded-2xl shadow-sm hover:border-strawberry/30 transition-all">
                                                    <Info size={14} className="text-strawberry/40 mt-0.5 shrink-0" />
                                                    <p className="text-xs font-semibold text-chocolate leading-relaxed">
                                                        "{log.reason}"
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StockAudit;
