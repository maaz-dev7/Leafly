import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useListMyPlants, useMarkWatered, useMarkFertilized, getListMyPlantsQueryKey, useListOrders, getListOrdersQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Droplet, Leaf, Sun, Thermometer, FlaskConical, ChevronDown, ChevronUp, Package, Truck, CheckCircle, Clock, ShoppingBag } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";

const CARE_TIPS = [
  {
    icon: Droplet,
    color: "text-[#4A7C3F]",
    bg: "bg-[#4A7C3F]/10",
    title: "Watering",
    desc: "Check the top inch of soil. If it's dry, it's time to water. Water thoroughly until it drains from the bottom.",
  },
  {
    icon: Sun,
    color: "text-[#6B8F3E]",
    bg: "bg-[#6B8F3E]/10",
    title: "Light",
    desc: "Most indoor plants thrive in bright, indirect sunlight. Keep away from harsh direct afternoon sun to prevent leaf burn.",
  },
  {
    icon: Thermometer,
    color: "text-[#4A7C3F]",
    bg: "bg-[#4A7C3F]/10",
    title: "Humidity",
    desc: "Tropical plants love humidity. Mist them occasionally or use a pebble tray with water underneath the pot.",
  },
  {
    icon: FlaskConical,
    color: "text-[#1B3D2A]",
    bg: "bg-[#1B3D2A]/10",
    title: "Fertilizer",
    desc: "Feed during the growing season (spring/summer) every 2–4 weeks. Pause during winter dormancy.",
  },
];

function buildCareGuide(difficulty: string, category: string) {
  const isOutdoor = category?.toLowerCase().includes("outdoor");

  const watering: Record<string, string> = {
    Easy:   "Water every 7–10 days. Let the top 2 cm of soil dry out before watering again — overwatering is the #1 killer.",
    Medium: "Water every 4–7 days when the top inch of soil feels dry. Always let excess drain; never let roots sit in water.",
    Hard:   "Check soil moisture every 1–2 days. Needs vary widely — under or overwatering can both be fatal for this plant.",
  };
  const sunlight: Record<string, string> = {
    Easy:   isOutdoor ? "Thrives in full sun. Give 5–7 hours of direct sunlight daily — ideal for a balcony or garden." : "Tolerates low to medium indirect light. Any well-lit room works, even away from a window.",
    Medium: isOutdoor ? "Needs 4–6 hours of direct morning sun. Protect from harsh afternoon sun in summer." : "Prefers bright indirect light near a north or east-facing window. Avoid harsh direct afternoon sun.",
    Hard:   isOutdoor ? "Requires specific sun exposure — read your plant's tag for exact hours. Too much or too little will stress it." : "Has specific light requirements. Usually needs a very bright spot; rotate regularly for even growth.",
  };
  const soil: Record<string, string> = {
    Easy:   "Standard potting mix works perfectly. Repot every 1–2 years or when roots escape the drainage holes.",
    Medium: "Use a well-draining potting mix. Add 20–30% perlite or coarse sand to prevent waterlogging.",
    Hard:   "Needs a specialised soil mix (e.g. succulent mix, orchid bark, or a custom blend). Do not use regular garden soil.",
  };
  const temp: Record<string, string> = {
    Easy:   "Adaptable to 15–35°C. Keep away from freezing cold in winter. Can handle mild temperature swings.",
    Medium: "Prefers 18–28°C. Keep away from air-conditioner vents, cold windowsills, and sudden temperature drops.",
    Hard:   "Sensitive — maintain 20–25°C consistently. Even brief exposure to cold drafts or heat spikes can cause leaf drop.",
  };

  const d = difficulty ?? "Medium";
  return [
    { icon: Droplet,      color: "text-blue-500",   bg: "bg-blue-50 dark:bg-blue-950/30",   title: "Watering",     tip: watering[d] ?? watering.Medium },
    { icon: Sun,          color: "text-yellow-500",  bg: "bg-yellow-50 dark:bg-yellow-950/30", title: "Sunlight",  tip: sunlight[d] ?? sunlight.Medium },
    { icon: Leaf,         color: "text-green-600",   bg: "bg-green-50 dark:bg-green-950/30",  title: "Soil",       tip: soil[d] ?? soil.Medium },
    { icon: Thermometer,  color: "text-orange-500",  bg: "bg-orange-50 dark:bg-orange-950/30", title: "Temperature", tip: temp[d] ?? temp.Medium },
  ];
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  pending:    { label: "Pending",    icon: Clock,        color: "text-yellow-700 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-950/30" },
  confirmed:  { label: "Confirmed",  icon: CheckCircle,  color: "text-green-700 dark:text-green-400",  bg: "bg-green-50 dark:bg-green-950/30" },
  processing: { label: "Processing", icon: Package,      color: "text-blue-700 dark:text-blue-400",    bg: "bg-blue-50 dark:bg-blue-950/30" },
  shipped:    { label: "Shipped",    icon: Truck,        color: "text-purple-700 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/30" },
  delivered:  { label: "Delivered",  icon: CheckCircle,  color: "text-primary dark:text-green-400",    bg: "bg-primary/10 dark:bg-green-950/30" },
};

function CarePanel({ plantName, plantId }: { plantName: string; plantId: number }) {
  const { data: plant, isLoading } = useQuery({
    queryKey: ["plant-care-detail", plantId],
    queryFn: async () => {
      const res = await fetch(`/api/plants/${plantId}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: plantId > 0,
    staleTime: 10 * 60 * 1000,
  });

  const guide = buildCareGuide(plant?.difficulty ?? "Medium", plant?.category ?? "");

  return (
    <div className="mt-3 rounded-xl border border-border/60 overflow-hidden">
      <div className="bg-primary/5 px-4 py-2 border-b border-border/40 flex items-center justify-between">
        <p className="text-xs font-bold text-primary uppercase tracking-wide">How to Care for {plantName}</p>
        {plant && <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{plant.difficulty} · {plant.category}</span>}
      </div>
      {isLoading ? (
        <div className="p-4 flex gap-2 items-center text-xs text-muted-foreground">
          <div className="w-3 h-3 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
          Loading care guide…
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-border/40">
          {guide.map(tip => (
            <div key={tip.title} className={`p-3 flex gap-3 items-start ${tip.bg}`}>
              <div className="shrink-0 mt-0.5">
                <tip.icon size={16} className={tip.color} />
              </div>
              <div>
                <p className="text-xs font-bold mb-0.5">{tip.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{tip.tip}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { token } = useAuth();
  const [, setLocation] = useLocation();
  const [expandedCare, setExpandedCare] = useState<string | null>(null);

  const { data: plants, refetch } = useListMyPlants({ query: { enabled: !!token, queryKey: getListMyPlantsQueryKey() } });
  const { data: orders, isLoading: ordersLoading } = useListOrders(undefined, { query: { enabled: !!token, queryKey: getListOrdersQueryKey() } });

  const markWatered = useMarkWatered({ mutation: { onSuccess: () => refetch() } });
  const markFertilized = useMarkFertilized({ mutation: { onSuccess: () => refetch() } });

  if (!token) {
    setLocation("/login");
    return null;
  }

  const toggleCare = (key: string) => setExpandedCare(prev => prev === key ? null : key);

  return (
    <div className="container mx-auto px-5 md:px-20 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-serif font-bold text-primary mb-2">Your Plants</h1>
        <p className="text-muted-foreground text-lg">Manage your plant collection, orders and care schedules.</p>
      </div>

      {/* My Plants */}
      {plants && plants.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">My Plants ({plants.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plants.map(plant => (
              <div key={plant.id} className="bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm relative">
                {plant.health === "Needs Water" && (
                  <div className="bg-[#4A7C3F] text-white text-xs font-bold text-center py-1.5 tracking-wide">
                    💧 WATERING OVERDUE
                  </div>
                )}
                <img
                  src={plant.plantImageUrl || "https://placehold.co/400x400/4A7C3F/FFFFFF?text=Plant"}
                  alt={plant.plantName}
                  className="w-full h-48 object-cover"
                />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-serif text-xl font-bold">{plant.plantName}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      plant.health === "Healthy" ? "bg-[#4A7C3F]/15 text-[#1B3D2A] dark:text-green-400" :
                      plant.health === "Needs Water" ? "bg-[#6B8F3E]/20 text-[#1B3D2A] dark:text-green-400" :
                      "bg-[#1B3D2A]/10 text-[#1B3D2A] dark:text-green-400"
                    }`}>
                      {plant.health}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm mb-5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Watered</span>
                      <span className="font-medium">{plant.lastWatered ? new Date(plant.lastWatered).toLocaleDateString("en-PK", { day: "numeric", month: "short" }) : "Never"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Next Water Due</span>
                      <span className={`font-medium ${plant.health === "Needs Water" ? "text-[#4A7C3F] font-bold" : ""}`}>
                        {plant.nextWaterDue ? new Date(plant.nextWaterDue).toLocaleDateString("en-PK", { day: "numeric", month: "short" }) : "Unknown"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 gap-2 bg-[#1B3D2A] hover:bg-[#4A7C3F] text-white"
                      size="sm"
                      onClick={() => markWatered.mutate({ id: plant.id })}
                      disabled={markWatered.isPending}
                    >
                      <Droplet size={14} /> Water Now
                    </Button>
                    <Button
                      className="flex-1 gap-2"
                      variant="outline"
                      size="sm"
                      onClick={() => markFertilized.mutate({ id: plant.id })}
                      disabled={markFertilized.isPending}
                    >
                      <Leaf size={14} /> Fertilize
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {plants?.length === 0 && (
        <div className="py-16 text-center border-2 border-dashed rounded-2xl mb-16">
          <div className="text-5xl mb-4">🌱</div>
          <h3 className="text-xl font-semibold mb-2">No plants yet</h3>
          <p className="text-muted-foreground mb-6">Order plants from our shop and they'll appear here for care tracking.</p>
          <Button onClick={() => setLocation("/shop")}>Browse Shop</Button>
        </div>
      )}

      {/* My Orders */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">My Orders</h2>
          <Link href="/orders">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ShoppingBag size={14} /> View All & Track
            </Button>
          </Link>
        </div>

        {ordersLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />)}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.slice(0, 5).map(order => {
              const statusKey = (order.status ?? "pending").toLowerCase();
              const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;
              const StatusIcon = cfg.icon;
              const items: any[] = Array.isArray(order.items) ? order.items : [];

              return (
                <div key={order.id} className="bg-card border border-border/60 rounded-2xl overflow-hidden">
                  {/* Order header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b bg-muted/30">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Order ID</p>
                      <p className="font-bold">#{String(order.id).padStart(5, "0")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Date</p>
                      <p className="font-medium text-sm">{new Date(order.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total</p>
                      <p className="font-bold dark:text-white">Rs. {Number(order.total).toLocaleString()}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.color}`}>
                      <StatusIcon size={12} /> {cfg.label}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="px-5 py-4 space-y-3">
                    {items.map((item: any, idx: number) => {
                      const careKey = `${order.id}-${idx}`;
                      const isPlant = (item.plantId ?? 0) > 0;
                      return (
                        <div key={idx}>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              {item.imageUrl && (
                                <img src={item.imageUrl} alt={item.plantName} className="w-10 h-10 rounded-lg object-cover shrink-0 border" />
                              )}
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{item.plantName}</p>
                                <p className="text-xs text-muted-foreground">Qty: {item.quantity} · Rs. {Number(item.price).toLocaleString()}</p>
                              </div>
                            </div>
                            {isPlant && (
                              <button
                                onClick={() => toggleCare(careKey)}
                                className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/30 rounded-lg px-2.5 py-1.5 hover:bg-primary/10 transition-colors"
                              >
                                <Leaf size={12} />
                                How to Care
                                {expandedCare === careKey ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                              </button>
                            )}
                          </div>
                          {isPlant && expandedCare === careKey && (
                            <CarePanel plantName={item.plantName} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {orders.length > 5 && (
              <Link href="/orders">
                <Button variant="outline" className="w-full">View all {orders.length} orders</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="py-12 text-center border-2 border-dashed rounded-2xl">
            <div className="text-4xl mb-3">📦</div>
            <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground text-sm mb-4">Your order history will appear here once you place an order.</p>
            <Link href="/shop"><Button size="sm">Shop Plants</Button></Link>
          </div>
        )}
      </section>

      {/* General Care Tips */}
      <section>
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-1">General Care Tips</h2>
          <p className="text-muted-foreground">Universal guidelines to keep any plant thriving.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CARE_TIPS.map(tip => (
            <div key={tip.title} className={`${tip.bg} rounded-2xl p-5 border border-transparent`}>
              <div className="w-10 h-10 bg-white dark:bg-background rounded-xl flex items-center justify-center mb-4 shadow-sm">
                <tip.icon className={tip.color} size={20} />
              </div>
              <h3 className="font-bold text-base mb-2">{tip.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
