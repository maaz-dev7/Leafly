import { useState } from "react";
import { useListAddons } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart } from "lucide-react";

const TABS = [
  { label: "All Categories", value: "all" },
  { label: "Pots & Planters", value: "pot" },
  { label: "Soil & Fertilisers", value: "fertilizer" },
  { label: "Tools & Gadgets", value: "tool" },
  { label: "Grow Lights", value: "light" },
];

const TYPE_IMAGES: Record<string, string> = {
  pot: "https://placehold.co/400x400/1D9E75/white?text=Pot",
  fertilizer: "https://placehold.co/400x400/52b788/white?text=Fertilizer",
  tool: "https://placehold.co/400x400/2d6a4f/white?text=Tool",
  light: "https://placehold.co/400x400/74c69d/white?text=Grow+Light",
};

export default function AccessoriesShop() {
  const { data: addons, isLoading } = useListAddons();
  const [activeTab, setActiveTab] = useState("all");
  const { addItem } = useCart();
  const { toast } = useToast();

  const filtered = addons?.filter(a => activeTab === "all" || a.type === activeTab) ?? [];

  const handleAddToCart = (addon: typeof filtered[0]) => {
    addItem({
      plantId: -addon.id,
      plantName: addon.name,
      price: addon.price,
      quantity: 1,
      imageUrl: addon.imageUrl || TYPE_IMAGES[addon.type] || "https://placehold.co/400x400/1D9E75/white?text=Accessory",
      addons: [],
    });
    toast({ title: "Added to cart", description: `${addon.name} added to your cart.` });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-serif font-bold mb-2">Accessories</h1>
        <p className="text-muted-foreground">Everything you need to keep your plants thriving.</p>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b pb-4">
        {TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === tab.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-72 bg-muted animate-pulse rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center">
          <div className="text-5xl mb-4">🪴</div>
          <p className="text-muted-foreground">No accessories found. Try selecting a different category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map(addon => (
            <div key={addon.id} className="group bg-card rounded-2xl overflow-hidden border border-border/50 hover:shadow-lg transition-all flex flex-col">
              <div className="overflow-hidden">
                <img
                  src={addon.imageUrl || TYPE_IMAGES[addon.type] || "https://placehold.co/400x400/1D9E75/white?text=Accessory"}
                  alt={addon.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                  {TABS.find(t => t.value === addon.type)?.label || addon.type}
                </span>
                <h3 className="font-semibold text-base mb-1">{addon.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{addon.description}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <span className="font-bold text-lg">Rs. {addon.price.toLocaleString()}</span>
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(addon)}
                    className="gap-1.5"
                  >
                    <ShoppingCart size={14} /> Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
