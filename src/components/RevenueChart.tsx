import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
	{ name: "Mon", revenue: 1200, orders: 24 },
	{ name: "Tue", revenue: 1800, orders: 32 },
	{ name: "Wed", revenue: 1400, orders: 28 },
	{ name: "Thu", revenue: 2200, orders: 42 },
	{ name: "Fri", revenue: 2800, orders: 56 },
	{ name: "Sat", revenue: 3200, orders: 68 },
	{ name: "Sun", revenue: 2600, orders: 48 },
];

const RevenueChart = () => {
    return (
        <div className="bg-white rounded-2xl p-6 border border-[#D4A373]/20 shadow-sm col-span-2 group">
            <div className="flex items-center justify-between mb-6">
                <div>
					<h3 className="font-playfair text-xl font-bold text-[#1A2744]">Revenue Overview</h3>
					<p className="text-xs text-[#8D6E63] uppercase tracking-wider font-bold mt-1">Weekly sales report</p>
                </div>
                <div className="flex gap-2">
                    {["Week", "Month", "Year"].map((period) => (
                        <button
                            key={period}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                                period === "Week"
                                    ? "bg-[#1A2744] text-[#F5ECD7] shadow-md"
                                    : "bg-[#F5ECD7] text-[#1A2744] hover:bg-[#D4A373]/20"
                            }`}
                        >
                            {period}
                        </button>
                    ))}
                </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#D4A373" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#D4A373" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F5ECD7" vertical={false} />
                    <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 11, fill: "#8D6E63", fontWeight: 600, fontFamily: 'Inter' }} 
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                    />
                    <YAxis 
                        tick={{ fontSize: 11, fill: "#8D6E63", fontWeight: 600, fontFamily: 'Inter' }} 
                        axisLine={false}
                        tickLine={false}
                        dx={-10}
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid rgba(212, 163, 115, 0.3)",
                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                            fontFamily: "Inter",
                            backgroundColor: "#fff",
                            color: "#1A2744"
                        }}
                        itemStyle={{ color: "#1A2744", fontWeight: 600 }}
                        cursor={{ stroke: '#D4A373', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#D4A373"
                        strokeWidth={4}
                        fill="url(#revenueGradient)"
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RevenueChart;
