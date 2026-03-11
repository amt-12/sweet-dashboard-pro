import { BarChart, Activity, TrendingUp, Users, PieChart as PieIcon, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart as RechartsBarChart } from "recharts";

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
    return (
        <div className="space-y-8 animate-fade-in font-lora">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold font-playfair text-[#1A2744]">
                        Bakery Analytics <span className="inline-block hover:rotate-12 transition-transform">📈</span>
                    </h2>
                    <p className="text-[#8D6E63] mt-1">
                        Deep improvements and sales insights.
                    </p>
                </div>
                 <div className="flex gap-2">
                     <select className="px-4 py-2 bg-white border border-[#D4A373]/30 rounded-full text-sm text-[#8D6E63] outline-none focus:border-[#D4A373]">
                         <option>Last 7 Days</option>
                         <option>Last 30 Days</option>
                         <option>This Month</option>
                     </select>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { title: "Total Revenue", value: "$45,231.89", trend: "+20.1%", icon: TrendingUp, color: "text-green-600" },
                    { title: "Active Customers", value: "2,350", trend: "+15.2%", icon: Users, color: "text-[#D4A373]" },
                    { title: "Total Sales", value: "12,234", trend: "+19%", icon: BarChart, color: "text-[#8D6E63]" },
                    { title: "Avg. Order Value", value: "$45.20", trend: "+5.4%", icon: PieIcon, color: "text-[#1A2744]" },
                ].map((stat, i) => (
                    <Card key={i} className="border-[#D4A373]/20 shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-[#F5ECD7]/10">
                            <CardTitle className="text-sm font-bold text-[#8D6E63] uppercase tracking-wider">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="text-2xl font-bold font-playfair text-[#1A2744]">{stat.value}</div>
                            <p className="text-xs text-green-600 font-bold flex items-center mt-1">
                                <ArrowUpRight size={12} className="mr-1" />
                                {stat.trend} from last month
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-[#D4A373]/20 shadow-sm bg-white">
                    <CardHeader>
                        <CardTitle className="font-playfair text-xl text-[#1A2744]">Revenue Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <RechartsBarChart data={data}>
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip 
                                    cursor={{fill: '#F5ECD7', opacity: 0.4}}
                                    contentStyle={{ background: '#fff', border: '1px solid #D4A373', borderRadius: '8px' }}
                                />
                                <Bar dataKey="sales" fill="#D4A373" radius={[4, 4, 0, 0]} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                {/* Add more cards using the new style if needed, or keep existing structure but apply classes */}
                <Card className="col-span-3 border-[#D4A373]/20 shadow-sm bg-white">
					<CardHeader>
						<CardTitle className="font-playfair text-xl text-[#1A2744]">Traffic Sources</CardTitle>
					</CardHeader>
					<CardContent>
                         <div className="h-[350px] flex items-center justify-center text-[#8D6E63] text-sm">
                             Chart Placeholder (Traffic)
                         </div>
					</CardContent>
				</Card>
            </div>
        </div>
    );
};

export default Analytics;
