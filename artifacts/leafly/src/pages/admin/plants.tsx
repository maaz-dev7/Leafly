import { useState } from "react";
import { useAdminListPlants, useAdminTogglePlant, useAdminDeletePlant, useAdminCreatePlant, Plant } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";

export default function AdminPlants() {
  const { data: plants, refetch } = useAdminListPlants();
  const toggleMutation = useAdminTogglePlant({ mutation: { onSuccess: () => refetch() } });
  const deleteMutation = useAdminDeletePlant({ mutation: { onSuccess: () => refetch() } });
  const createMutation = useAdminCreatePlant({ mutation: { onSuccess: () => { setOpen(false); refetch(); } } });

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "", scientificName: "", category: "Indoor", size: "", price: 0, difficulty: "Easy", imageUrl: "", description: ""
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ data: { ...formData, price: Number(formData.price) } });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif">Plant Manager</h1>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add New Plant</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Plant</DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Scientific Name</Label>
                  <Input value={formData.scientificName} onChange={e => setFormData({...formData, scientificName: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Indoor">Indoor</SelectItem>
                      <SelectItem value="Outdoor">Outdoor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={formData.difficulty} onValueChange={v => setFormData({...formData, difficulty: v})}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Price (Rs.)</Label>
                  <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} required />
                </div>
                <div className="space-y-2">
                  <Label>Size (Optional)</Label>
                  <Input value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <Button type="submit" disabled={createMutation.isPending}>Save Plant</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Available</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plants?.map(plant => (
              <TableRow key={plant.id}>
                <TableCell>
                  <img src={plant.imageUrl || "https://placehold.co/40x40/1D9E75/white"} alt={plant.name} className="w-10 h-10 rounded object-cover" />
                </TableCell>
                <TableCell className="font-medium">{plant.name}</TableCell>
                <TableCell>{plant.category}</TableCell>
                <TableCell>Rs. {plant.price}</TableCell>
                <TableCell>
                  <Switch 
                    checked={plant.isAvailable} 
                    onCheckedChange={() => toggleMutation.mutate({ id: plant.id })} 
                    disabled={toggleMutation.isPending}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => {
                    if(confirm('Delete plant?')) deleteMutation.mutate({ id: plant.id });
                  }}>
                    <Trash2 size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}