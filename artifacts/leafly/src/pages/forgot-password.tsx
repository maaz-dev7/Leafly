import { useState } from "react";
import { useForgotPassword, useResetPassword } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { Leaf, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
  const [step, setStep] = useState<"request" | "reset" | "done">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const forgotPasswordMutation = useForgotPassword({
    mutation: {
      onSuccess: () => {
        setStep("reset");
        toast({ title: "Code sent", description: "Check your email for the verification code." });
      },
      onError: (err: any) => {
        if (err?.response?.status === 404) {
          toast({ title: "No account found", description: "There's no account registered with this email address.", variant: "destructive" });
        } else {
          toast({ title: "Something went wrong", description: "Please try again in a moment.", variant: "destructive" });
        }
      },
    },
  });

  const resetPasswordMutation = useResetPassword({
    mutation: {
      onSuccess: () => {
        setStep("done");
        toast({ title: "Password reset", description: "You can now sign in with your new password." });
      },
      onError: (err: any) => {
        if (err?.response?.status === 404) {
          toast({ title: "No account found", description: "There's no account registered with this email address.", variant: "destructive" });
        } else {
          toast({ title: "Invalid or expired code", description: "Please check the code or request a new one.", variant: "destructive" });
        }
      },
    },
  });

  const onRequestCode = (e: React.FormEvent) => {
    e.preventDefault();
    forgotPasswordMutation.mutate({ data: { email } });
  };

  const onReset = (e: React.FormEvent) => {
    e.preventDefault();
    resetPasswordMutation.mutate({ data: { email, code, newPassword } });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12 text-primary-foreground">
        <Link href="/" className="flex items-center gap-2">
          <Leaf className="h-7 w-7" />
          <span className="font-serif text-2xl font-bold">Leafly</span>
        </Link>
        <div>
          <h2 className="text-4xl font-serif font-bold leading-tight mb-4">
            Forgot your password? No worries.
          </h2>
          <p className="text-primary-foreground/70 text-lg">
            We'll email you a verification code so you can set a new password and get back to your plants.
          </p>
        </div>
        <p className="text-primary-foreground/50 text-sm">Pakistan's #1 Plant Delivery & Care Platform</p>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 text-primary mb-8 lg:hidden">
            <Leaf className="h-6 w-6" />
            <span className="font-serif text-xl font-bold">Leafly</span>
          </Link>

          {step === "request" && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold mb-2">Reset Password</h1>
                <p className="text-muted-foreground">
                  Enter your account email and we'll send you a verification code.
                </p>
              </div>
              <form onSubmit={onRequestCode} className="space-y-5">
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
                <Button type="submit" className="w-full h-11 text-base" disabled={forgotPasswordMutation.isPending}>
                  {forgotPasswordMutation.isPending ? "Sending code..." : "Send Verification Code"}
                </Button>
              </form>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Remembered your password?{" "}
                <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
              </p>
            </>
          )}

          {step === "reset" && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold mb-2">Enter Verification Code</h1>
                <p className="text-muted-foreground">
                  We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>. Enter it below along with your new password.
                </p>
              </div>
              <form onSubmit={onReset} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    placeholder="123456"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    required
                    maxLength={6}
                    className="h-11 tracking-widest text-lg text-center"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter a new password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      minLength={6}
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
                <Button type="submit" className="w-full h-11 text-base" disabled={resetPasswordMutation.isPending}>
                  {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
                </Button>
                <button
                  type="button"
                  onClick={() => setStep("request")}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
                >
                  Didn't get a code? Try again
                </button>
              </form>
            </>
          )}

          {step === "done" && (
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="text-primary" size={32} />
              </div>
              <h1 className="text-3xl font-serif font-bold mb-2">Password Reset!</h1>
              <p className="text-muted-foreground mb-8">
                Your password has been changed successfully. You can now sign in with your new password.
              </p>
              <Button size="lg" className="w-full" onClick={() => setLocation("/login")}>Go to Sign In</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
