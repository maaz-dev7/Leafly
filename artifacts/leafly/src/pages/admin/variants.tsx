import { useListVariants, useAdminUpdateVariant } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminVariants() {
  const { data: variants, refetch } = useListVariants();
  const updateMutation = useAdminUpdateVariant({ mutation: { onSuccess: () => refetch() } });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-serif mb-8">Adenium Color Variants</h1>
      
      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Color</TableHead>
              <TableHead>Price (Rs)</TableHead>
              <TableHead>Available</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants?.map(variant => (
              <TableRow key={variant.id}>
                <TableCell className="font-medium">{variant.color}</TableCell>
                <TableCell>
                  <Input 
                    type="number" 
                    defaultValue={variant.price} 
                    className="w-24 h-8"
                    onBlur={(e) => updateMutation.mutate({ id: variant.id, data: { price: parseInt(e.target.value) }})}
                  />
                </TableCell>
                <TableCell>
                  <Switch 
                    checked={variant.isAvailable} 
                    onCheckedChange={(c) => updateMutation.mutate({ id: variant.id, data: { isAvailable: c }})}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}