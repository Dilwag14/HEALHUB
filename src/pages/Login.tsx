import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Heart, LogIn, User, Stethoscope } from "lucide-react";
import { toast } from "sonner";

import { loginSchema, type LoginFormData } from "@/lib/schemas";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, login, getRole } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<"patient" | "doctor" | null>(
    null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const role = getRole();
      navigate(role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard", {
        replace: true,
      });
    }
  }, [isAuthenticated, getRole, navigate]);

  const performLogin = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    login(data.user, data.token);
    const dashboardPath =
      data.user.role === "doctor"
        ? "/doctor/dashboard"
        : "/patient/dashboard";
    toast.success(`Welcome back, ${data.user.name}!`);
    navigate(dashboardPath, { replace: true });
  };

  const onSubmit = async (formData: LoginFormData) => {
    setIsLoading(true);
    try {
      await performLogin(formData.email, formData.password);
    } catch (error: unknown) {
      const message =
        error instanceof Error &&
        "response" in error &&
        typeof (error as Record<string, unknown>).response === "object"
          ? ((error as Record<string, unknown>).response as Record<string, unknown>)?.data
            ? (((error as Record<string, unknown>).response as Record<string, unknown>).data as Record<string, string>)?.message
            : "Invalid email or password"
          : "An error occurred. Please try again.";
      toast.error(message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: "patient" | "doctor") => {
    setDemoLoading(role);
    try {
      const email = role === "patient" ? "sarah@demo.com" : "emily@demo.com";
      await performLogin(email, "demo123");
    } catch {
      toast.error("Demo login failed. Please try again.");
    } finally {
      setDemoLoading(null);
    }
  };

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen flex">
      {/* Left side — hero branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient relative flex-col items-center justify-center p-12 text-white overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-white/5 blur-xl" />
        <div className="absolute bottom-32 right-16 h-48 w-48 rounded-full bg-white/5 blur-xl" />
        <div className="absolute top-1/3 right-10 h-32 w-32 rounded-full bg-white/[0.03] blur-lg" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-md animate-fade-in">
          {/* Heart icon with glow */}
          <div className="relative mb-8">
            <div className="absolute inset-0 rounded-full bg-white/10 blur-2xl scale-150" />
            <div className="relative glass rounded-full p-6">
              <Heart className="h-16 w-16 text-white animate-pulse-soft" fill="currentColor" />
            </div>
          </div>

          <h1 className="font-heading text-4xl font-bold tracking-tight mb-4">
            HEALHUB
          </h1>
          <p className="text-lg text-white/80 leading-relaxed mb-6">
            Your trusted healthcare companion. Book appointments, consult with
            top doctors, and manage your health — all in one place.
          </p>

          <div className="flex items-center gap-3 glass rounded-xl px-6 py-3 mt-4">
            <div className="flex -space-x-2">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-semibold">
                SC
              </div>
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-semibold">
                AK
              </div>
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-semibold">
                +5
              </div>
            </div>
            <span className="text-sm text-white/70">
              Trusted by thousands of patients
            </span>
          </div>
        </div>
      </div>

      {/* Right side — login form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-10 bg-background">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile-only branding */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="rounded-lg bg-primary p-1.5">
              <Heart className="h-5 w-5 text-primary-foreground" fill="currentColor" />
            </div>
            <span className="font-heading text-xl font-bold text-primary">
              HEALHUB
            </span>
          </div>

          <Card className="border-0 shadow-none lg:card-shadow lg:border">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="font-heading text-2xl">
                Welcome back
              </CardTitle>
              <CardDescription>
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...register("email")}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...register("password")}
                    className={errors.password ? "border-destructive" : ""}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={isLoading || !!demoLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Signing in…
                    </span>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>

              {/* Register link */}
              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Register
                </Link>
              </p>

              <Separator />

              {/* Demo login buttons */}
              <div className="space-y-3">
                <p className="text-center text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  Quick Demo Access
                </p>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300"
                  disabled={isLoading || !!demoLoading}
                  onClick={() => handleDemoLogin("patient")}
                >
                  {demoLoading === "patient" ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  Login as Demo Patient
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300"
                  disabled={isLoading || !!demoLoading}
                  onClick={() => handleDemoLogin("doctor")}
                >
                  {demoLoading === "doctor" ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Stethoscope className="h-4 w-4" />
                  )}
                  Login as Demo Doctor
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
