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
		<div className="bakery-card col-span-2 animate-fade-in" style={{ animationDelay: "200ms" }}>
			<div className="flex items-center justify-between mb-6">
				<div>
					<h3 className="font-dancing text-lg font-bold text-foreground">Revenue Overview 📈</h3>
					<p className="text-sm text-muted-foreground">Weekly bakery sales</p>
				</div>
				<div className="flex gap-2">
					{["Week", "Month", "Year"].map((period) => (
						<button
							key={period}
							className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
								period === "Week"
									? "bg-primary text-primary-foreground"
									: "bg-secondary text-secondary-foreground hover:bg-primary/10"
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
							<stop offset="5%" stopColor="hsl(340, 60%, 65%)" stopOpacity={0.3} />
							<stop offset="95%" stopColor="hsl(340, 60%, 65%)" stopOpacity={0} />
						</linearGradient>
					</defs>
					<CartesianGrid strokeDasharray="3 3" stroke="hsl(30, 30%, 90%)" />
					<XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(20, 15%, 50%)" }} />
					<YAxis tick={{ fontSize: 12, fill: "hsl(20, 15%, 50%)" }} />
					<Tooltip
						contentStyle={{
							borderRadius: "1rem",
							border: "1px solid hsl(30, 30%, 88%)",
							boxShadow: "0 8px 32px -8px hsl(20 30% 50% / 0.12)",
							fontFamily: "Nunito",
						}}
					/>
					<Area
						type="monotone"
						dataKey="revenue"
						stroke="hsl(340, 60%, 65%)"
						strokeWidth={3}
						fill="url(#revenueGradient)"
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
};

export default RevenueChart;
