import { useState, useEffect } from "react";
import { useAdminListPlants, useAdminUpdatePlant } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminPrices() {
  const { data: plants } = useAdminListPlants();
  const updateMutation = useAdminUpdatePlant();
  
  const [prices, setPrices] = useState<Record<number, number>>({});

  useEffect(() => {
    if (plants) {
      const initial: Record<number, number> = {};
      plants.forEach(p => initial[p.id] = p.price);
      setPrices(initial);
    }
  }, [plants]);

  const handleSave = (id: number) => {
    updateMutation.mutate({ id, data: { price: prices[id] } });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif mb-8">Price Editor</h1>
      
      <div className="border rounded-lg bg-card max-w-3xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plant Name</TableHead>
              <TableHead className="w-[150px]">Current Price</TableHead>
              <TableHead className="w-[100px] text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plants?.map(plant => (
              <TableRow key={plant.id}>
                <TableCell className="font-medium">{plant.name}</TableCell>
                <TableCell>
                  <Input 
                    type="number" 
                    value={prices[plant.id] || ''} 
                    onChange={e => setPrices({...prices, [plant.id]: parseInt(e.target.value) || 0})}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" onClick={() => handleSave(plant.id)}>Save</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}