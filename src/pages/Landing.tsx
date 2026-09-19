import { Link } from "react-router-dom";
import {
  Heart,
  Search,
  Calendar,
  FileText,
  Shield,
  ArrowRight,
  Stethoscope,
  Activity,
  Users,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Search,
    title: "Find & Book Doctors",
    description:
      "Search from our network of verified specialists. Filter by specialization, rating, and availability.",
  },
  {
    icon: Calendar,
    title: "Real-time Appointments",
    description:
      "Book appointments instantly with real-time slot availability. Manage, reschedule, or cancel with ease.",
  },
  {
    icon: FileText,
    title: "Health Records & Prescriptions",
    description:
      "Access your complete medical history, prescriptions, and lab reports in one secure place.",
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description:
      "Your health data is protected with role-based access control and secure authentication.",
  },
] as const;

const stats = [
  { value: "500+", label: "Doctors", icon: Stethoscope },
  { value: "10K+", label: "Patients", icon: Users },
  { value: "50K+", label: "Appointments", icon: Clock },
] as const;

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ─── Hero Section ─── */}
      <section className="hero-gradient relative flex items-center justify-center overflow-hidden min-h-[80vh]">
        {/* Subtle dot-pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Glass decorative blobs */}
        <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-10 h-96 w-96 rounded-full bg-white/5 blur-3xl" />

        {/* Floating decorative elements */}
        <div className="pointer-events-none absolute top-[15%] left-[8%] animate-float">
          <div className="glass rounded-2xl p-4">
            <Heart className="h-8 w-8 text-red-400" />
          </div>
        </div>
        <div
          className="pointer-events-none absolute right-[10%] bottom-[20%] animate-float"
          style={{ animationDelay: "3s" }}
        >
          <div className="glass rounded-2xl p-4">
            <Stethoscope className="h-8 w-8 text-sky-300" />
          </div>
        </div>
        <div
          className="pointer-events-none absolute top-[25%] right-[22%] animate-float"
          style={{ animationDelay: "1.5s" }}
        >
          <div className="glass rounded-xl p-3">
            <Activity className="h-6 w-6 text-emerald-400" />
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 py-24 text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
            <Activity className="h-3.5 w-3.5" />
            Trusted by thousands of patients
          </span>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Better healthcare,
            <br />
            <span className="bg-gradient-to-r from-white via-sky-200 to-white bg-clip-text text-transparent">
              better tomorrow.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70 sm:text-xl">
            Find trusted doctors, book appointments instantly, and manage your
            health records — all in one secure platform.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-lg bg-white px-8 text-base font-semibold text-[#1B2B6B] shadow-lg shadow-black/20 transition-all hover:bg-white/90 hover:shadow-xl"
            >
              <Link to="/doctors">
                <Search className="mr-2 h-4 w-4" />
                Find a Doctor
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-lg border-white/30 bg-transparent px-8 text-base font-semibold text-white transition-all hover:border-white/60 hover:bg-white/10"
            >
              <Link to="/register?role=doctor">
                <Stethoscope className="mr-2 h-4 w-4" />
                Join as Doctor
              </Link>
            </Button>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ─── Features Section ─── */}
      <section className="relative bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
              Features
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything you need for better health
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A comprehensive platform designed to make healthcare accessible,
              efficient, and secure.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="animate-slide-up group rounded-xl border border-border/50 bg-white p-8 card-shadow transition-all duration-300 hover:card-shadow-hover hover:-translate-y-1"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="mb-5 inline-flex items-center justify-center rounded-xl bg-primary/10 p-3 transition-colors group-hover:bg-primary/15">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats Section ─── */}
      <section className="hero-gradient relative overflow-hidden py-16">
        {/* Decorative overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center">
                <div className="mb-4 inline-flex items-center justify-center rounded-full bg-white/10 p-3">
                  <stat.icon className="h-6 w-6 text-white/80" />
                </div>
                <span className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                  {stat.value}
                </span>
                <span className="mt-1 text-lg font-medium text-white/70">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-sky-50 py-20 sm:py-28">
        {/* Soft decorative blob */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <Heart className="mx-auto mb-6 h-10 w-10 text-primary/30" />
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Ready to take control of your health?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of patients and doctors already using HEALHUB to make
            healthcare simpler and more accessible.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 h-12 rounded-lg px-10 text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
          >
            <Link to="/register">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border/50 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 py-10 sm:flex-row sm:justify-between">
          {/* Branding */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center rounded-lg bg-primary p-1.5">
              <Heart className="h-4 w-4 text-white" fill="currentColor" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
              HEALHUB
            </span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="#" className="transition-colors hover:text-foreground">
              About
            </Link>
            <Link to="#" className="transition-colors hover:text-foreground">
              Privacy
            </Link>
            <Link to="#" className="transition-colors hover:text-foreground">
              Terms
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © 2026 HEALHUB. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
