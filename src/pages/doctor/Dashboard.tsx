import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useAppointments, useCompleteAppointment } from "@/hooks/useAppointments";
import { useCreatePrescription } from "@/hooks/usePrescriptions";
import { Calendar, Clock, User, CheckCircle2, Star, FileText, ArrowRight, Activity, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { getInitials } from "@/lib/utils";
import type { Appointment } from "@/mocks/data";

export default function DoctorDashboard() {
  const { user } = useAuthStore();
  const { data: appointments = [], isLoading } = useAppointments();
  const completeMutation = useCompleteAppointment();
  const createPrescriptionMutation = useCreatePrescription();

  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [medications, setMedications] = useState([
    { name: "", dosage: "", duration: "" },
  ]);
  const [notes, setNotes] = useState("");

  const upcomingAppointments = appointments.filter((a) => a.status === "upcoming");
  const completedAppointments = appointments.filter((a) => a.status === "completed");

  const handleAddMedicationRow = () => {
    setMedications([...medications, { name: "", dosage: "", duration: "" }]);
  };

  const handleMedicationChange = (index: number, field: string, value: string) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    setMedications(updated);
  };

  const handleRemoveMedicationRow = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handlePrescriptionSubmit = () => {
    if (!activeAppointment) return;
    if (!diagnosis.trim()) return;

    createPrescriptionMutation.mutate(
      {
        appointmentId: activeAppointment.id,
        diagnosis,
        medications: medications.filter((m) => m.name.trim() !== ""),
        notes,
      },
      {
        onSuccess: () => {
          completeMutation.mutate(activeAppointment.id);
          setActiveAppointment(null);
          setDiagnosis("");
          setMedications([{ name: "", dosage: "", duration: "" }]);
          setNotes("");
        },
      }
    );
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-800 p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {user?.name?.startsWith("Dr.") ? user.name : `Dr. ${user?.name || "Doctor"}`}!
            </h1>
            <p className="mt-2 text-emerald-100 max-w-xl text-sm leading-relaxed">
              Manage today's clinical consultations, record patient diagnoses, and issue digital prescriptions instantly.
            </p>
          </div>
          <Button asChild variant="secondary" className="gap-2 shadow-sm shrink-0">
            <Link to="/doctor/appointments">
              <Calendar className="h-4 w-4" />
              Manage Full Schedule
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Patients
            </CardTitle>
            <Calendar className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Upcoming appointments
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed Visits
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedAppointments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Consultations finished
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Doctor Rating
            </CardTitle>
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.9 / 5.0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on patient reviews
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clinical Status
            </CardTitle>
            <Activity className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">Active</div>
            <p className="text-xs text-muted-foreground mt-1">
              Available for bookings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Today's Appointments</h2>
          <Button variant="ghost" size="sm" asChild className="gap-1">
            <Link to="/doctor/appointments">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((n) => (
              <Card key={n} className="h-28 animate-pulse bg-muted/40" />
            ))}
          </div>
        ) : upcomingAppointments.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-base">No pending appointments for today</h3>
            <p className="text-sm text-muted-foreground mt-1">
              All scheduled appointments have been attended to.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingAppointments.map((app) => (
              <Card key={app.id} className="p-5 shadow-sm hover:border-emerald-500/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12 border">
                      <AvatarFallback className="bg-emerald-50 text-emerald-700 font-bold">
                        {getInitials(app.patientName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-base">{app.patientName}</h4>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 font-semibold text-foreground">
                          <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                          {app.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {app.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                    onClick={() => setActiveAppointment(app)}
                  >
                    <FileText className="h-4 w-4" />
                    Complete & Prescribe
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Prescription Dialog */}
      <Dialog open={!!activeAppointment} onOpenChange={(open) => !open && setActiveAppointment(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Issue Prescription & Complete Visit</DialogTitle>
            <DialogDescription>
              Patient: <span className="font-semibold text-foreground">{activeAppointment?.patientName}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 max-h-[65vh] overflow-y-auto pr-1">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Diagnosis *
              </label>
              <Input
                placeholder="e.g. Acute Viral Fever, Hypertension"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Medications
                </label>
                <Button variant="ghost" size="sm" onClick={handleAddMedicationRow} className="h-7 text-xs gap-1">
                  <Plus className="h-3.5 w-3.5" /> Add Medicine
                </Button>
              </div>

              <div className="space-y-2">
                {medications.map((med, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <Input
                      placeholder="Medicine name"
                      value={med.name}
                      onChange={(e) => handleMedicationChange(idx, "name", e.target.value)}
                      className="col-span-5 text-xs"
                    />
                    <Input
                      placeholder="Dosage (e.g. 500mg)"
                      value={med.dosage}
                      onChange={(e) => handleMedicationChange(idx, "dosage", e.target.value)}
                      className="col-span-3 text-xs"
                    />
                    <Input
                      placeholder="Duration (e.g. 5 days)"
                      value={med.duration}
                      onChange={(e) => handleMedicationChange(idx, "duration", e.target.value)}
                      className="col-span-3 text-xs"
                    />
                    {medications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicationRow(idx)}
                        className="col-span-1 text-destructive hover:opacity-80 text-center font-bold text-sm"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Clinical Notes / Advice
              </label>
              <Textarea
                placeholder="Additional instructions, follow-up date, dietary recommendations..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1.5"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveAppointment(null)}>
              Cancel
            </Button>
            <Button
              onClick={handlePrescriptionSubmit}
              disabled={!diagnosis.trim() || createPrescriptionMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {createPrescriptionMutation.isPending ? "Submitting..." : "Complete Consultation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
