import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { Leaf, Eye, EyeOff, CheckCircle, Mail, ArrowLeft, RefreshCw } from "lucide-react";

const RESEND_COOLDOWN = 120; // seconds

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
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0); // seconds remaining
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { login } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Start a 2-minute countdown whenever we enter the verify step
  const startCooldown = () => {
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    setResendCooldown(RESEND_COOLDOWN);
    cooldownRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => () => { if (cooldownRef.current) clearInterval(cooldownRef.current); }, []);

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
      startCooldown();
      toast({ title: "Code sent!", description: `Check ${email} for your 6-digit verification code.` });
    } catch {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return; // still cooling down — ignore stray clicks
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Error", description: data.error || "Couldn't resend code. Please try again.", variant: "destructive" });
        return;
      }
      setCode("");
      startCooldown();
      toast({ title: "Code resent!", description: `A new code was sent to ${email}.` });
    } catch {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setResending(false);
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
      {/* Left panel - photo + text overlay */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        <img
          src="/sign-up-page.jpg"
          alt="Beautiful flowering plants"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-[#1B3D2A]/55 pointer-events-none" />
        {/* Right-edge gradient blending into the form side */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to right, transparent 50%, rgba(255,255,255,0.85) 80%, white 100%)" }}
        />
        {/* Text content */}
        <div className="relative z-10 h-7" />
        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-serif font-bold leading-tight text-white">
            Start your plant journey today.
          </h2>
          <ul className="space-y-3">
            {[
              "Track orders with real-time delivery status",
              "Personalized plant care reminders",
              "Watering & fertilizer schedule dashboard",
              "Order history at your fingertips",
            ].map(item => (
              <li key={item} className="flex items-center gap-3 text-white/90">
                <CheckCircle size={18} className="shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative z-10 text-white/50 text-sm">Pakistan's #1 Plant Delivery &amp; Care Platform</p>
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
                  <p className="text-xs text-muted-foreground">Code expires in 15 minutes. Check your spam folder if you don't see it.</p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base"
                  disabled={loading || code.length < 6}
                >
                  {loading ? "Verifying…" : "Verify & Create Account"}
                </Button>

                {/* Resend code row */}
                <div className="flex flex-col items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || resending}
                    className={`flex items-center gap-1.5 text-sm font-medium transition-all duration-200 rounded-lg px-3 py-1.5 ${
                      resendCooldown > 0
                        ? "text-muted-foreground/40 cursor-not-allowed"
                        : "text-primary hover:bg-primary/10 cursor-pointer"
                    }`}
                  >
                    <RefreshCw size={14} className={resending ? "animate-spin" : ""} />
                    {resending ? "Sending…" : "Resend code"}
                  </button>
                  {resendCooldown > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Available in {Math.floor(resendCooldown / 60)}:{String(resendCooldown % 60).padStart(2, "0")}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => { setStep("form"); setCode(""); if (cooldownRef.current) clearInterval(cooldownRef.current); setResendCooldown(0); }}
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
