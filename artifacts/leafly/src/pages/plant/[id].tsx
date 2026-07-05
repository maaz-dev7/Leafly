import { useState, useMemo } from "react";
import { useParams } from "wouter";
import { useGetPlant, useListVariants, useListAddons, OrderAddon, getGetPlantQueryKey } from "@workspace/api-client-react";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Droplet, Sun, Wind, ShoppingCart, Check, Leaf, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PlantDetail() {
  const { id } = useParams();
  const plantId = parseInt(id || "0", 10);
  const { data: plant, isLoading: plantLoading } = useGetPlant(plantId, { query: { enabled: !!plantId, queryKey: getGetPlantQueryKey(plantId) } });
  const { data: variants } = useListVariants();
  const { data: addons } = useListAddons();
  const { addItem } = useCart();
  const { toast } = useToast();

  const [selectedVariant, setSelectedVariant] = useState<string | undefined>();
  const [selectedAddons, setSelectedAddons] = useState<OrderAddon[]>([]);

  const isAdenium = plant?.name.toLowerCase().includes("adenium");
  const availableVariants = useMemo(() => variants?.filter(v => v.isAvailable) || [], [variants]);

  const pots = addons?.filter(a => a.type === "pot") || [];
  const fertilizers = addons?.filter(a => a.type === "fertilizer") || [];
  const otherAddons = addons?.filter(a => a.type !== "pot" && a.type !== "fertilizer") || [];

  const toggleAddon = (name: string, price: number, checked: boolean) => {
    if (checked) {
      setSelectedAddons(prev => [...prev, { name, price }]);
    } else {
      setSelectedAddons(prev => prev.filter(a => a.name !== name));
    }
  };

  const isAddonSelected = (name: string) => selectedAddons.some(a => a.name === name);

  const handleAddToCart = () => {
    if (!plant) return;
    if (isAdenium && availableVariants.length > 0 && !selectedVariant) {
      toast({ title: "Select a color", description: "Please select a color variant first.", variant: "destructive" });
      return;
    }
    const variantData = availableVariants.find(v => v.color === selectedVariant);
    const basePrice = variantData?.price || plant.price;
    const itemImage = variantData?.imageUrl || plant.imageUrl || "https://placehold.co/400x400/1D9E75/white?text=Plant";
    addItem({
      plantId: plant.id,
      plantName: plant.name,
      price: basePrice,
      quantity: 1,
      variantColor: selectedVariant,
      addons: selectedAddons,
      imageUrl: itemImage,
    });
    toast({ title: "Added to cart! 🛒", description: `${plant.name} has been added to your cart.` });
  };

  if (plantLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
          <div className="h-[500px] bg-muted rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-12 bg-muted rounded w-1/3 mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-4">🌿</div>
        <h2 className="text-2xl font-semibold mb-2">Plant not found</h2>
        <p className="text-muted-foreground">This plant may have been removed from our catalog.</p>
      </div>
    );
  }

  const variantData = availableVariants.find(v => v.color === selectedVariant);
  const currentPrice = (isAdenium && selectedVariant) ? variantData?.price || plant.price : plant.price;
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const total = currentPrice + addonsTotal;

  const AddonRow = ({ addon }: { addon: NonNullable<typeof addons>[0] }) => (
    <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors group">
      <Checkbox
        id={`addon-${addon.id}`}
        checked={isAddonSelected(addon.name)}
        onCheckedChange={(c) => toggleAddon(addon.name, addon.price, c === true)}
      />
      <img
        src={addon.imageUrl || "https://placehold.co/80x80/1D9E75/white?text=+"}
        alt={addon.name}
        className="w-10 h-10 rounded-lg object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{addon.name}</p>
        {addon.description && <p className="text-xs text-muted-foreground truncate">{addon.description}</p>}
      </div>
      <span className="text-sm font-semibold text-primary shrink-0">+Rs. {addon.price}</span>
    </label>
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image */}
        <div className="space-y-4">
          <div className="relative rounded-3xl overflow-hidden bg-muted aspect-square">
            <img
              src={plant.imageUrl || "https://placehold.co/800x800/1D9E75/white?text=Plant"}
              alt={plant.name}
              className="w-full h-full object-cover"
            />
            {!plant.isAvailable && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="secondary" className="text-lg px-6 py-2">Out of Stock</Badge>
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {plant.climateTags?.map(tag => (
              <span key={tag} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">{tag}</span>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-7">
          {/* Title & price */}
          <div>
            <div className="flex items-start gap-2 mb-2">
              <Badge variant="outline">{plant.category}</Badge>
              <Badge variant="outline" className={
                plant.difficulty === "Easy" ? "border-green-300 text-green-700" :
                plant.difficulty === "Medium" ? "border-yellow-300 text-yellow-700" :
                "border-red-300 text-red-700"
              }>{plant.difficulty}</Badge>
            </div>
            <h1 className="text-4xl font-serif font-bold text-foreground">{plant.name}</h1>
            <p className="text-lg italic text-muted-foreground mt-1">{plant.scientificName}</p>
            <div className="mt-4">
              <p className="text-4xl font-bold text-primary">Rs. {total.toLocaleString()}</p>
              {addonsTotal > 0 && (
                <p className="text-sm text-muted-foreground">Plant: Rs. {currentPrice.toLocaleString()} + Add-ons: Rs. {addonsTotal.toLocaleString()}</p>
              )}
            </div>
            {plant.description && <p className="text-muted-foreground mt-4 leading-relaxed">{plant.description}</p>}
          </div>

          {/* Variant picker */}
          {isAdenium && availableVariants.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Tag size={16} className="text-primary" /> Color Variant
                {!selectedVariant && <span className="text-sm text-red-500 font-normal">(required)</span>}
              </h3>
              <div className="flex flex-wrap gap-2">
                {availableVariants.map(variant => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant.color)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                      selectedVariant === variant.color
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {selectedVariant === variant.color && <Check size={14} />}
                    {variant.color}
                    <span className="text-muted-foreground">Rs. {variant.price}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to cart */}
          <Button
            size="lg"
            className="w-full text-base h-13 gap-2"
            onClick={handleAddToCart}
            disabled={!plant.isAvailable}
          >
            {plant.isAvailable ? (
              <><ShoppingCart size={18} /> Add to Cart — Rs. {total.toLocaleString()}</>
            ) : "Out of Stock"}
          </Button>

          {/* Enhance your plant */}
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Leaf size={18} className="text-primary" /> Enhance your plant
            </h3>

            {pots.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Pots & Planters</p>
                <div className="bg-muted/30 rounded-2xl overflow-hidden divide-y divide-border/50">
                  {pots.slice(0, 4).map(addon => <AddonRow key={addon.id} addon={addon} />)}
                </div>
              </div>
            )}

            {fertilizers.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Fertilizers</p>
                <div className="bg-muted/30 rounded-2xl overflow-hidden divide-y divide-border/50">
                  {fertilizers.slice(0, 3).map(addon => <AddonRow key={addon.id} addon={addon} />)}
                </div>
              </div>
            )}

            {otherAddons.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Other Add-ons</p>
                <div className="bg-muted/30 rounded-2xl overflow-hidden divide-y divide-border/50">
                  {otherAddons.slice(0, 3).map(addon => <AddonRow key={addon.id} addon={addon} />)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Plant Care & Info tabs */}
      <div className="mt-16">
        <Tabs defaultValue="care" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="care">Plant Care & Info</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="delivery">Delivery</TabsTrigger>
          </TabsList>

          <TabsContent value="care" className="mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-4 p-5 bg-blue-50 dark:bg-blue-950/30 rounded-2xl">
                <div className="w-10 h-10 bg-white dark:bg-background rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                  <Droplet className="text-blue-500" size={20} />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Watering</h4>
                  <p className="text-sm text-muted-foreground">Check the top inch of soil. If it's dry, water thoroughly until it drains from the bottom.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-5 bg-yellow-50 dark:bg-yellow-950/30 rounded-2xl">
                <div className="w-10 h-10 bg-white dark:bg-background rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                  <Sun className="text-yellow-500" size={20} />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Sunlight</h4>
                  <p className="text-sm text-muted-foreground">Most indoor plants thrive in bright, indirect sunlight. Avoid harsh afternoon sun.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-5 bg-cyan-50 dark:bg-cyan-950/30 rounded-2xl">
                <div className="w-10 h-10 bg-white dark:bg-background rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                  <Wind className="text-cyan-500" size={20} />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Humidity</h4>
                  <p className="text-sm text-muted-foreground">Tropical plants love humidity. Mist them occasionally or use a pebble tray underneath.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-5 bg-green-50 dark:bg-green-950/30 rounded-2xl">
                <div className="w-10 h-10 bg-white dark:bg-background rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                  <Leaf className="text-green-600" size={20} />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Fertilizer</h4>
                  <p className="text-sm text-muted-foreground">Feed every 2–4 weeks during spring and summer. Pause during winter dormancy.</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="mt-8">
            <div className="bg-card border rounded-2xl overflow-hidden divide-y max-w-lg">
              {[
                ["Category", plant.category],
                ["Difficulty", plant.difficulty],
                ["Size", plant.size || "Standard"],
                ["Scientific Name", plant.scientificName],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between px-5 py-4">
                  <span className="text-muted-foreground text-sm">{label}</span>
                  <span className="font-medium text-sm">{value}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="delivery" className="mt-8">
            <div className="bg-card border rounded-2xl p-6 max-w-lg">
              <h4 className="font-bold text-lg mb-4">Delivery Estimates</h4>
              <div className="space-y-3">
                {[
                  { city: "Lahore", days: "2–4 working days", badge: "Fast" },
                  { city: "Karachi", days: "4–6 working days", badge: null },
                  { city: "Islamabad", days: "3–5 working days", badge: null },
                  { city: "Other Cities", days: "7–9 working days", badge: null },
                ].map(({ city, days, badge }) => (
                  <div key={city} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{city}</span>
                      {badge && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">{badge}</span>}
                    </div>
                    <span className="text-muted-foreground text-sm">{days}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">Plants are carefully packaged to ensure safe arrival.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
