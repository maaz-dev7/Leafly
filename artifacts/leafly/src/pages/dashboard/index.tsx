import { useListMyPlants, useMarkWatered, useMarkFertilized } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplet, Leaf } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function Dashboard() {
  const { token } = useAuth();
  const { data: plants, refetch } = useListMyPlants({ query: { enabled: !!token } });
  
  const markWatered = useMarkWatered({ mutation: { onSuccess: () => refetch() } });
  const markFertilized = useMarkFertilized({ mutation: { onSuccess: () => refetch() } });

  if (!token) {
    window.location.href = "/login";
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-serif text-primary">Smart Care Dashboard</h1>
        <p className="text-muted-foreground">Keep track of your plants' health and watering schedules.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plants?.map(plant => (
          <Card key={plant.id} className="overflow-hidden border-none shadow-md bg-card relative">
            {plant.health === 'Needs Water' && (
              <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-xs font-bold text-center py-1 z-10">
                WATERING OVERDUE
              </div>
            )}
            <img src={plant.plantImageUrl || "https://placehold.co/400x400/1D9E75/white?text=Plant"} alt={plant.plantName} className="w-full h-48 object-cover" />
            <CardContent className="p-5">
              <h3 className="font-serif text-xl font-bold mb-1">{plant.plantName}</h3>
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  plant.health === 'Healthy' ? 'bg-green-100 text-green-800' : 
                  plant.health === 'Needs Water' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                }`}>
                  {plant.health}
                </span>
              </div>
              
              <div className="space-y-2 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Watered</span>
                  <span>{plant.lastWatered ? new Date(plant.lastWatered).toLocaleDateString() : 'Never'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Next Water Due</span>
                  <span className={plant.health === 'Needs Water' ? 'text-blue-600 font-bold' : ''}>
                    {plant.nextWaterDue ? new Date(plant.nextWaterDue).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1 gap-2 bg-blue-500 hover:bg-blue-600 text-white" 
                  size="sm"
                  onClick={() => markWatered.mutate({ id: plant.id })}
                  disabled={markWatered.isPending}
                >
                  <Droplet size={16} /> Water
                </Button>
                <Button 
                  className="flex-1 gap-2" 
                  variant="outline"
                  size="sm"
                  onClick={() => markFertilized.mutate({ id: plant.id })}
                  disabled={markFertilized.isPending}
                >
                  <Leaf size={16} /> Fertilize
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {plants?.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-medium">No plants yet</h3>
            <p className="text-muted-foreground mt-2">Add plants from the shop to start tracking their care.</p>
          </div>
        )}
      </div>
    </div>
  );
}