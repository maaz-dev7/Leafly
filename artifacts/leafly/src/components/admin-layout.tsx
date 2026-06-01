import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { LayoutDashboard, Leaf, ShoppingBag, CalendarDays, Tag, LogOut, ChevronRight, Package, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/plants", label: "Plants", icon: Leaf },
  { href: "/admin/accessories", label: "Accessories", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/admin/variants", label: "Variants", icon: Tag },
  { href: "/admin/contact", label: "Contact Info", icon: Phone },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const adminToken = localStorage.getItem("leafly_admin_token");

  useEffect(() => {
    if (!adminToken) setLocation("/admin/login");
  }, [adminToken, setLocation]);

  if (!adminToken) return null;

  const handleLogout = () => {
    localStorage.removeItem("leafly_admin_token");
    setLocation("/admin/login");
  };

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-[#1D9E75] text-white flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-white/20">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <span className="font-bold text-lg tracking-tight">Leafly Admin</span>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = location === href || (href !== "/admin" && location.startsWith(href));
            return (
              <Link key={href} href={href}>
                <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                  active ? "bg-white text-[#1D9E75]" : "text-white/80 hover:bg-white/15 hover:text-white"
                }`}>
                  <Icon size={17} />
                  {label}
                  {active && <ChevronRight size={14} className="ml-auto" />}
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-white/20">
          <Button
            variant="ghost" size="sm"
            onClick={handleLogout}
            className="w-full justify-start gap-2 text-white/80 hover:text-white hover:bg-white/15"
          >
            <LogOut size={16} /> Logout
          </Button>
        </div>
      </aside>
      <main className="flex-1 bg-muted/30 overflow-auto">
        {children}
      </main>
    </div>
  );
}
