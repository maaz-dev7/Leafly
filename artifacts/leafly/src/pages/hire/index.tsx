import { useState } from "react";
import { useCreateBooking } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Banknote, CreditCard } from "lucide-react";

const services = [
  { id: "gardener", name: "Gardener", price: "Rs. 500/hr", desc: "Basic maintenance, watering, pruning" },
  { id: "landscaper", name: "Landscaper", price: "from Rs. 5000", desc: "Full garden design and execution" },
  { id: "decorator", name: "Plant Decorator", price: "Rs. 2500/room", desc: "Indoor styling and plant placement" },
  { id: "consultant", name: "Plant Consultant", price: "Rs. 800/session", desc: "Expert advice on plant health" }
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
          <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
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
        <div className="space-y-6">
          <h2 className="text-2xl font-serif mb-6">Available Services</h2>
          {services.map(s => (
            <Card key={s.id} className={`cursor-pointer transition-colors ${formData.serviceType === s.id ? 'border-primary bg-primary/5' : ''}`} onClick={() => setFormData({...formData, serviceType: s.id})}>
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <h3 className="font-serif text-lg font-bold">{s.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-primary">{s.price}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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
                  <Select value={formData.serviceType} onValueChange={v => setFormData({...formData, serviceType: v})} required>
                    <SelectTrigger><SelectValue placeholder="Select a service" /></SelectTrigger>
                    <SelectContent>
                      {services.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred Date</Label>
                    <Input type="date" value={formData.preferredDate} onChange={e => setFormData({...formData, preferredDate: e.target.value})} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required placeholder="Street, Area" />
                </div>
                <div className="space-y-2">
                  <Label>Additional Notes (Optional)</Label>
                  <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={3} />
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