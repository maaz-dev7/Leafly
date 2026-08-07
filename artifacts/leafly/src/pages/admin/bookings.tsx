import { useState } from "react";
import { useListBookings, useUpdateBookingStatus } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, MapPin, CalendarDays, CreditCard, ClipboardList } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-[#6B8F3E]/20 text-[#1B3D2A]",
  confirmed: "bg-[#1B3D2A]/10 text-[#1B3D2A]",
  completed: "bg-[#4A7C3F]/20 text-[#1B3D2A]",
  cancelled: "bg-[#1B3D2A]/10 text-[#1B3D2A]",
};

const SERVICE_LABELS: Record<string, string> = {
  gardener: "Hire a Gardener",
  landscaping: "Landscaping",
  consultation: "Plant Consultation",
  "plant-decorator": "Plant Decorator",
};

export default function AdminBookings() {
  const { data: bookings, isLoading, refetch } = useListBookings();
  const { toast } = useToast();
  const [expandedId, setExpandedId] = useState<number | null>(null);

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
        <p className="text-sm text-muted-foreground mt-1">
          {bookings?.length ?? 0} bookings total · click a row to see full details
        </p>
      </div>

      <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-8"></TableHead>
              <TableHead>Ref</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Pref. Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!bookings || bookings.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No bookings yet.
                </TableCell>
              </TableRow>
            )}
            {bookings?.map(booking => {
              const isOpen = expandedId === booking.id;
              const statusKey = booking.status.toLowerCase();

              return (
                <>
                  {/* Main row */}
                  <TableRow
                    key={booking.id}
                    className="hover:bg-muted/30 cursor-pointer"
                    onClick={() => setExpandedId(isOpen ? null : booking.id)}
                  >
                    <TableCell className="pl-3 pr-0 text-muted-foreground">
                      {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-medium">{booking.bookingRef}</TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{booking.name}</div>
                      <div className="text-xs text-muted-foreground">{booking.phone}</div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {SERVICE_LABELS[booking.serviceType] ?? booking.serviceType}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(booking.preferredDate).toLocaleDateString("en-PK", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </TableCell>
                    <TableCell onClick={e => e.stopPropagation()}>
                      <Select
                        value={statusKey}
                        onValueChange={(v) => updateMutation.mutate({ id: booking.id, data: { status: v } })}
                        disabled={updateMutation.isPending}
                      >
                        <SelectTrigger className={`w-[130px] h-8 text-xs font-medium border-0 ${STATUS_COLORS[statusKey] ?? ""}`}>
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

                  {/* Expanded detail row */}
                  {isOpen && (
                    <TableRow key={`${booking.id}-detail`} className="bg-muted/20 hover:bg-muted/20">
                      <TableCell colSpan={6} className="py-4 px-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                          {/* Address */}
                          <div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                              <MapPin size={12} /> Service Location
                            </div>
                            <p className="text-sm font-medium">{booking.name}</p>
                            {(booking as any).address
                              ? <p className="text-sm text-muted-foreground">{(booking as any).address}</p>
                              : <p className="text-sm text-muted-foreground italic">No address provided</p>
                            }
                            <p className="text-sm text-muted-foreground">{(booking as any).city || "—"}</p>
                            <p className="text-sm text-muted-foreground">{booking.phone}</p>
                          </div>

                          {/* Date & payment */}
                          <div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                              <CalendarDays size={12} /> Schedule &amp; Payment
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Preferred date</span>
                                <span className="font-medium">
                                  {new Date(booking.preferredDate).toLocaleDateString("en-PK", {
                                    weekday: "short", day: "numeric", month: "long", year: "numeric"
                                  })}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Booked on</span>
                                <span>{new Date((booking as any).createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 mt-4">
                              <CreditCard size={12} /> Payment
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {(booking as any).paymentMethod === "cod" ? "Cash on Delivery" : "Online"}
                            </Badge>
                          </div>

                          {/* Notes */}
                          <div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                              <ClipboardList size={12} /> Customer Notes
                            </div>
                            {(booking as any).notes
                              ? <p className="text-sm text-muted-foreground leading-relaxed">{(booking as any).notes}</p>
                              : <p className="text-sm text-muted-foreground italic">No notes left by customer.</p>
                            }
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
