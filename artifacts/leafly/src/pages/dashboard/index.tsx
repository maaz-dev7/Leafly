import { useListMyPlants, useMarkWatered, useMarkFertilized, getListMyPlantsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Droplet, Leaf, Sun, Thermometer, FlaskConical } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";

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

export default function Dashboard() {
  const { token } = useAuth();
  const [, setLocation] = useLocation();
  const { data: plants, refetch } = useListMyPlants({ query: { enabled: !!token, queryKey: getListMyPlantsQueryKey() } });

  const markWatered = useMarkWatered({ mutation: { onSuccess: () => refetch() } });
  const markFertilized = useMarkFertilized({ mutation: { onSuccess: () => refetch() } });

  if (!token) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="container mx-auto px-5 md:px-20 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-serif font-bold text-primary mb-2">Smart Care Dashboard</h1>
        <p className="text-muted-foreground text-lg">Keep track of your plants' health and watering schedules.</p>
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
                       plant.health === "Healthy" ? "bg-[#4A7C3F]/15 text-[#1B3D2A]" :
                       plant.health === "Needs Water" ? "bg-[#6B8F3E]/20 text-[#1B3D2A]" :
                       "bg-[#1B3D2A]/10 text-[#1B3D2A]"
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

      {/* General Care Tips */}
      <section>
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-1">General Care Tips</h2>
          <p className="text-muted-foreground">Universal guidelines to keep any plant thriving.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CARE_TIPS.map(tip => (
            <div key={tip.title} className={`${tip.bg} rounded-2xl p-5 border border-transparent`}>
              <div className={`w-10 h-10 bg-white dark:bg-background rounded-xl flex items-center justify-center mb-4 shadow-sm`}>
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
