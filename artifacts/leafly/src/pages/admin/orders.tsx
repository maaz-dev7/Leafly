import { useListOrders, useUpdateOrderStatus } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const STATUS_COLORS: Record<string, string> = {
  Confirmed: "bg-blue-100 text-blue-700",
  Packed: "bg-yellow-100 text-yellow-700",
  "Out for Delivery": "bg-orange-100 text-orange-700",
  Delivered: "bg-green-100 text-green-700",
};

export default function AdminOrders() {
  const { data: orders, isLoading, refetch } = useListOrders();
  const { toast } = useToast();

  const updateMutation = useUpdateOrderStatus({
    mutation: {
      onSuccess: () => {
        refetch();
        toast({ title: "Order status updated" });
      },
      onError: () => toast({ title: "Error", description: "Failed to update status", variant: "destructive" }),
    }
  });

  if (isLoading) return <div className="px-6 py-8 text-muted-foreground">Loading orders…</div>;

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Order Manager</h1>
        <p className="text-sm text-muted-foreground mt-1">{orders?.length ?? 0} orders total</p>
      </div>

      <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!orders || orders.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  No orders yet.
                </TableCell>
              </TableRow>
            )}
            {orders?.map(order => (
              <TableRow key={order.id} className="hover:bg-muted/30">
                <TableCell className="font-mono text-xs font-medium">#{order.id}</TableCell>
                <TableCell>
                  <div className="font-medium text-sm">{order.customerName}</div>
                  <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                </TableCell>
                <TableCell className="text-sm">{order.city}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs capitalize">
                    {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online"}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium text-sm">Rs. {order.total?.toLocaleString()}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Select
                    value={order.status}
                    onValueChange={(v) => updateMutation.mutate({ id: order.id, data: { status: v } })}
                    disabled={updateMutation.isPending}
                  >
                    <SelectTrigger className={`w-[170px] h-8 text-xs font-medium border-0 ${STATUS_COLORS[order.status] ?? ""}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Confirmed">Confirmed</SelectItem>
                      <SelectItem value="Packed">Packed</SelectItem>
                      <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
