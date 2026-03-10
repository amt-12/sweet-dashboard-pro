import { BarChart, Activity, TrendingUp, Users } from "lucide-react";
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
		<div className="space-y-6 animate-fade-in">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h2 className="text-2xl font-bold font-dancing text-foreground">
						Analytics 📊
					</h2>
					<p className="text-muted-foreground">
						Insights into your bakery's performance.
					</p>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Revenue
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">$45,231.89</div>
						<p className="text-xs text-muted-foreground">
							+20.1% from last month
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Subscriptions
						</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">+2350</div>
						<p className="text-xs text-muted-foreground">
							+180.1% from last month
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Sales</CardTitle>
						<BarChart className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">+12,234</div>
						<p className="text-xs text-muted-foreground">
							+19% from last month
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Now</CardTitle>
						<Activity className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">+573</div>
						<p className="text-xs text-muted-foreground">
							+201 since last hour
						</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
				<Card className="col-span-4">
					<CardHeader>
						<CardTitle>Overview</CardTitle>
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
									contentStyle={{
										borderRadius: "8px",
										border: "none",
										boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
									}}
								/>
								<Bar
									dataKey="sales"
									fill="#8B4513"
									radius={[4, 4, 0, 0]}
								/>
							</RechartsBarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
				<Card className="col-span-3">
					<CardHeader>
						<CardTitle>Visitor Growth</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={350}>
							<AreaChart data={data}>
								<XAxis
									dataKey="name"
									stroke="#888888"
									fontSize={12}
									tickLine={false}
									axisLine={false}
								/>
								<Tooltip />
								<Area
									type="monotone"
									dataKey="visitors"
									stroke="#D2691E"
									fill="#FFE4B5"
								/>
							</AreaChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default Analytics;
