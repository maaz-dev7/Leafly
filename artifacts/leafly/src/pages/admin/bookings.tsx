import { useListBookings, useUpdateBookingStatus } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminBookings() {
  const { data: bookings, isLoading, refetch } = useListBookings();
  const { toast } = useToast();

  const updateMutation = useUpdateBookingStatus({
    mutation: {
      onSuccess: () => {
        refetch();
        toast({ title: "Booking status updated" });
      },
      onError: () => toast({ title: "Error", description: "Failed to update status", variant: "destructive" }),
    }
  });

  if (isLoading) return <div className="px-6 py-8 text-muted-foreground">Loading bookings…</div>;

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Service Bookings</h1>
        <p className="text-sm text-muted-foreground mt-1">{bookings?.length ?? 0} bookings total</p>
      </div>

      <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Ref</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Pref. Date</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!bookings || bookings.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  No bookings yet.
                </TableCell>
              </TableRow>
            )}
            {bookings?.map(booking => (
              <TableRow key={booking.id} className="hover:bg-muted/30">
                <TableCell className="font-mono text-xs">{booking.bookingRef}</TableCell>
                <TableCell>
                  <div className="font-medium text-sm">{booking.name}</div>
                  <div className="text-xs text-muted-foreground">{booking.phone}</div>
                </TableCell>
                <TableCell className="capitalize text-sm">{booking.serviceType}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[160px] truncate">{(booking as any).address || "—"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(booking.preferredDate).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-xs capitalize text-muted-foreground">
                  {(booking as any).paymentMethod === "cod" ? "Cash" : (booking as any).paymentMethod || "—"}
                </TableCell>
                <TableCell>
                  <Select
                    value={booking.status.toLowerCase()}
                    onValueChange={(v) => updateMutation.mutate({ id: booking.id, data: { status: v } })}
                    disabled={updateMutation.isPending}
                  >
                    <SelectTrigger className={`w-[130px] h-8 text-xs font-medium border-0 ${STATUS_COLORS[booking.status.toLowerCase()] ?? ""}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
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
