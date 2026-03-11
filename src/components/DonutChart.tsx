import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
	{ name: "Cakes", value: 35 },
	{ name: "Pastries", value: 25 },
	{ name: "Cookies", value: 20 },
	{ name: "Bread", value: 15 },
	{ name: "Donuts", value: 5 },
];

const COLORS = [
	"#D4A373", // Gold/Caramel
	"#1A2744", // Navy
	"#8D6E63", // Brown
	"#E5E7EB", // Light Gray
	"#FCD34D", // Accent Yellow
];

const DonutChart = () => {
	return (
		<div className="bg-white rounded-2xl p-6 border border-[#D4A373]/20 shadow-sm flex flex-col h-[350px]">
			<div className="mb-4">
				<h3 className="font-playfair text-xl font-bold text-[#1A2744]">
					Sales by Category
				</h3>
				<p className="text-xs text-[#8D6E63] uppercase tracking-wider font-bold mt-1">
					Top categories
				</p>
			</div>

			<div className="flex-1 min-h-0 relative">
				<ResponsiveContainer width="100%" height="100%">
					<PieChart>
						<Pie
							data={data}
							cx="50%"
							cy="50%"
							innerRadius={60}
							outerRadius={90}
							paddingAngle={5}
							dataKey="value"
							strokeWidth={0}
							cornerRadius={4}
						>
							{data.map((_, index) => (
								<Cell
									key={`cell-${index}`}
									fill={COLORS[index % COLORS.length]}
								/>
							))}
						</Pie>
						<Tooltip
							contentStyle={{
								borderRadius: "12px",
								border: "1px solid rgba(212, 163, 115, 0.3)",
								fontFamily: "Inter",
								backgroundColor: "#fff",
								color: "#1A2744",
								boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
							}}
							itemStyle={{ color: "#1A2744", fontWeight: 600 }}
						/>
					</PieChart>
				</ResponsiveContainer>
				{/* Center Text */}
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
					<span className="block text-2xl font-bold font-playfair text-[#1A2744] leading-none">
						100%
					</span>
					<span className="text-[10px] text-[#8D6E63] font-bold uppercase tracking-wider">
						Total
					</span>
				</div>
			</div>

			<div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
				{data.slice(0, 3).map((item, i) => (
					<div key={item.name} className="flex items-center gap-1.5">
						<span
							className="w-2 h-2 rounded-full"
							style={{ background: COLORS[i] }}
						/>
						<span className="text-xs font-medium text-[#1A2744]">
							{item.name}
						</span>
					</div>
				))}
			</div>
		</div>
	);
};

export default DonutChart;
