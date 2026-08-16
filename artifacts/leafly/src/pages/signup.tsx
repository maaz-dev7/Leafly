import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { Leaf, Eye, EyeOff, CheckCircle, Mail, ArrowLeft } from "lucide-react";

const CITIES = ["Lahore", "Karachi", "Islamabad", "Peshawar", "Quetta", "Multan", "Faisalabad", "Rawalpindi", "Sialkot", "Other"];

type Step = "form" | "verify";

export default function Signup() {
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("Lahore");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/initiate-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, city }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Error", description: data.error || "Failed to send verification code", variant: "destructive" });
        return;
      }
      setStep("verify");
      toast({ title: "Code sent!", description: `Check ${email} for your 6-digit verification code.` });
    } catch {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Invalid code", description: data.error || "The code is incorrect or expired. Try again.", variant: "destructive" });
        return;
      }
      login(data.token);
      setLocation("/dashboard");
    } catch {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12 text-primary-foreground">
        <Link href="/" className="flex items-center gap-2">
          <Leaf className="h-7 w-7" />
          <span className="font-serif text-2xl font-bold">Leafly</span>
        </Link>
        <div className="space-y-6">
          <h2 className="text-4xl font-serif font-bold leading-tight">
            Start your plant journey today.
          </h2>
          <ul className="space-y-3">
            {[
              "Track orders with real-time delivery status",
              "Personalized plant care reminders",
              "Watering & fertilizer schedule dashboard",
              "Order history at your fingertips",
            ].map(item => (
              <li key={item} className="flex items-center gap-3 text-primary-foreground/90">
                <CheckCircle size={18} className="shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-primary-foreground/50 text-sm">Pakistan's #1 Plant Delivery & Care Platform</p>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 text-primary mb-8 lg:hidden">
            <Leaf className="h-6 w-6" />
            <span className="font-serif text-xl font-bold">Leafly</span>
          </Link>

          {step === "form" ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold mb-2">Create Account</h1>
                <p className="text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary font-semibold hover:underline">
                    Sign in here
                  </Link>
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Ahmed Khan"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

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
                  <Label htmlFor="city">Your City</Label>
                  <Select value={city} onValueChange={setCity} required>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select your city" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Used for delivery estimates and plant recommendations</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base mt-2"
                  disabled={loading}
                >
                  {loading ? "Sending code…" : "Continue — Verify Email"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  We'll send a verification code to your email before creating your account.
                </p>
              </form>
            </>
          ) : (
            <>
              <div className="mb-8">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5">
                  <Mail className="text-primary" size={28} />
                </div>
                <h1 className="text-3xl font-serif font-bold mb-2">Check your email</h1>
                <p className="text-muted-foreground">
                  We sent a 6-digit code to{" "}
                  <span className="font-semibold text-foreground">{email}</span>.<br />
                  Enter it below to complete your signup.
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    placeholder="123456"
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required
                    maxLength={6}
                    className="h-14 text-2xl tracking-[0.4em] text-center font-mono"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">Code expires in 15 minutes</p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base"
                  disabled={loading || code.length < 6}
                >
                  {loading ? "Verifying…" : "Verify & Create Account"}
                </Button>

                <button
                  type="button"
                  onClick={() => { setStep("form"); setCode(""); }}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
                >
                  <ArrowLeft size={14} /> Back — change email
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
