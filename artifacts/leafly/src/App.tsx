import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";

import Home from "@/pages/home";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Shop from "@/pages/shop/index";
import AccessoriesShop from "@/pages/shop/accessories";
import PlantDetail from "@/pages/plant/[id]";
import HireAPro from "@/pages/hire/index";
import Cart from "@/pages/cart/index";
import Dashboard from "@/pages/dashboard/index";
import Orders from "@/pages/orders/index";

import AdminDashboard, { AdminLogin } from "@/pages/admin/dashboard";
import AdminPlants from "@/pages/admin/plants";
import AdminPrices from "@/pages/admin/prices";
import AdminOrders from "@/pages/admin/orders";
import AdminBookings from "@/pages/admin/bookings";
import AdminVariants from "@/pages/admin/variants";

const originalFetch = window.fetch;
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const token = localStorage.getItem("leafly_token");
  const adminToken = localStorage.getItem("leafly_admin_token");
  
  const headers = new Headers(init?.headers);
  
  if (input.toString().includes("/api/admin") && adminToken) {
    headers.set("Authorization", `Bearer ${adminToken}`);
  } else if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  return originalFetch(input, { ...init, headers });
};

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Layout><Home /></Layout>
      </Route>
      <Route path="/shop">
        <Layout><Shop /></Layout>
      </Route>
      <Route path="/shop/accessories">
        <Layout><AccessoriesShop /></Layout>
      </Route>
      <Route path="/plant/:id">
        <Layout><PlantDetail /></Layout>
      </Route>
      <Route path="/hire">
        <Layout><HireAPro /></Layout>
      </Route>
      <Route path="/cart">
        <Layout><Cart /></Layout>
      </Route>
      <Route path="/dashboard">
        <Layout><Dashboard /></Layout>
      </Route>
      <Route path="/orders">
        <Layout><Orders /></Layout>
      </Route>
      <Route path="/login">
        <Layout><Login /></Layout>
      </Route>
      <Route path="/signup">
        <Layout><Signup /></Layout>
      </Route>
      
      {/* Admin Routes */}
      <Route path="/admin">
        <Layout><AdminDashboard /></Layout>
      </Route>
      <Route path="/admin/login">
        <Layout><AdminLogin /></Layout>
      </Route>
      <Route path="/admin/plants">
        <Layout><AdminPlants /></Layout>
      </Route>
      <Route path="/admin/prices">
        <Layout><AdminPrices /></Layout>
      </Route>
      <Route path="/admin/orders">
        <Layout><AdminOrders /></Layout>
      </Route>
      <Route path="/admin/bookings">
        <Layout><AdminBookings /></Layout>
      </Route>
      <Route path="/admin/variants">
        <Layout><AdminVariants /></Layout>
      </Route>

      <Route path="/:rest*">
        <Layout><NotFound /></Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
