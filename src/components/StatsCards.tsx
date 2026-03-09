import { ShoppingBag, DollarSign, TrendingUp, Users } from "lucide-react";

const stats = [
  {
    title: "Today's Orders",
    value: "48",
    change: "+12%",
    icon: ShoppingBag,
    emoji: "🧁",
    color: "bg-strawberry-light text-strawberry",
    trend: "up" as const,
  },
  {
    title: "Revenue",
    value: "$2,840",
    change: "+8.5%",
    icon: DollarSign,
    emoji: "💰",
    color: "bg-vanilla text-caramel",
    trend: "up" as const,
  },
  {
    title: "Products Sold",
    value: "156",
    change: "+23%",
    icon: TrendingUp,
    emoji: "🍩",
    color: "bg-mint text-foreground",
    trend: "up" as const,
  },
  {
    title: "New Customers",
    value: "12",
    change: "+4",
    icon: Users,
    emoji: "🎂",
    color: "bg-caramel-light text-chocolate",
    trend: "up" as const,
  },
];

const StatsCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      {stats.map((stat, i) => (
        <div
          key={stat.title}
          className="bakery-card flex items-center gap-4 animate-fade-in"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center text-2xl`}>
            {stat.emoji}
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
            <p className="text-2xl font-bold font-fredoka text-foreground">{stat.value}</p>
          </div>
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-mint text-foreground">
            {stat.change}
          </span>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
