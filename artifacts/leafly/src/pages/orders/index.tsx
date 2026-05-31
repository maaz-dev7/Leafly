import { useListOrders } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";

export default function Orders() {
  const { token } = useAuth();
  const { data: orders, isLoading } = useListOrders({ query: { enabled: !!token } });

  if (!token) {
    window.location.href = "/login";
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-serif text-primary mb-8">My Orders</h1>
      
      {isLoading ? (
        <div className="space-y-4">
          {[1,2].map(i => <div key={i} className="h-40 bg-muted animate-pulse rounded-lg"></div>)}
        </div>
      ) : (
        <div className="space-y-6">
          {orders?.map(order => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="bg-secondary/20 pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                    <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full uppercase tracking-wider">
                      {order.status}
                    </span>
                    <p className="text-sm font-bold mt-1">Rs. {order.total}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="mb-6">
                  <h4 className="font-medium mb-2">Items</h4>
                  <ul className="space-y-2">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.plantName} {item.variantColor ? `(${item.variantColor})` : ''}</span>
                        <span>Rs. {item.price * item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-muted p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Delivery Estimate</p>
                    <p className="text-sm text-muted-foreground">{order.deliveryEstimate || 'Calculating...'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Shipping To</p>
                    <p className="text-sm text-muted-foreground">{order.city}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {orders?.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              You haven't placed any orders yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}