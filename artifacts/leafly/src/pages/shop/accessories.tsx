import { useState } from "react";
import { useListAddons } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { cardVariants } from "@/components/motion";
import { Link } from "wouter";

const TABS = [
  { label: "All Categories", value: "all" },
  { label: "Pots & Planters", value: "pot" },
  { label: "Soil & Fertilisers", value: "fertilizer" },
  { label: "Tools & Gadgets", value: "tool" },
  { label: "Grow Lights", value: "light" },
];

const TYPE_IMAGES: Record<string, string> = {
  pot: "https://placehold.co/400x400/6B8F3E/FFFFFF?text=Pot",
  fertilizer: "https://placehold.co/400x400/4A7C3F/FFFFFF?text=Fertilizer",
  tool: "https://placehold.co/400x400/1B3D2A/FFFFFF?text=Tool",
  light: "https://placehold.co/400x400/4A7C3F/FFFFFF?text=Grow+Light",
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
      imageUrl: addon.imageUrl || TYPE_IMAGES[addon.type] || "https://placehold.co/400x400/4A7C3F/FFFFFF?text=Accessory",
      addons: [],
    });
    toast({ title: "Added to cart", description: `${addon.name} added to your cart.` });
  };

  return (
    <div className="container mx-auto px-5 md:px-20 py-12">
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
          {filtered.map((addon, index) => (
            <motion.div
              key={addon.id}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: .12 }}
              className="plant-card group bg-card rounded-2xl overflow-hidden border flex flex-col cursor-pointer hover:shadow-lg hover:border-primary/40 transition-all duration-200"
            >
              <Link href={`/shop/accessory/${addon.id}`} className="flex flex-col flex-1">
                <div className="overflow-hidden">
                  <img
                    src={addon.imageUrl || TYPE_IMAGES[addon.type] || "https://placehold.co/400x400/4A7C3F/FFFFFF?text=Accessory"}
                    alt={addon.name}
                    className="w-full h-[200px] object-cover group-hover:scale-105 transition-transform duration-300"
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
                  </div>
                </div>
              </Link>
              <div className="px-4 pb-4">
                <Button
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); handleAddToCart(addon); }}
                  className="gap-1.5 w-full"
                >
                  <ShoppingCart size={14} /> Add to Cart
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
