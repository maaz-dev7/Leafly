import { useState, useMemo } from "react";
import { useParams } from "wouter";
import { useGetPlant, useListVariants, useListAddons, OrderAddon } from "@workspace/api-client-react";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Droplet, Sun, Thermometer, Box } from "lucide-react";

export default function PlantDetail() {
  const { id } = useParams();
  const plantId = parseInt(id || "0", 10);
  const { data: plant, isLoading: plantLoading } = useGetPlant(plantId, { query: { enabled: !!plantId } });
  const { data: variants } = useListVariants();
  const { data: addons } = useListAddons();
  const { addItem } = useCart();
  const { toast } = useToast();

  const [selectedVariant, setSelectedVariant] = useState<string | undefined>();
  const [selectedAddons, setSelectedAddons] = useState<OrderAddon[]>([]);

  const isAdenium = plant?.name.toLowerCase().includes("adenium");
  const availableVariants = useMemo(() => variants?.filter(v => v.isAvailable) || [], [variants]);

  const toggleAddon = (name: string, price: number, checked: boolean) => {
    if (checked) {
      setSelectedAddons(prev => [...prev, { name, price }]);
    } else {
      setSelectedAddons(prev => prev.filter(a => a.name !== name));
    }
  };

  const handleAddToCart = () => {
    if (!plant) return;
    
    // Check variant requirement
    if (isAdenium && availableVariants.length > 0 && !selectedVariant) {
      toast({ title: "Select a color", description: "Please select a color variant first.", variant: "destructive" });
      return;
    }

    const variantData = availableVariants.find(v => v.color === selectedVariant);
    const basePrice = variantData?.price || plant.price;
    const itemImage = variantData?.imageUrl || plant.imageUrl || "https://placehold.co/400x400/1D9E75/white?text=Leafly";

    addItem({
      plantId: plant.id,
      plantName: plant.name,
      price: basePrice,
      quantity: 1,
      variantColor: selectedVariant,
      addons: selectedAddons,
      imageUrl: itemImage
    });

    toast({ title: "Added to cart", description: `${plant.name} added to your cart.` });
  };

  if (plantLoading) return <div className="container mx-auto px-4 py-16">Loading...</div>;
  if (!plant) return <div className="container mx-auto px-4 py-16">Plant not found.</div>;

  const currentPrice = (isAdenium && selectedVariant) 
    ? availableVariants.find(v => v.color === selectedVariant)?.price || plant.price
    : plant.price;
    
  const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
  const total = currentPrice + addonsTotal;

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <img 
            src={plant.imageUrl || "https://placehold.co/400x400/1D9E75/white?text=Leafly"} 
            alt={plant.name} 
            className="w-full h-auto object-cover rounded-xl shadow-md"
          />
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-serif text-primary">{plant.name}</h1>
            <p className="text-xl italic text-muted-foreground mt-1">{plant.scientificName}</p>
            <p className="text-3xl font-bold mt-4">Rs. {total}</p>
            <p className="text-muted-foreground mt-4">{plant.description}</p>
          </div>

          {isAdenium && availableVariants.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Select Color:</h3>
              <div className="flex gap-3">
                {availableVariants.map(variant => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant.color)}
                    className={`px-4 py-2 rounded-md border ${selectedVariant === variant.color ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background'}`}
                  >
                    {variant.color}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-medium mb-3">Optional Add-ons:</h3>
            <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
              {addons?.slice(0, 5).map(addon => (
                <div key={addon.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`addon-${addon.id}`} 
                    onCheckedChange={(c) => toggleAddon(addon.name, addon.price, c === true)} 
                  />
                  <label htmlFor={`addon-${addon.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer">
                    {addon.name}
                  </label>
                  <span className="text-sm text-muted-foreground">+Rs. {addon.price}</span>
                </div>
              ))}
            </div>
          </div>

          <Button size="lg" className="w-full text-lg h-14" onClick={handleAddToCart}>
            Add to Cart — Rs. {total}
          </Button>

          <Tabs defaultValue="care" className="w-full mt-12">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="care">Care</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="delivery">Delivery</TabsTrigger>
            </TabsList>
            <TabsContent value="care" className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-secondary/20 rounded-lg">
                  <Droplet className="text-primary mt-1" />
                  <div>
                    <h4 className="font-medium">Watering</h4>
                    <p className="text-sm text-muted-foreground mt-1">Water when top inch of soil feels dry.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-secondary/20 rounded-lg">
                  <Sun className="text-primary mt-1" />
                  <div>
                    <h4 className="font-medium">Sunlight</h4>
                    <p className="text-sm text-muted-foreground mt-1">Prefers bright, indirect light.</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="details" className="mt-6 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Category</span><span>{plant.category}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Difficulty</span><span>{plant.difficulty}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Size</span><span>{plant.size || 'Standard'}</span></div>
              </div>
            </TabsContent>
            <TabsContent value="delivery" className="mt-6">
              <div className="p-4 border rounded-lg bg-card">
                <h4 className="font-medium">Delivery Estimates:</h4>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>• Lahore: 2–4 working days</li>
                  <li>• Other Cities: 7–9 working days</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>

        </div>
      </div>
    </div>
  );
}