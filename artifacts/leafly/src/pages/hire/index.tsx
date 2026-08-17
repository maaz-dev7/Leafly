import { useState } from "react";
import { useCreateBooking } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Banknote, CreditCard, Shovel, TreePine, Flower2, Stethoscope, CheckCircle } from "lucide-react";

const services = [
  {
    id: "gardener",
    name: "Gardener",
    price: "Rs. 500/hr",
    desc: "Basic maintenance, watering, pruning and daily plant care",
    icon: Shovel,
    topBorder: "border-t-[3px] border-t-green-500",
    iconBg: "bg-green-100 dark:bg-green-900/40",
    iconColor: "text-green-600 dark:text-green-400",
    cardBg: "bg-green-50/60 dark:bg-green-950/20",
    priceColor: "text-green-700 dark:text-green-400 font-bold",
  },
  {
    id: "landscaper",
    name: "Landscaper",
    price: "from Rs. 5,000",
    desc: "Full garden design, layout planning and professional execution",
    icon: TreePine,
    topBorder: "border-t-[3px] border-t-teal-500",
    iconBg: "bg-teal-100 dark:bg-teal-900/40",
    iconColor: "text-teal-600 dark:text-teal-400",
    cardBg: "bg-teal-50/60 dark:bg-teal-950/20",
    priceColor: "text-teal-700 dark:text-teal-400 font-bold",
  },
  {
    id: "decorator",
    name: "Plant Decorator",
    price: "Rs. 2,500/room",
    desc: "Indoor plant styling, arrangement and aesthetic placement",
    icon: Flower2,
    topBorder: "border-t-[3px] border-t-purple-500",
    iconBg: "bg-purple-100 dark:bg-purple-900/40",
    iconColor: "text-purple-600 dark:text-purple-400",
    cardBg: "bg-purple-50/60 dark:bg-purple-950/20",
    priceColor: "text-purple-700 dark:text-purple-400 font-bold",
  },
  {
    id: "consultant",
    name: "Plant Consultant",
    price: "Rs. 800/session",
    desc: "Expert advice on plant health, diagnosis and treatment",
    icon: Stethoscope,
    topBorder: "border-t-[3px] border-t-sky-500",
    iconBg: "bg-sky-100 dark:bg-sky-900/40",
    iconColor: "text-sky-600 dark:text-sky-400",
    cardBg: "bg-sky-50/60 dark:bg-sky-950/20",
    priceColor: "text-sky-700 dark:text-sky-400 font-bold",
  },
];

export default function HireAPro() {
  const [formData, setFormData] = useState({
    name: "", phone: "", city: "Lahore", address: "", serviceType: "", preferredDate: "", paymentMethod: "", notes: ""
  });
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [success, setSuccess] = useState<string | null>(null);

  const isOnline = formData.paymentMethod === "online";
  const cardValid = !isOnline || (
    card.number.replace(/\s/g, "").length >= 12 &&
    card.name.trim().length > 1 &&
    /^\d{2}\/\d{2}$/.test(card.expiry) &&
    card.cvv.length >= 3
  );
  const canSubmit = !!(formData.serviceType && formData.name && formData.phone && formData.address && formData.paymentMethod && cardValid);

  const bookingMutation = useCreateBooking({
    mutation: {
      onSuccess: (data) => {
        setSuccess(data.bookingRef || "Confirmed");
      }
    }
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    bookingMutation.mutate({ data: formData });
  };

  if (success) {
    return (
      <div className="container mx-auto px-5 md:px-20 py-24 text-center max-w-lg">
        <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-serif mb-4">Booking Confirmed!</h1>
        <p className="text-muted-foreground mb-4">Your pro has been requested. We will contact you shortly to confirm the exact time.</p>
        <div className="bg-muted p-4 rounded-lg font-mono mb-8">Ref: {success}</div>
        <Button onClick={() => window.location.href = "/"}>Return Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-5 md:px-20 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif text-primary mb-4">Hire a Pro</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Expert help for your plants and garden, right at your doorstep.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Service Cards */}
        <div className="space-y-4">
          <h2 className="text-2xl font-serif mb-6">Available Services</h2>
          {services.map(s => {
            const Icon = s.icon;
            const isSelected = formData.serviceType === s.id;
            return (
              <div
                key={s.id}
                onClick={() => setFormData({ ...formData, serviceType: s.id })}
                className={`cursor-pointer rounded-2xl border-2 overflow-hidden transition-all duration-200 ${s.topBorder} ${s.cardBg} ${
                  isSelected
                    ? "border-primary shadow-md ring-2 ring-primary/20"
                    : "border-border hover:border-primary/40 hover:shadow-md"
                }`}
              >
                <div className="p-5 flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${s.iconBg}`}>
                    <Icon className={s.iconColor} size={26} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-lg font-bold">{s.name}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{s.desc}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-sm ${s.priceColor}`}>{s.price}</span>
                    {isSelected && (
                      <div className="mt-1 text-xs font-bold text-primary flex items-center gap-1 justify-end">
                        <CheckCircle size={11} /> Selected
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Booking Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Book Service</CardTitle>
              <CardDescription>Fill out your details to request a professional.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Service</Label>
                  <Select value={formData.serviceType} onValueChange={v => setFormData({ ...formData, serviceType: v })} required>
                    <SelectTrigger><SelectValue placeholder="Select a service" /></SelectTrigger>
                    <SelectContent>
                      {services.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred Date</Label>
                    <Input type="date" value={formData.preferredDate} onChange={e => setFormData({ ...formData, preferredDate: e.target.value })} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} required placeholder="Street, Area" />
                </div>
                <div className="space-y-2">
                  <Label>Additional Notes (Optional)</Label>
                  <Textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows={3} />
                </div>

                <div className="space-y-2">
                  <Label>Payment Method <span className="text-destructive">*</span></Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethod: "cod" })}
                      className={`flex flex-col items-center gap-1.5 border rounded-lg py-3 text-sm font-medium transition-colors ${formData.paymentMethod === "cod" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
                    >
                      <Banknote size={18} /> Cash on Service
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethod: "online" })}
                      className={`flex flex-col items-center gap-1.5 border rounded-lg py-3 text-sm font-medium transition-colors ${formData.paymentMethod === "online" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
                    >
                      <CreditCard size={18} /> Online (Card)
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">No delivery charge applies to Hire a Pro bookings.</p>
                </div>

                {isOnline && (
                  <div className="space-y-2 border rounded-lg p-3 bg-muted/30">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Card Details</p>
                    <Input placeholder="Card Number" inputMode="numeric" maxLength={19} value={card.number} onChange={e => setCard({ ...card, number: e.target.value.replace(/[^\d\s]/g, "") })} required />
                    <Input placeholder="Name on Card" value={card.name} onChange={e => setCard({ ...card, name: e.target.value })} required />
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="MM/YY" maxLength={5} value={card.expiry} onChange={e => setCard({ ...card, expiry: e.target.value })} required />
                      <Input placeholder="CVV" inputMode="numeric" maxLength={4} value={card.cvv} onChange={e => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "") })} required />
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full mt-4" disabled={bookingMutation.isPending || !canSubmit}>
                  {bookingMutation.isPending ? "Requesting..." : "Request Booking"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
