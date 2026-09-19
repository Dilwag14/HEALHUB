import { useAuthStore } from "@/store/authStore";
import { useAppointments, useCancelAppointment } from "@/hooks/useAppointments";
import { useHealthRecords } from "@/hooks/useHealthRecords";
import { Link } from "react-router-dom";
import { Calendar, Clock, Stethoscope, FileText, ArrowRight, Activity, Heart, Shield, PlusCircle, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

export default function PatientDashboard() {
  const { user } = useAuthStore();
  const { data: appointments = [], isLoading: loadingApps } = useAppointments();
  const { data: healthRecords = [], isLoading: loadingRecords } = useHealthRecords();
  const cancelMutation = useCancelAppointment();

  const upcomingAppointments = appointments.filter((a) => a.status === "upcoming");
  const completedAppointments = appointments.filter((a) => a.status === "completed");

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-8 text-primary-foreground shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {user?.name || "Patient"}!
            </h1>
            <p className="mt-2 text-primary-foreground/90 max-w-xl text-sm leading-relaxed">
              Your personal health portal. Check your upcoming doctor consultations, review past medical records, and manage your health journey seamless.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary" className="gap-2 shadow-sm">
              <Link to="/doctors">
                <Stethoscope className="h-4 w-4" />
                Find a Doctor
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2 bg-white/10 border-white/20 hover:bg-white/20 text-white shadow-sm">
              <Link to="/patient/records">
                <FileText className="h-4 w-4" />
                Medical Records
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming Visits
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Scheduled consultations
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed Visits
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedAppointments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Past appointments
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Health Records
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthRecords.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Prescriptions & files
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vitals Status
            </CardTitle>
            <Activity className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">Normal</div>
            <p className="text-xs text-muted-foreground mt-1">
              Updated 2 days ago
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Upcoming Appointments */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Upcoming Appointments</h2>
            <Button variant="ghost" size="sm" asChild className="gap-1">
              <Link to="/patient/appointments">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {loadingApps ? (
            <div className="space-y-3">
              {[1, 2].map((n) => (
                <Card key={n} className="h-28 animate-pulse bg-muted/40" />
              ))}
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-base">No upcoming appointments</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                You don't have any consultations scheduled right now.
              </p>
              <Button asChild size="sm">
                <Link to="/doctors">Book Appointment</Link>
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((app) => (
                <Card key={app.id} className="p-5 shadow-sm hover:border-primary/40 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12 border">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getInitials(app.doctorName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-bold text-base">{app.doctorName}</h4>
                        <p className="text-xs text-muted-foreground font-medium">
                          {app.doctorSpecialization}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 font-medium text-foreground">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            {app.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {app.time}
                          </span>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Upcoming
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-t-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 border-destructive/20"
                        onClick={() => cancelMutation.mutate(app.id)}
                        disabled={cancelMutation.isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Recent Health Records */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Recent Records</h2>
            <Button variant="ghost" size="sm" asChild className="gap-1">
              <Link to="/patient/records">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {loadingRecords ? (
            <Card className="h-48 animate-pulse bg-muted/40" />
          ) : healthRecords.length === 0 ? (
            <Card className="p-6 text-center border-dashed">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium">No medical records yet</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {healthRecords.slice(0, 3).map((rec) => (
                <Card key={rec.id} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-sm">{rec.diagnosis}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {rec.doctorName} • {rec.date}
                      </p>
                    </div>
                    {rec.prescription && (
                      <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                        Prescription
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
