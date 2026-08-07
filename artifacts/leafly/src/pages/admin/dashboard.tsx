import { useGetAdminDashboard, useAdminLogin } from "@workspace/api-client-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Leaf, ShoppingBag, CalendarDays, Users, TrendingUp } from "lucide-react";

export function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { adminLogin } = useAuth();

  const loginMutation = useAdminLogin({
    mutation: {
      onSuccess: (data: any) => {
        adminLogin(data.token);
        window.location.href = "/admin";
      }
    }
  });

  return (
    <div className="container mx-auto px-4 py-16 max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
          <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <Button
            onClick={() => loginMutation.mutate({ data: { username, password } })}
            disabled={loginMutation.isPending}
            className="w-full"
          >
            {loginMutation.isPending ? "Logging in…" : "Login"}
          </Button>
          {loginMutation.isError && (
            <p className="text-sm text-destructive text-center">Invalid credentials. Try again.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDashboard() {
  const { data, isLoading, isError } = useGetAdminDashboard();

  if (isLoading) return <div className="px-6 py-8 text-muted-foreground">Loading dashboard…</div>;
  if (isError || !data) return <div className="px-6 py-8 text-destructive">Failed to load dashboard. Please refresh.</div>;

  const stats = [
    { label: "Total Plants", value: data.totalPlants, icon: Leaf, color: "text-[#4A7C3F]" },
    { label: "Total Orders", value: data.totalOrders, icon: ShoppingBag, color: "text-[#1B3D2A]" },
    { label: "Bookings", value: data.totalBookings, icon: CalendarDays, color: "text-[#6B8F3E]" },
    { label: "Customers", value: data.totalUsers, icon: Users, color: "text-[#4A7C3F]" },
  ];

  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Overview</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">{label}</p>
                <Icon size={18} className={color} />
              </div>
              <p className="text-3xl font-bold">{value ?? 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue card */}
      <Card className="mb-8">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <TrendingUp size={18} className="text-[#4A7C3F]" />
          </div>
          <p className="text-3xl font-bold">Rs. {(data.revenueTotal ?? 0).toLocaleString()}</p>
        </CardContent>
      </Card>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!data.recentOrders || data.recentOrders.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground text-sm">No orders yet</TableCell>
                  </TableRow>
                ) : data.recentOrders.map((o: any) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">#{o.id}</TableCell>
                    <TableCell className="text-sm">{o.customerName}</TableCell>
                    <TableCell className="text-sm">Rs. {o.total?.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{o.status}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent bookings */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ref</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!data.recentBookings || data.recentBookings.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground text-sm">No bookings yet</TableCell>
                  </TableRow>
                ) : data.recentBookings.map((b: any) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-xs">{b.bookingRef}</TableCell>
                    <TableCell className="text-sm">{b.name}</TableCell>
                    <TableCell className="text-sm capitalize">{b.serviceType}</TableCell>
                    <TableCell>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">{b.status}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
