import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Cakes", value: 35 },
  { name: "Pastries", value: 25 },
  { name: "Cookies", value: 20 },
  { name: "Bread", value: 15 },
  { name: "Donuts", value: 5 },
];

const COLORS = [
  "hsl(340, 60%, 65%)",  // strawberry
  "hsl(30, 70%, 55%)",   // caramel
  "hsl(45, 80%, 65%)",   // vanilla
  "hsl(20, 50%, 40%)",   // chocolate
  "hsl(160, 40%, 65%)",  // mint
];

const DonutChart = () => {
  return (
    <div className="bakery-card animate-fade-in" style={{ animationDelay: "300ms" }}>
      <h3 className="font-fredoka text-lg font-bold text-foreground mb-1">Sales by Category 🍩</h3>
      <p className="text-sm text-muted-foreground mb-4">This looks like a donut, right?</p>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: "1rem",
              border: "1px solid hsl(30, 30%, 88%)",
              fontFamily: "Nunito",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-3 mt-2">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-center gap-1.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
            <span className="text-muted-foreground">{item.name}</span>
            <span className="font-bold text-foreground">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;
