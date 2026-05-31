import { Link, useLocation } from "wouter";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Leaf, Menu, Moon, Sun, User } from "lucide-react";
import { useEffect, useState } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const cartItems = useCart(state => state.items);
  const { token, logout } = useAuth();
  const [location] = useLocation();

  useEffect(() => {
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDark]);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary">
            <Leaf className="h-6 w-6" />
            <span className="font-serif text-xl font-bold tracking-tight">Leafly</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/shop" className="hover:text-primary transition-colors">Shop Plants</Link>
            <Link href="/shop/accessories" className="hover:text-primary transition-colors">Accessories</Link>
            <Link href="/hire" className="hover:text-primary transition-colors">Hire a Pro</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setIsDark(!isDark)}>
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                  </span>
                )}
              </Button>
            </Link>

            {token ? (
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="default" size="sm" className="hidden md:flex">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-card border-t mt-auto py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 text-primary mb-4">
              <Leaf className="h-6 w-6" />
              <span className="font-serif text-xl font-bold">Leafly</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Bring nature home. Keep it thriving. The smart plant delivery and care platform for Pakistan.
            </p>
          </div>
          <div>
            <h4 className="font-serif font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/shop">Indoor Plants</Link></li>
              <li><Link href="/shop">Outdoor Plants</Link></li>
              <li><Link href="/shop/accessories">Accessories</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/hire">Hire a Gardener</Link></li>
              <li><Link href="/hire">Landscaping</Link></li>
              <li><Link href="/dashboard">Smart Care Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif font-semibold mb-4">Account</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/login">Sign In</Link></li>
              <li><Link href="/orders">Track Order</Link></li>
              <li><Link href="/admin">Admin Portal</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
