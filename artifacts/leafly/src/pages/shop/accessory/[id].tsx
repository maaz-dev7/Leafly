import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, ArrowLeft, Package, Tag, Info } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  pot: "Pots & Planters",
  fertilizer: "Soil & Fertilisers",
  tool: "Tools & Gadgets",
  light: "Grow Lights",
};

const TYPE_IMAGES: Record<string, string> = {
  pot: "https://placehold.co/800x800/6B8F3E/FFFFFF?text=Pot",
  fertilizer: "https://placehold.co/800x800/4A7C3F/FFFFFF?text=Fertilizer",
  tool: "https://placehold.co/800x800/1B3D2A/FFFFFF?text=Tool",
  light: "https://placehold.co/800x800/4A7C3F/FFFFFF?text=Grow+Light",
};

export default function AccessoryDetail() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const { toast } = useToast();

  const { data: addon, isLoading, isError } = useQuery({
    queryKey: ["addon", id],
    queryFn: async () => {
      const res = await fetch(`/api/addons/${id}`);
      if (!res.ok) throw new Error("Accessory not found");
      return res.json();
    },
    enabled: !!id,
  });

  const handleAddToCart = () => {
    if (!addon) return;
    addItem({
      plantId: -addon.id,
      plantName: addon.name,
      price: addon.price,
      quantity: 1,
      imageUrl: addon.imageUrl || TYPE_IMAGES[addon.type] || "https://placehold.co/800x800/4A7C3F/FFFFFF?text=Accessory",
      addons: [],
    });
    toast({ title: "Added to cart", description: `${addon.name} added to your cart.` });
  };

  if (isLoading) {
    return (
      <div className="px-5 md:px-20 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-muted animate-pulse rounded-3xl" />
          <div className="space-y-4 pt-4">
            <div className="h-6 bg-muted animate-pulse rounded w-1/3" />
            <div className="h-10 bg-muted animate-pulse rounded w-2/3" />
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-12 bg-muted animate-pulse rounded w-1/3 mt-8" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !addon) {
    return (
      <div className="px-5 md:px-20 py-24 text-center">
        <div className="text-5xl mb-4">🪴</div>
        <h2 className="text-2xl font-semibold mb-2">Accessory not found</h2>
        <p className="text-muted-foreground mb-6">This accessory may have been removed or the link is incorrect.</p>
        <Link href="/shop/accessories">
          <Button variant="outline">
            <ArrowLeft size={16} className="mr-2" /> Back to Accessories
          </Button>
        </Link>
      </div>
    );
  }

  const imageUrl = addon.imageUrl || TYPE_IMAGES[addon.type] || "https://placehold.co/800x800/4A7C3F/FFFFFF?text=Accessory";
  const typeLabel = TYPE_LABELS[addon.type] || addon.type;

  return (
    <div className="px-5 md:px-20 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/shop/accessories" className="hover:text-foreground transition-colors">Accessories</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{addon.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image */}
        <div className="aspect-square rounded-3xl overflow-hidden bg-[#F0F5EC] border">
          <img
            src={imageUrl}
            alt={addon.name}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center space-y-6">
          {/* Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
              <Tag size={11} /> {typeLabel}
            </span>
            {addon.stock !== undefined && addon.stock <= 5 && addon.stock > 0 && (
              <span className="text-xs font-semibold text-orange-600 bg-orange-50 dark:bg-orange-950/30 px-3 py-1 rounded-full">
                Only {addon.stock} left
              </span>
            )}
            {addon.stock === 0 && (
              <span className="text-xs font-semibold text-destructive bg-destructive/10 px-3 py-1 rounded-full">
                Out of Stock
              </span>
            )}
          </div>

          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">{addon.name}</h1>
            {addon.description && (
              <p className="text-muted-foreground text-base leading-relaxed">{addon.description}</p>
            )}
          </div>

          {/* Price */}
          <div className="py-4 border-y border-border/60">
            <p className="text-3xl font-bold dark:text-white">Rs. {Number(addon.price).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Inclusive of all taxes</p>
          </div>

          {/* Stock info */}
          {addon.stock !== undefined && (
            <div className="flex items-center gap-2 text-sm">
              <Package size={16} className="text-muted-foreground" />
              <span className="text-muted-foreground">
                {addon.stock > 0 ? `${addon.stock} in stock` : "Currently out of stock"}
              </span>
            </div>
          )}

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              size="lg"
              className="flex-1 gap-2 text-base"
              onClick={handleAddToCart}
              disabled={addon.stock === 0}
            >
              <ShoppingCart size={18} />
              {addon.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
            <Link href="/shop/accessories">
              <Button size="lg" variant="outline" className="gap-2">
                <ArrowLeft size={16} /> Back
              </Button>
            </Link>
          </div>

          {/* Info note */}
          <div className="flex items-start gap-2 bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground">
            <Info size={16} className="shrink-0 mt-0.5" />
            <p>Free delivery available on orders over Rs. 2,000. Standard delivery 2–5 working days depending on your city.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
