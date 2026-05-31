import { useGetAdminDashboard, useAdminLogin } from "@workspace/api-client-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
          <Button onClick={() => loginMutation.mutate({ data: { username, password } })} className="w-full">Login</Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDashboard() {
  const { adminToken } = useAuth();
  const [, setLocation] = useLocation();
  const { data, isLoading, isError } = useGetAdminDashboard();

  if (!adminToken) {
    setLocation("/admin/login");
    return null;
  }

  if (isLoading) return <div className="container mx-auto px-4 py-8">Loading...</div>;
  if (isError || !data) return <div className="container mx-auto px-4 py-8">Failed to load dashboard.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader><CardTitle>Total Plants</CardTitle></CardHeader>
          <CardContent><p className="text-2xl">{data.totalPlants}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Orders</CardTitle></CardHeader>
          <CardContent><p className="text-2xl">{data.totalOrders}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Revenue</CardTitle></CardHeader>
          <CardContent><p className="text-2xl">Rs. {data.revenueTotal || 0}</p></CardContent>
        </Card>
      </div>
    </div>
  );
}
