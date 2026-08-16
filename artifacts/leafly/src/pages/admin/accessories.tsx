import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ImageUploader } from "@/components/admin-image-uploader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const TYPES = [
  { value: "pot", label: "Pots & Planters" },
  { value: "fertilizer", label: "Soil & Fertilisers" },
  { value: "tool", label: "Tools & Gadgets" },
  { value: "light", label: "Grow Lights" },
];

type AddonForm = {
  name: string;
  type: string;
  price: number;
  description: string;
  imageUrl: string;
};

const BLANK: AddonForm = { name: "", type: "pot", price: 0, description: "", imageUrl: "" };

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opts });
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return null;
  return res.json();
}

export default function AdminAccessories() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dialog, setDialog] = useState<null | "create" | number>(null);
  const [form, setForm] = useState<AddonForm>(BLANK);

  const { data: addons = [] } = useQuery({
    queryKey: ["admin-addons"],
    queryFn: () => apiFetch("/api/admin/addons"),
  });

  const refetch = () => qc.invalidateQueries({ queryKey: ["admin-addons"] });

  const createMutation = useMutation({
    mutationFn: (data: AddonForm) => apiFetch("/api/admin/addons", { method: "POST", body: JSON.stringify({ ...data, price: Number(data.price) }) }),
    onSuccess: () => { refetch(); setDialog(null); toast({ title: "Accessory created" }); },
    onError: () => toast({ title: "Error", description: "Failed to create accessory", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AddonForm }) =>
      apiFetch(`/api/admin/addons/${id}`, { method: "PATCH", body: JSON.stringify({ ...data, price: Number(data.price) }) }),
    onSuccess: () => { refetch(); setDialog(null); toast({ title: "Accessory updated" }); },
    onError: () => toast({ title: "Error", description: "Failed to update accessory", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/admin/addons/${id}`, { method: "DELETE" }),
    onSuccess: () => { refetch(); toast({ title: "Accessory deleted" }); },
  });

  const openCreate = () => { setForm(BLANK); setDialog("create"); };
  const openEdit = (addon: any) => {
    setForm({ name: addon.name ?? "", type: addon.type ?? "pot", price: addon.price ?? 0, description: addon.description ?? "", imageUrl: addon.imageUrl ?? "" });
    setDialog(addon.id);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dialog === "create") createMutation.mutate(form);
    else if (typeof dialog === "number") updateMutation.mutate({ id: dialog, data: form });
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const typeLabel = (t: string) => TYPES.find(x => x.value === t)?.label || t;

  return (
    <div className="px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Accessories Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">{addons.length} accessories in catalog</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus size={16} /> Add Accessory</Button>
      </div>

      <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-14">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {addons.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No accessories found.</TableCell></TableRow>
            )}
            {addons.map((addon: any) => (
              <TableRow key={addon.id} className="hover:bg-muted/30">
                <TableCell>
                  <img
                    src={addon.imageUrl || `https://placehold.co/40x40/4A7C3F/FFFFFF?text=${encodeURIComponent(addon.name[0])}`}
                    alt={addon.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                </TableCell>
                <TableCell>
                  <div className="font-medium">{addon.name}</div>
                  {addon.description && <div className="text-xs text-muted-foreground truncate max-w-[200px]">{addon.description}</div>}
                </TableCell>
                <TableCell>
                  <span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">{typeLabel(addon.type)}</span>
                </TableCell>
                <TableCell className="font-medium">Rs. {Number(addon.price).toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(addon)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      disabled={deleteMutation.isPending}
                      onClick={() => { if (confirm(`Delete "${addon.name}"?`)) deleteMutation.mutate(addon.id); }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialog !== null} onOpenChange={open => { if (!open) setDialog(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{dialog === "create" ? "Add Accessory" : "Edit Accessory"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Name *</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Price (Rs.) *</Label>
                <Input type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Image</Label>
              <ImageUploader value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isPending} className="flex-1">
                {isPending ? "Saving…" : dialog === "create" ? "Add Accessory" : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
