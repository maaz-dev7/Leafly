import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useCreateOrder } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { Trash2, Plus, Minus, Truck, CheckCircle } from "lucide-react";

const DELIVERY_FEES: Record<string, number> = { lahore: 250 };
const DEFAULT_DELIVERY = 400;

function getDeliveryFee(city: string) {
  return DELIVERY_FEES[city.toLowerCase()] ?? DEFAULT_DELIVERY;
}

const CITIES = ["Lahore", "Karachi", "Islamabad", "Peshawar", "Quetta", "Multan", "Faisalabad", "Rawalpindi", "Sialkot", "Other"];

export default function Cart() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart();
  const [formData, setFormData] = useState({ customerName: "", customerPhone: "", city: "Lahore", address: "" });
  const [success, setSuccess] = useState(false);

  const deliveryFee = getDeliveryFee(formData.city);
  const subtotal = getTotal();
  const grandTotal = subtotal + deliveryFee;

  const orderMutation = useCreateOrder({
    mutation: {
      onSuccess: () => { clearCart(); setSuccess(true); }
    }
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const orderItems = items.map(i => ({
      plantId: i.plantId,
      plantName: i.plantName,
      variantColor: i.variantColor,
      quantity: i.quantity,
      price: i.price,
      addons: i.addons.map(a => ({ name: a.name, price: a.price }))
    }));
    orderMutation.mutate({ data: { ...formData, items: orderItems } });
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-lg">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-primary" size={40} />
        </div>
        <h1 className="text-3xl font-serif font-bold mb-4">Order Placed!</h1>
        <p className="text-muted-foreground mb-2">Thank you for shopping with Leafly.</p>
        <p className="text-muted-foreground mb-8">
          We'll deliver your plants to <strong>{formData.city}</strong> in{" "}
          {formData.city.toLowerCase() === "lahore" ? "2–4" : "7–9"} working days.
        </p>
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <Link href="/orders"><Button className="w-full">Track My Order</Button></Link>
          <Link href="/"><Button variant="outline" className="w-full">Return Home</Button></Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-3xl font-serif font-bold mb-4 text-primary">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8">Looks like you haven't added any plants yet.</p>
        <Link href="/shop"><Button>Browse Shop</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif font-bold mb-8">Your Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Items list */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, idx) => (
            <Card key={idx} className="overflow-hidden border-border/60">
              <div className="flex flex-col sm:flex-row">
                <img src={item.imageUrl} alt={item.plantName} className="w-full sm:w-36 h-36 object-cover shrink-0" />
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-semibold text-base">{item.plantName}</h3>
                      {item.variantColor && <p className="text-sm text-muted-foreground">Color: {item.variantColor}</p>}
                      {item.addons.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Add-ons: {item.addons.map(a => a.name).join(", ")}
                        </p>
                      )}
                    </div>
                    <span className="font-bold text-base shrink-0">
                      Rs. {((item.price + item.addons.reduce((s, a) => s + a.price, 0)) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center gap-2 border rounded-lg px-2 py-1">
                      <button onClick={() => updateQuantity(item.plantId, item.variantColor, Math.max(1, item.quantity - 1))} className="text-muted-foreground hover:text-foreground p-0.5">
                        <Minus size={14} />
                      </button>
                      <span className="w-7 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.plantId, item.variantColor, item.quantity + 1)} className="text-muted-foreground hover:text-foreground p-0.5">
                        <Plus size={14} />
                      </button>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 h-8 w-8" onClick={() => removeItem(item.plantId, item.variantColor)}>
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Delivery info banner */}
          <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
            <Truck className="text-primary shrink-0" size={20} />
            <p className="text-sm">
              <strong>Free packaging</strong> on all orders. Delivery to{" "}
              <strong>Lahore: Rs. 250</strong> · <strong>Other cities: Rs. 400</strong>
            </p>
          </div>
        </div>

        {/* Order Summary + Checkout */}
        <div>
          <Card className="sticky top-24 border-primary/20">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-5 pb-4 border-b">Order Summary</h2>

              {/* Price breakdown */}
              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Truck size={13} /> Delivery ({formData.city || "—"})
                  </span>
                  <span className="font-medium">Rs. {deliveryFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t pt-3">
                  <span>Total</span>
                  <span className="text-primary">Rs. {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Delivery note */}
              <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 mb-5">
                {formData.city.toLowerCase() === "lahore"
                  ? "📦 Lahore delivery: 2–4 working days • Rs. 250"
                  : "📦 Delivery to other cities: 7–9 working days • Rs. 400"}
              </p>

              {/* Checkout form */}
              <form onSubmit={onSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Full Name</Label>
                  <Input value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })} required placeholder="e.g. Ahmed Khan" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Phone Number</Label>
                  <Input value={formData.customerPhone} onChange={e => setFormData({ ...formData, customerPhone: e.target.value })} required placeholder="+92 300 000 0000" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">City</Label>
                  <Select value={formData.city} onValueChange={v => setFormData({ ...formData, city: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Delivery Address</Label>
                  <Input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} required placeholder="Street, Area" />
                </div>
                <Button type="submit" className="w-full text-base h-11 mt-2" disabled={orderMutation.isPending}>
                  {orderMutation.isPending ? "Placing Order..." : `Place Order · Rs. ${grandTotal.toLocaleString()}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
