import { useState } from "react";
import { useListOrders, getListOrdersQueryKey, useGetOrder, getGetOrderQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { Package, Truck, CheckCircle, Clock, ChevronRight, ShoppingBag, Search } from "lucide-react";

const STATUS_STEPS = ["confirmed", "packed", "out for delivery", "delivered"];

const STATUS_STEP_LABELS: Record<string, string> = {
  "confirmed":       "Confirmed",
  "packed":          "Packed",
  "out for delivery": "Out for Delivery",
  "delivered":       "Delivered",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  confirmed:          { label: "Confirmed",       color: "text-[#1B3D2A]", bg: "bg-[#1B3D2A]/10",  icon: CheckCircle },
  packed:             { label: "Packed",          color: "text-[#4A7C3F]", bg: "bg-[#4A7C3F]/15",  icon: Package },
  "out for delivery": { label: "Out for Delivery", color: "text-[#6B8F3E]", bg: "bg-[#6B8F3E]/20",  icon: Truck },
  delivered:          { label: "Delivered",       color: "text-[#1B3D2A]", bg: "bg-[#4A7C3F]/25",  icon: CheckCircle },
};

function StatusBar({ status }: { status: string }) {
  const currentIdx = STATUS_STEPS.indexOf(status.toLowerCase());
  return (
    <div className="flex items-center gap-0 mt-4 mb-1">
      {STATUS_STEPS.map((step, idx) => {
        const done = idx <= currentIdx;
        const active = idx === currentIdx;
        return (
          <div key={step} className="flex items-center flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
              done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            } ${active ? "ring-2 ring-primary ring-offset-2" : ""}`}>
              {done ? "✓" : idx + 1}
            </div>
            {idx < STATUS_STEPS.length - 1 && (
              <div className={`h-1 flex-1 transition-colors ${done && idx < currentIdx ? "bg-primary" : "bg-muted"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({ order }: { order: any }) {
  const statusKey = order.status?.toLowerCase() || "pending";
  const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;

  return (
    <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Order ID</p>
          <p className="font-bold text-lg">#{String(order.id).padStart(5, "0")}</p>
        </div>
        <div className="text-center hidden sm:block">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Placed On</p>
          <p className="font-medium">{new Date(order.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total</p>
          <p className="font-bold text-primary text-lg">Rs. {Number(order.total).toLocaleString()}</p>
        </div>
      </div>

      {/* Status bar */}
      <div className="px-6 pt-5 pb-2">
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.color}`}>
            <Icon size={12} />
            {cfg.label}
          </span>
        </div>
        <StatusBar status={statusKey} />
        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground px-0.5">
          {STATUS_STEPS.map(s => (
            <span key={s} className="capitalize text-center leading-tight" style={{ width: `${100 / STATUS_STEPS.length}%` }}>{STATUS_STEP_LABELS[s]}</span>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="px-6 py-4 border-t mt-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Items Ordered</p>
        <div className="space-y-2">
          {order.items.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">{item.quantity}×</span>
                </div>
                <span className="font-medium">
                  {item.plantName}
                  {item.variantColor && <span className="text-muted-foreground font-normal"> ({item.variantColor})</span>}
                </span>
              </div>
              <span className="font-semibold">Rs. {(Number(item.price) * item.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery info */}
      <div className="mx-6 mb-5 bg-muted/40 rounded-xl p-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Truck size={16} className="text-primary" />
          <div>
            <p className="font-medium">Delivering to {order.city}</p>
            <p className="text-muted-foreground text-xs">{order.deliveryEstimate || "Estimate being calculated"}</p>
          </div>
        </div>
        <ChevronRight size={16} className="text-muted-foreground" />
      </div>
    </div>
  );
}

function OrderTracker() {
  const [orderIdInput, setOrderIdInput] = useState("");
  const [lookupId, setLookupId] = useState<number | null>(null);
  const [searchKey, setSearchKey] = useState(0);
  const [notFound, setNotFound] = useState(false);

  const { data: order, isFetching, isError, refetch } = useGetOrder(lookupId ?? 0, {
    query: {
      enabled: lookupId !== null,
      retry: false,
      staleTime: 0,
      refetchInterval: 20_000,
      queryKey: [...getGetOrderQueryKey(lookupId ?? 0), searchKey],
    },
  });

  const onTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(orderIdInput.replace(/\D/g, ""), 10);
    if (!id || Number.isNaN(id)) {
      setNotFound(true);
      setLookupId(null);
      return;
    }
    setNotFound(false);
    setSearchKey(k => k + 1);
    setLookupId(id);
  };

  return (
    <div className="mb-10 bg-muted/40 border border-border/60 rounded-2xl p-6">
      <h2 className="font-serif text-xl font-bold mb-1">Track an Order by ID</h2>
      <p className="text-muted-foreground text-sm mb-4">Enter an Order ID to check its current status.</p>
      <form onSubmit={onTrack} className="flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="orderIdInput">Order ID</Label>
          <Input
            id="orderIdInput"
            placeholder="e.g. 00042 or 42"
            value={orderIdInput}
            onChange={e => setOrderIdInput(e.target.value)}
            className="h-11"
          />
        </div>
        <Button type="submit" className="h-11" disabled={isFetching}>
          <Search size={16} className="mr-2" />
          {isFetching ? "Searching..." : "Track Order"}
        </Button>
      </form>

      {lookupId !== null && isError && (
        <p className="mt-4 text-sm text-destructive font-medium">
          No order found with ID #{String(lookupId).padStart(5, "0")}. Please double-check the Order ID and try again.
        </p>
      )}
      {notFound && (
        <p className="mt-4 text-sm text-destructive font-medium">Please enter a valid Order ID.</p>
      )}
      {order && !isFetching && (
        <div className="mt-6">
          <OrderCard order={order} />
        </div>
      )}
    </div>
  );
}

export default function Orders() {
  const { token } = useAuth();
  const [, setLocation] = useLocation();
  const { data: orders, isLoading } = useListOrders(undefined, { query: { enabled: !!token, queryKey: getListOrdersQueryKey() } });

  if (!token) {
    return (
      <div className="container mx-auto px-5 md:px-20 py-24 text-center max-w-md">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="text-primary" size={32} />
        </div>
        <h1 className="text-3xl font-serif font-bold mb-3">Track Your Orders</h1>
        <p className="text-muted-foreground mb-2">
          Sign in to your account to view your order history and track deliveries in real-time.
        </p>
        <p className="text-muted-foreground mb-8 text-sm">
          Don't have an account yet?{" "}
          <Link href="/signup" className="text-primary font-semibold hover:underline">Sign up free</Link>
          {" "}— it only takes a minute.
        </p>
        <div className="flex flex-col gap-3">
          <Button size="lg" className="w-full" onClick={() => setLocation("/login")}>Sign In to Track Orders</Button>
          <Button size="lg" variant="outline" className="w-full" onClick={() => setLocation("/signup")}>Create Free Account</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-5 md:px-20 py-12 max-w-3xl">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">My Orders</h1>
          <p className="text-muted-foreground mt-1">Track your deliveries and view order history</p>
        </div>
        <Link href="/shop">
          <Button variant="outline" size="sm">Shop More Plants</Button>
        </Link>
      </div>

      <OrderTracker />

      {isLoading ? (
        <div className="space-y-5">
          {[1,2].map(i => <div key={i} className="h-52 bg-muted animate-pulse rounded-2xl" />)}
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center border-2 border-dashed rounded-2xl">
          <div className="text-5xl mb-4">🌱</div>
          <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
          <p className="text-muted-foreground mb-6">Once you place an order, you'll be able to track it right here.</p>
          <Link href="/shop">
            <Button>Browse Plants</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
