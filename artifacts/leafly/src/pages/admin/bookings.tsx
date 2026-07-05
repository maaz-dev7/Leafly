import { useListBookings, useUpdateBookingStatus } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminBookings() {
  const { data: bookings, refetch } = useListBookings();
  const updateMutation = useUpdateBookingStatus({ mutation: { onSuccess: () => refetch() } });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif mb-8">Service Bookings</h1>
      
      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ref</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Pref. Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings?.map(booking => (
              <TableRow key={booking.id}>
                <TableCell className="font-mono text-xs">{booking.bookingRef}</TableCell>
                <TableCell>{booking.name}<br/><span className="text-xs text-muted-foreground">{booking.phone}</span></TableCell>
                <TableCell className="capitalize">{booking.serviceType}</TableCell>
                <TableCell>{new Date(booking.preferredDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Select 
                    value={booking.status.toLowerCase()} 
                    onValueChange={(v) => updateMutation.mutate({ id: booking.id, data: { status: v }})}
                  >
                    <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
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