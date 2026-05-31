import { useListAddons } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AccessoriesShop() {
  const { data: addons, isLoading } = useListAddons();

  if (isLoading) return <div className="container mx-auto px-4 py-16">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-serif mb-8 text-primary">Plant Accessories</h1>
      <p className="text-muted-foreground mb-8">Everything you need to keep your plants thriving.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {addons?.map(addon => (
          <Card key={addon.id} className="border-none bg-card hover:shadow-md transition-all">
            <img src={addon.imageUrl || "https://placehold.co/400x400/1D9E75/white?text=Accessory"} alt={addon.name} className="w-full h-48 object-cover rounded-t-lg" />
            <CardContent className="p-4">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">{addon.type}</span>
              <h3 className="font-serif text-lg mt-1">{addon.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 h-10 line-clamp-2">{addon.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-bold">Rs. {addon.price}</span>
                <Button size="sm" variant="outline">Add to Cart</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}