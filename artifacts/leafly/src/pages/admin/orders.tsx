import { useState } from "react";
import { useListOrders, useUpdateOrderStatus } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, MapPin, Package } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  Confirmed: "bg-blue-100 text-blue-700",
  Packed: "bg-yellow-100 text-yellow-700",
  "Out for Delivery": "bg-orange-100 text-orange-700",
  Delivered: "bg-green-100 text-green-700",
};

type OrderItem = {
  plantId?: number | null;
  plantName: string;
  variantColor?: string | null;
  quantity: number;
  price: number;
  addons?: { name: string; price: number }[];
};

export default function AdminOrders() {
  const { data: orders, isLoading, refetch } = useListOrders();
  const { toast } = useToast();
  const [expandedId, setExpandedId] = useState<number | null>(null);

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
        <p className="text-sm text-muted-foreground mt-1">{orders?.length ?? 0} orders total · click a row to see items &amp; address</p>
      </div>

      <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-8"></TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Customer</TableHead>
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
            {orders?.map(order => {
              const isOpen = expandedId === order.id;
              const items = (order.items ?? []) as OrderItem[];

              return (
                <>
                  {/* Main row — clickable to expand */}
                  <TableRow
                    key={order.id}
                    className="hover:bg-muted/30 cursor-pointer"
                    onClick={() => setExpandedId(isOpen ? null : order.id)}
                  >
                    <TableCell className="pl-3 pr-0 text-muted-foreground">
                      {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-medium">#{order.id}</TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{order.customerName}</div>
                      <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-sm">Rs. {order.total?.toLocaleString()}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell onClick={e => e.stopPropagation()}>
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

                  {/* Expanded detail row */}
                  {isOpen && (
                    <TableRow key={`${order.id}-detail`} className="bg-muted/20 hover:bg-muted/20">
                      <TableCell colSpan={7} className="py-4 px-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                          {/* Delivery address */}
                          <div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                              <MapPin size={12} /> Delivery Address
                            </div>
                            <p className="text-sm font-medium">{order.customerName}</p>
                            <p className="text-sm text-muted-foreground">{(order as any).address || "—"}</p>
                            <p className="text-sm text-muted-foreground">{order.city}</p>
                            <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                            {(order as any).deliveryEstimate && (
                              <p className="text-xs text-primary mt-1">{(order as any).deliveryEstimate}</p>
                            )}
                          </div>

                          {/* Items ordered */}
                          <div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                              <Package size={12} /> Items Ordered
                            </div>
                            <div className="space-y-2">
                              {items.length === 0 && (
                                <p className="text-sm text-muted-foreground">No items recorded.</p>
                              )}
                              {items.map((item, i) => (
                                <div key={i} className="flex items-start justify-between gap-2 text-sm">
                                  <div>
                                    <span className="font-medium">{item.plantName}</span>
                                    {item.variantColor && (
                                      <span className="text-xs text-muted-foreground ml-1">({item.variantColor})</span>
                                    )}
                                    <span className="text-muted-foreground ml-2">× {item.quantity}</span>
                                    {/* Addons */}
                                    {item.addons && item.addons.length > 0 && (
                                      <div className="mt-0.5 ml-2 space-y-0.5">
                                        {item.addons.map((a, j) => (
                                          <div key={j} className="text-xs text-muted-foreground flex justify-between gap-4">
                                            <span>+ {a.name}</span>
                                            <span>Rs. {a.price?.toLocaleString()}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <span className="font-medium shrink-0">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                              ))}
                              {items.length > 0 && (
                                <div className="border-t pt-2 flex justify-between text-sm font-semibold">
                                  <span>Total</span>
                                  <span>Rs. {order.total?.toLocaleString()}</span>
                                </div>
                              )}
                            </div>
                          </div>

                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
