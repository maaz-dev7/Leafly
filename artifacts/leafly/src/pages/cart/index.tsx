import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useCreateOrder } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { Trash2, Plus, Minus } from "lucide-react";

export default function Cart() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart();
  const [formData, setFormData] = useState({ customerName: "", customerPhone: "", city: "Lahore", address: "" });
  const [success, setSuccess] = useState(false);

  const orderMutation = useCreateOrder({
    mutation: {
      onSuccess: () => {
        clearCart();
        setSuccess(true);
      }
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
        <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-serif mb-4">Order Placed Successfully!</h1>
        <p className="text-muted-foreground mb-8">Thank you for shopping with Leafly. We'll deliver your plants soon.</p>
        <Link href="/"><Button>Return Home</Button></Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-serif mb-4 text-primary">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8">Looks like you haven't added any plants yet.</p>
        <Link href="/shop"><Button>Browse Shop</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-serif mb-8 text-primary">Your Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {items.map((item, idx) => (
            <Card key={idx} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <img src={item.imageUrl} alt={item.plantName} className="w-full sm:w-40 h-40 object-cover" />
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif text-lg font-bold">{item.plantName}</h3>
                      {item.variantColor && <p className="text-sm text-muted-foreground">Color: {item.variantColor}</p>}
                      {item.addons.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Add-ons: {item.addons.map(a => a.name).join(", ")}
                        </p>
                      )}
                    </div>
                    <span className="font-bold text-lg">Rs. {(item.price + item.addons.reduce((s,a)=>s+a.price,0)) * item.quantity}</span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center gap-3 border rounded-md px-2 py-1">
                      <button onClick={() => updateQuantity(item.plantId, item.variantColor, Math.max(1, item.quantity - 1))} className="text-muted-foreground hover:text-foreground"><Minus size={16}/></button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.plantId, item.variantColor, item.quantity + 1)} className="text-muted-foreground hover:text-foreground"><Plus size={16}/></button>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => removeItem(item.plantId, item.variantColor)}>
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div>
          <Card className="sticky top-24 border-primary/20">
            <CardContent className="p-6">
              <h2 className="text-xl font-serif font-bold mb-6 border-b pb-4">Order Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>Rs. {getTotal()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>Calculated at checkout</span></div>
                <div className="flex justify-between text-lg font-bold border-t pt-4"><span>Total</span><span className="text-primary">Rs. {getTotal()}</span></div>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input value={formData.customerPhone} onChange={e => setFormData({...formData, customerPhone: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Delivery Address</Label>
                  <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required />
                </div>
                <p className="text-xs text-muted-foreground">
                  Estimated Delivery: {formData.city.toLowerCase() === 'lahore' ? '2-4' : '7-9'} working days
                </p>
                <Button type="submit" className="w-full text-lg h-12 mt-4" disabled={orderMutation.isPending}>
                  {orderMutation.isPending ? "Processing..." : "Place Order"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}