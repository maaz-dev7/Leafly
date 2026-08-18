import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { Leaf, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        login(data.token);
        setLocation("/dashboard");
      },
      onError: () => {
        toast({ title: "Login failed", description: "Invalid email or password. Please try again.", variant: "destructive" });
      }
    }
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ data: { email, password } });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left panel - photo */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="/sign-in-page.jpg"
          alt="Beautiful flowering plant"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Right-edge gradient blending into the form side */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to right, transparent 50%, rgba(255,255,255,0.85) 80%, white 100%)" }}
        />
      </div>

      {/* Right panel - form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 text-primary mb-8 lg:hidden">
            <Leaf className="h-6 w-6" />
            <span className="font-serif text-xl font-bold">Leafly</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-serif font-bold mb-2">Sign In</h1>
            <p className="text-muted-foreground text-sm">Welcome back to your plant journey.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm text-primary font-medium hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </Button>

            <p className="text-center text-sm text-muted-foreground pt-1">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary font-semibold hover:underline transition-colors">
                Sign up now
              </Link>
            </p>
          </form>

          <div className="mt-8 p-4 bg-muted/50 rounded-xl text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Why create an account?</p>
            <ul className="space-y-1">
              <li>✅ Track your order status in real-time</li>
              <li>✅ View full order history</li>
              <li>✅ Access Smart Plant Care Dashboard</li>
              <li>✅ Get watering & fertilizer reminders</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
