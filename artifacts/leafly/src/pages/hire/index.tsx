import { useState } from "react";
import { useCreateBooking } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const services = [
  { id: "gardener", name: "Gardener", price: "Rs. 500/hr", desc: "Basic maintenance, watering, pruning" },
  { id: "landscaper", name: "Landscaper", price: "from Rs. 5000", desc: "Full garden design and execution" },
  { id: "decorator", name: "Plant Decorator", price: "Rs. 2500/room", desc: "Indoor styling and plant placement" },
  { id: "consultant", name: "Plant Consultant", price: "Rs. 800/session", desc: "Expert advice on plant health" }
];

export default function HireAPro() {
  const [formData, setFormData] = useState({
    name: "", phone: "", city: "Lahore", serviceType: "", preferredDate: "", notes: ""
  });
  const [success, setSuccess] = useState<string | null>(null);

  const bookingMutation = useCreateBooking({
    mutation: {
      onSuccess: (data) => {
        setSuccess(data.bookingRef || "Confirmed");
      }
    }
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    bookingMutation.mutate({ data: formData });
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-lg">
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
    <div className="container mx-auto px-4 py-16">
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
                  <Label>Additional Notes (Optional)</Label>
                  <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={3} />
                </div>
                <Button type="submit" className="w-full mt-4" disabled={bookingMutation.isPending || !formData.serviceType}>
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