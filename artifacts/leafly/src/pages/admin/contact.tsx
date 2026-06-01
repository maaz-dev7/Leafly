import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Clock, Save } from "lucide-react";

interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  hours: string;
}

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opts });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function AdminContact() {
  const { toast } = useToast();
  const [form, setForm] = useState<ContactInfo>({ email: "", phone: "", address: "", hours: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch("/api/admin/contact")
      .then(data => setForm(data))
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch("/api/admin/contact", { method: "PATCH", body: JSON.stringify(form) });
      toast({ title: "Contact details saved!", description: "Changes are now visible to customers." });
    } catch {
      toast({ title: "Error", description: "Failed to save contact details.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="px-6 py-8 text-muted-foreground">Loading...</div>;

  return (
    <div className="px-6 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Contact Details</h1>
        <p className="text-sm text-muted-foreground mt-1">
          These details are shown to customers on the website. Update them anytime.
        </p>
      </div>

      {/* Preview */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-8">
        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-4">Customer Preview</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Mail size={16} className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium text-sm">{form.email || "—"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone size={16} className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="font-medium text-sm">{form.phone || "—"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Office</p>
              <p className="font-medium text-sm">{form.address || "—"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock size={16} className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Hours</p>
              <p className="font-medium text-sm">{form.hours || "—"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-card border rounded-2xl p-6">
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Mail size={14} /> Email Address</Label>
            <Input
              type="email"
              placeholder="info@leafly.pk"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Phone size={14} /> Phone / WhatsApp Number</Label>
            <Input
              placeholder="+92 300 123 4567"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><MapPin size={14} /> Office / Store Address</Label>
            <Input
              placeholder="123 Garden Street, Model Town, Lahore"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Clock size={14} /> Business Hours</Label>
            <Input
              placeholder="Mon–Sat, 9am–6pm PKT"
              value={form.hours}
              onChange={e => setForm({ ...form, hours: e.target.value })}
            />
          </div>
          <Button type="submit" disabled={saving} className="w-full gap-2">
            <Save size={16} /> {saving ? "Saving..." : "Save Contact Details"}
          </Button>
        </form>
      </div>
    </div>
  );
}
