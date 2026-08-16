import { Link, useLocation } from "wouter";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Moon, Sun, User, LayoutDashboard, ClipboardList, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { PageTransition } from "@/components/motion";
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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDark]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <header className={`sticky top-0 z-50 w-full border-b border-[#6B8F3E]/20 bg-[#F7FAF4]/95 text-[#1B3D2A] backdrop-blur-xl transition-all duration-300 ${
        isScrolled ? "shadow-xl shadow-[#1B3D2A]/10" : "shadow-sm"
      }`}>
        <div className={`container mx-auto flex items-center justify-between px-4 transition-[height] duration-300 ${
          isScrolled ? "h-14" : "h-16"
        }`}>
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0 rounded-xl px-1.5 py-1 transition-colors hover:bg-white/55">
            <img
              src="/leafly-brand.png"
              alt="Leafly"
              className="h-10 w-auto max-w-[150px] object-contain"
            />
          </Link>

          {/* Main Nav */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-[#1B3D2A]">
            <Link href="/shop">
              <div className={`px-3 py-2 rounded-lg transition-colors hover:bg-[#E8F1E4] ${location === "/shop" ? "text-[#1B3D2A] bg-[#E8F1E4]" : "text-[#1B3D2A]/75"}`}>
                Shop Plants
              </div>
            </Link>
            <Link href="/shop/accessories">
              <div className={`px-3 py-2 rounded-lg transition-colors hover:bg-[#E8F1E4] ${location === "/shop/accessories" ? "text-[#1B3D2A] bg-[#E8F1E4]" : "text-[#1B3D2A]/75"}`}>
                Accessories
              </div>
            </Link>
            <Link href="/hire">
              <div className={`px-3 py-2 rounded-lg transition-colors hover:bg-[#E8F1E4] ${location === "/hire" ? "text-[#1B3D2A] bg-[#E8F1E4]" : "text-[#1B3D2A]/75"}`}>
                Hire a Pro
              </div>
            </Link>
            {token && (
              <Link href="/dashboard">
                <div className={`px-3 py-2 rounded-lg transition-colors hover:bg-[#E8F1E4] ${location === "/dashboard" ? "text-[#1B3D2A] bg-[#E8F1E4]" : "text-[#1B3D2A]/75"}`}>
                  Dashboard
                </div>
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" onClick={() => setIsDark(!isDark)} className="shrink-0 text-[#1B3D2A] hover:bg-[#E8F1E4] hover:text-[#1B3D2A]">
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative shrink-0 text-[#1B3D2A] hover:bg-[#E8F1E4] hover:text-[#1B3D2A]">
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
                   <Button variant="ghost" size="icon" className="shrink-0 text-[#1B3D2A] hover:bg-[#E8F1E4] hover:text-[#1B3D2A]">
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
                   <Button variant="ghost" size="sm" className="text-[#1B3D2A] hover:bg-[#E8F1E4] hover:text-[#1B3D2A]">Sign In</Button>
                </Link>
                <Link href="/signup">
                   <Button size="sm" className="border border-[#6B8F3E]/25 bg-[#DCEBD8] text-[#1B3D2A] shadow-none hover:bg-[#CFE3C8] hover:text-[#1B3D2A]">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <PageTransition pageKey={location}>{children}</PageTransition>
      </main>

        <footer className="bg-[#F5F8F1] text-[#1B3D2A] border-t border-[#6B8F3E]/25 mt-auto py-16">
        <div className="container mx-auto px-5 md:px-20 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex mb-4 rounded-xl bg-white/70 px-3 py-2">
              <img
                src="/leafly-brand.png"
                alt="Leafly"
                className="h-14 w-auto max-w-[180px] object-contain object-left"
              />
            </Link>
             <p className="text-[#1B3D2A]/70 text-sm leading-relaxed">
              Pakistan's smart plant delivery & care platform. Discover the perfect plants for your space and climate.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
             <ul className="space-y-3 text-sm text-[#1B3D2A]/70">
               <li><Link href="/shop?category=Indoor" className="hover:text-[#4A7C3F] transition-colors">Indoor Plants</Link></li>
               <li><Link href="/shop?category=Outdoor" className="hover:text-[#4A7C3F] transition-colors">Outdoor Plants</Link></li>
               <li><Link href="/shop/accessories" className="hover:text-[#4A7C3F] transition-colors">Accessories</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-3 text-sm text-[#1B3D2A]/70">
               <li><Link href="/hire" className="hover:text-[#4A7C3F] transition-colors">Hire a Gardener</Link></li>
               <li><Link href="/hire" className="hover:text-[#4A7C3F] transition-colors">Plant Consultation</Link></li>
               <li><Link href="/hire" className="hover:text-[#4A7C3F] transition-colors">Landscaping</Link></li>
               <li><Link href="/dashboard" className="hover:text-[#4A7C3F] transition-colors">Smart Care Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Account</h4>
              <ul className="space-y-3 text-sm text-[#1B3D2A]/70">
               <li><Link href="/login" className="hover:text-[#4A7C3F] transition-colors">Login</Link></li>
               <li><Link href="/dashboard" className="hover:text-[#4A7C3F] transition-colors">Dashboard</Link></li>
               <li><Link href="/orders" className="hover:text-[#4A7C3F] transition-colors">Track Order</Link></li>
               <li><Link href="/admin" className="hover:text-[#4A7C3F] transition-colors">Admin Dashboard</Link></li>
            </ul>
          </div>
        </div>
         <div className="container mx-auto px-5 md:px-20 mt-8 pt-8 border-t border-[#6B8F3E]/20 text-center text-sm text-[#1B3D2A]/60">
           © {new Date().getFullYear()} Leafly Pakistan. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
