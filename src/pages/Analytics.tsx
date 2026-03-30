import { BarChart, Activity, TrendingUp, Users, PieChart as PieIcon, ArrowUpRight, Calendar, Sparkles, RefreshCw, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart as RechartsBarChart, CartesianGrid } from "recharts";
import { useState } from "react";

const data = [
	{ name: "Mon", sales: 4000, visitors: 2400 },
	{ name: "Tue", sales: 3000, visitors: 1398 },
	{ name: "Wed", sales: 2000, visitors: 9800 },
	{ name: "Thu", sales: 2780, visitors: 3908 },
	{ name: "Fri", sales: 1890, visitors: 4800 },
	{ name: "Sat", sales: 2390, visitors: 3800 },
	{ name: "Sun", sales: 3490, visitors: 4300 },
];

const Analytics = () => {
    const [loading, setLoading] = useState(false);

    return (
        <div className="space-y-10 animate-in fade-in duration-700 font-lora pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-bold font-dancing text-chocolate">Insights</h2>
                    <p className="text-sm text-chocolate-light font-medium mt-1">
                        A detailed look at your bakery's growth and sales trends.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/30 group-focus-within:text-strawberry transition-colors" />
                        <select className="pl-12 pr-10 py-3 bg-white border border-chocolate/5 rounded-full text-xs font-bold text-chocolate outline-none focus:ring-8 focus:ring-strawberry/5 focus:border-strawberry/20 appearance-none shadow-sm transition-all uppercase tracking-widest cursor-pointer">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                            <option>This Month</option>
                        </select>
                    </div>
                    <button className="p-3 bg-white border border-chocolate/10 rounded-full text-chocolate hover:bg-strawberry/5 transition-all shadow-sm group">
                        <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                    </button>
                    <button className="px-6 py-3 bg-chocolate text-white rounded-full flex items-center gap-2 shadow-bakery hover:shadow-bakery-lg hover:bg-strawberry transition-all duration-300">
                        <Download size={18} />
                        <span className="font-bold text-xs uppercase tracking-widest text-[#F5ECD7]">Report</span>
                    </button>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { title: "Total Earnings", value: "$45,231.89", trend: "+20.1%", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
                    { title: "Our Patrons", value: "2,350", trend: "+15.2%", icon: Users, color: "text-chocolate", bg: "bg-[#F5ECD7]/50" },
                    { title: "Orders Placed", value: "12,234", trend: "+19%", icon: BarChart, color: "text-strawberry", bg: "bg-strawberry/10" },
                    { title: "Average Sale", value: "$45.20", trend: "+5.4%", icon: PieIcon, color: "text-blue-600", bg: "bg-blue-50" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white/60 backdrop-blur-md rounded-[2rem] p-8 border border-chocolate/5 shadow-bakery hover:shadow-bakery-lg transition-all duration-500 group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-chocolate/5 to-transparent rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-strawberry/5 transition-all" />
                        
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} shadow-sm transform rotate-3 group-hover:rotate-0 transition-transform duration-500`}>
                                <stat.icon size={28} />
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-[10px] font-bold shadow-sm">
                                <ArrowUpRight size={12} />
                                {stat.trend}
                            </div>
                        </div>
                        
                        <div className="relative z-10">
                            <p className="text-[10px] font-bold text-chocolate/30 uppercase tracking-[0.2em] mb-1 ml-1">{stat.title}</p>
                            <h3 className="text-3xl font-bold font-playfair text-chocolate group-hover:text-strawberry transition-colors">{stat.value}</h3>
                            <p className="text-[9px] font-bold text-chocolate/20 uppercase tracking-widest mt-2 italic flex items-center gap-1.5">
                                <Sparkles size={10} className="text-strawberry/40" />
                                Growth compared to last month
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-8 bg-white/80 backdrop-blur-lg rounded-[2.5rem] p-10 border border-chocolate/5 shadow-bakery space-y-8">
                    <div className="flex items-center justify-between border-b border-chocolate/5 pb-8">
                        <div>
                            <h3 className="text-2xl font-bold font-playfair text-chocolate">Revenue Overview</h3>
                            <p className="text-[10px] font-bold text-chocolate/40 uppercase tracking-widest mt-1 italic">Weekly performance visualization</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-chocolate rounded-full shadow-sm" />
                                <span className="text-[10px] font-bold text-chocolate/40 uppercase tracking-widest">Earnings</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-strawberry rounded-full shadow-sm" />
                                <span className="text-[10px] font-bold text-chocolate/40 uppercase tracking-widest">Visitors</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="h-[400px] w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#chocolate" strokeOpacity={0.05} />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#8D6E63', fontSize: 10, fontWeight: 700 }}
                                    dy={15}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#8D6E63', fontSize: 10, fontWeight: 700 }}
                                    tickFormatter={(value) => `$${value/1000}k`}
                                />
                                <Tooltip 
                                    cursor={{fill: '#F5ECD7', opacity: 0.3}}
                                    contentStyle={{ 
                                        background: 'rgba(255,255,255,0.9)', 
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(212,163,115,0.1)', 
                                        borderRadius: '20px',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
                                    }}
                                    itemStyle={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}
                                />
                                <Bar dataKey="sales" fill="#D4A373" radius={[10, 10, 0, 0]} barSize={40} />
                                <Bar dataKey="visitors" fill="#EA9191" radius={[10, 10, 0, 0]} barSize={40} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-8">
                    <div className="bg-white/80 backdrop-blur-lg rounded-[2.5rem] p-10 border border-chocolate/5 shadow-bakery flex-1 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-strawberry/5 rounded-full -mr-24 -mt-24 blur-3xl" />
                        
                        <div className="relative z-10 space-y-8">
                            <div>
                                <h3 className="text-2xl font-bold font-playfair text-chocolate">Top Categories</h3>
                                <p className="text-[10px] font-bold text-chocolate/40 uppercase tracking-widest mt-1 italic">Best performing artistic styles</p>
                            </div>
                            
                            <div className="space-y-6">
                                {[
                                    { name: "Wedding Cakes", value: 85, color: "bg-chocolate" },
                                    { name: "Birthday Specials", value: 65, color: "bg-strawberry" },
                                    { name: "Artisanal Breads", value: 45, color: "bg-[#8D6E63]" },
                                    { name: "Petite Pastries", value: 30, color: "bg-[#A68A7C]" },
                                ].map((cat, i) => (
                                    <div key={i} className="space-y-2 group">
                                        <div className="flex justify-between items-center px-1">
                                            <span className="text-xs font-bold text-chocolate">{cat.name}</span>
                                            <span className="text-[10px] font-bold text-chocolate/40 uppercase tracking-widest">{cat.value}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-chocolate/5 rounded-full overflow-hidden border border-chocolate/5">
                                            <div 
                                                className={`h-full ${cat.color} rounded-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-out`} 
                                                style={{ width: `${cat.value}%`, transform: `translateX(0)` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="p-6 bg-chocolate/5 rounded-2xl border border-chocolate/5">
                                <div className="flex items-center gap-3 text-chocolate mb-2">
                                    <Activity size={18} className="text-strawberry" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Real-time Trend</span>
                                </div>
                                <p className="text-[10px] text-chocolate-light font-medium italic leading-relaxed">
                                    "Wedding Cakes" have seen a significant spike in interest over the last 48 hours. Consider featuring them on your homepage.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
