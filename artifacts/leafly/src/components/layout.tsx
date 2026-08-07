import { Link, useLocation } from "wouter";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Moon, Sun, User, LayoutDashboard, ClipboardList, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Layout({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(() =>
    typeof window !== "undefined" && document.documentElement.classList.contains("dark")
  );
  const cartItems = useCart(state => state.items);
  const { token, logout } = useAuth();
  const [location] = useLocation();

  useEffect(() => {
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDark]);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-primary shrink-0">
            <img
              src="/leafly-horizontal.png"
              alt="Leafly"
              className="h-10 w-auto max-w-[150px] object-contain"
            />
          </Link>

          {/* Main Nav */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link href="/shop">
              <div className={`px-3 py-2 rounded-lg transition-colors hover:text-primary hover:bg-primary/5 ${location === "/shop" ? "text-primary bg-primary/5" : "text-foreground/70"}`}>
                Shop Plants
              </div>
            </Link>
            <Link href="/shop/accessories">
              <div className={`px-3 py-2 rounded-lg transition-colors hover:text-primary hover:bg-primary/5 ${location === "/shop/accessories" ? "text-primary bg-primary/5" : "text-foreground/70"}`}>
                Accessories
              </div>
            </Link>
            <Link href="/hire">
              <div className={`px-3 py-2 rounded-lg transition-colors hover:text-primary hover:bg-primary/5 ${location === "/hire" ? "text-primary bg-primary/5" : "text-foreground/70"}`}>
                Hire a Pro
              </div>
            </Link>
            {token && (
              <Link href="/dashboard">
                <div className={`px-3 py-2 rounded-lg transition-colors hover:text-primary hover:bg-primary/5 ${location === "/dashboard" ? "text-primary bg-primary/5" : "text-foreground/70"}`}>
                  Dashboard
                </div>
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsDark(!isDark)} className="shrink-0">
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative shrink-0">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {token ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                      <LayoutDashboard size={15} /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center gap-2 cursor-pointer">
                      <ClipboardList size={15} /> My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="flex items-center gap-2 text-destructive cursor-pointer">
                    <LogOut size={15} /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-card border-t mt-auto py-16">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex text-primary mb-4">
              <img
                src="/leafly-vertical.png"
                alt="Leafly — bring nature home"
                className="h-36 w-auto max-w-[140px] object-contain object-left"
              />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Pakistan's smart plant delivery & care platform. Discover the perfect plants for your space and climate.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/shop?category=Indoor" className="hover:text-primary transition-colors">Indoor Plants</Link></li>
              <li><Link href="/shop?category=Outdoor" className="hover:text-primary transition-colors">Outdoor Plants</Link></li>
              <li><Link href="/shop/accessories" className="hover:text-primary transition-colors">Accessories</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/hire" className="hover:text-primary transition-colors">Hire a Gardener</Link></li>
              <li><Link href="/hire" className="hover:text-primary transition-colors">Plant Consultation</Link></li>
              <li><Link href="/hire" className="hover:text-primary transition-colors">Landscaping</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary transition-colors">Smart Care Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Account</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/login" className="hover:text-primary transition-colors">Login</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
              <li><Link href="/orders" className="hover:text-primary transition-colors">Track Order</Link></li>
              <li><Link href="/admin" className="hover:text-primary transition-colors">Admin Dashboard</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Leafly Pakistan. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
