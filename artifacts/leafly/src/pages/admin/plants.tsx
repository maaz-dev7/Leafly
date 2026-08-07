import { useState } from "react";
import {
  useAdminListPlants,
  useAdminTogglePlant,
  useAdminDeletePlant,
  useAdminCreatePlant,
  useAdminUpdatePlant,
} from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type PlantForm = {
  name: string;
  scientificName: string;
  category: string;
  size: string;
  price: number;
  difficulty: string;
  imageUrl: string;
  description: string;
};

const BLANK: PlantForm = {
  name: "", scientificName: "", category: "Indoor", size: "", price: 0, difficulty: "Easy", imageUrl: "", description: "",
};

export default function AdminPlants() {
  const { data: plants = [], refetch } = useAdminListPlants();
  const toggleMutation = useAdminTogglePlant({ mutation: { onSuccess: () => refetch() } });
  const deleteMutation = useAdminDeletePlant({ mutation: { onSuccess: () => refetch() } });
  const createMutation = useAdminCreatePlant({ mutation: { onSuccess: () => { setDialog(null); refetch(); } } });
  const updateMutation = useAdminUpdatePlant({ mutation: { onSuccess: () => { setDialog(null); refetch(); } } });

  const [dialog, setDialog] = useState<null | "create" | number>(null);
  const [form, setForm] = useState<PlantForm>(BLANK);

  const openCreate = () => { setForm(BLANK); setDialog("create"); };
  const openEdit = (plant: any) => {
    setForm({
      name: plant.name ?? "",
      scientificName: plant.scientificName ?? "",
      category: plant.category ?? "Indoor",
      size: plant.size ?? "",
      price: plant.price ?? 0,
      difficulty: plant.difficulty ?? "Easy",
      imageUrl: plant.imageUrl ?? "",
      description: plant.description ?? "",
    });
    setDialog(plant.id);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, price: Number(form.price) };
    if (dialog === "create") {
      createMutation.mutate({ data } as any);
    } else if (typeof dialog === "number") {
      updateMutation.mutate({ id: dialog, data } as any);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Plant Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">{plants.length} plants in catalog</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus size={16} /> Add New Plant
        </Button>
      </div>

      <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-14">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Available</TableHead>
              <TableHead className="text-right w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plants.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  No plants found.
                </TableCell>
              </TableRow>
            )}
            {plants.map((plant: any) => (
              <TableRow key={plant.id} className="hover:bg-muted/30">
                <TableCell>
                  <img
                    src={plant.imageUrl || `https://placehold.co/40x40/4A7C3F/FFFFFF?text=${encodeURIComponent(plant.name[0])}`}
                    alt={plant.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                </TableCell>
                <TableCell>
                  <div className="font-medium">{plant.name}</div>
                  <div className="text-xs text-muted-foreground italic">{plant.scientificName}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{plant.category}</Badge>
                </TableCell>
                <TableCell>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    plant.difficulty === "Easy" ? "bg-[#4A7C3F]/15 text-[#1B3D2A]" :
                    plant.difficulty === "Medium" ? "bg-[#6B8F3E]/20 text-[#1B3D2A]" :
                    "bg-[#1B3D2A]/10 text-[#1B3D2A]"
                  }`}>{plant.difficulty}</span>
                </TableCell>
                <TableCell className="font-medium">Rs. {plant.price.toLocaleString()}</TableCell>
                <TableCell>
                  <Switch
                    checked={plant.isAvailable}
                    onCheckedChange={() => toggleMutation.mutate({ id: plant.id })}
                    disabled={toggleMutation.isPending}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost" size="icon"
                      onClick={() => openEdit(plant)}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        if (confirm(`Delete "${plant.name}"?`)) deleteMutation.mutate({ id: plant.id });
                      }}
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

      {/* Create / Edit Dialog */}
      <Dialog open={dialog !== null} onOpenChange={(open) => { if (!open) setDialog(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialog === "create" ? "Add New Plant" : "Edit Plant"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Scientific Name *</Label>
                <Input value={form.scientificName} onChange={e => setForm({ ...form, scientificName: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Indoor">Indoor</SelectItem>
                    <SelectItem value="Outdoor">Outdoor</SelectItem>
                    <SelectItem value="Succulents">Succulents</SelectItem>
                    <SelectItem value="Flowering">Flowering</SelectItem>
                    <SelectItem value="Air-Purifying">Air-Purifying</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={form.difficulty} onValueChange={v => setForm({ ...form, difficulty: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Price (Rs.) *</Label>
                <Input type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} required />
              </div>
              <div className="space-y-2">
                <Label>Size</Label>
                <Input placeholder="e.g. 18 inch" value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input placeholder="https://..." value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isPending} className="flex-1">
                {isPending ? "Saving…" : dialog === "create" ? "Add Plant" : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
