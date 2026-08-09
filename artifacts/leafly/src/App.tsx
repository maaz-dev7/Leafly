import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";

import Home from "@/pages/home";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import ForgotPassword from "@/pages/forgot-password";
import Shop from "@/pages/shop/index";
import AccessoriesShop from "@/pages/shop/accessories";
import PlantDetail from "@/pages/plant/[id]";
import HireAPro from "@/pages/hire/index";
import Cart from "@/pages/cart/index";
import Dashboard from "@/pages/dashboard/index";
import Orders from "@/pages/orders/index";

import AdminDashboard, { AdminLogin } from "@/pages/admin/dashboard";
import AdminPlants from "@/pages/admin/plants";
import AdminOrders from "@/pages/admin/orders";
import AdminBookings from "@/pages/admin/bookings";
import AdminVariants from "@/pages/admin/variants";
import AdminAccessories from "@/pages/admin/accessories";
import AdminContact from "@/pages/admin/contact";
import { AdminLayout } from "@/components/admin-layout";
import { ScrollRevealShell } from "@/components/motion";

const originalFetch = window.fetch;
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const token = localStorage.getItem("leafly_token");
  const adminToken = localStorage.getItem("leafly_admin_token");
  const headers = new Headers(init?.headers);
  const url = input.toString();
  const isAdminContext = window.location.pathname.includes("/admin");
  if ((isAdminContext || url.includes("/api/admin")) && adminToken) {
    headers.set("Authorization", `Bearer ${adminToken}`);
  } else if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const response = await originalFetch(input, { ...init, headers });
  // If the server rejects an admin request with 401/403, the stored token is
  // stale (e.g. after a server restart). Clear it and bounce to login so the
  // admin sees the login form instead of a "Failed to load" dead-end.
  if ((response.status === 401 || response.status === 403) && isAdminContext) {
    localStorage.removeItem("leafly_admin_token");
    window.location.href = "/admin/login";
  }
  return response;
};

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/"><Layout><Home /></Layout></Route>
      <Route path="/shop"><Layout><Shop /></Layout></Route>
      <Route path="/shop/accessories"><Layout><AccessoriesShop /></Layout></Route>
      <Route path="/plant/:id"><Layout><PlantDetail /></Layout></Route>
      <Route path="/hire"><Layout><HireAPro /></Layout></Route>
      <Route path="/cart"><Layout><Cart /></Layout></Route>
      <Route path="/dashboard"><Layout><Dashboard /></Layout></Route>
      <Route path="/orders"><Layout><Orders /></Layout></Route>
      <Route path="/login"><Layout><Login /></Layout></Route>
      <Route path="/signup"><Layout><Signup /></Layout></Route>
      <Route path="/forgot-password"><Layout><ForgotPassword /></Layout></Route>

      {/* Admin Routes */}
      <Route path="/admin"><AdminLayout><AdminDashboard /></AdminLayout></Route>
      <Route path="/admin/login"><Layout><AdminLogin /></Layout></Route>
      <Route path="/admin/plants"><AdminLayout><AdminPlants /></AdminLayout></Route>
      <Route path="/admin/accessories"><AdminLayout><AdminAccessories /></AdminLayout></Route>
      <Route path="/admin/orders"><AdminLayout><AdminOrders /></AdminLayout></Route>
      <Route path="/admin/bookings"><AdminLayout><AdminBookings /></AdminLayout></Route>
      <Route path="/admin/variants"><AdminLayout><AdminVariants /></AdminLayout></Route>
      <Route path="/admin/contact"><AdminLayout><AdminContact /></AdminLayout></Route>

      <Route path="/:rest*"><Layout><NotFound /></Layout></Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <ScrollRevealShell>
            <Router />
          </ScrollRevealShell>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
