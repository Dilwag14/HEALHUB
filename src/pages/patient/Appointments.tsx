import { useState } from "react";
import { useAppointments, useCancelAppointment } from "@/hooks/useAppointments";
import { usePrescription } from "@/hooks/usePrescriptions";
import type { Appointment } from "@/mocks/data";
import { Calendar, Clock, Stethoscope, Search, FileText, XCircle, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { getInitials } from "@/lib/utils";

export default function PatientAppointments() {
  const [tab, setTab] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string | null>(null);

  const { data: appointments = [], isLoading } = useAppointments();
  const cancelMutation = useCancelAppointment();
  const { data: prescription, isLoading: loadingPrescription } = usePrescription(selectedPrescriptionId || undefined);

  const filteredAppointments = appointments.filter((app) => {
    const matchesTab = tab === "all" || app.status === tab;
    const matchesSearch =
      app.doctorName.toLowerCase().includes(search.toLowerCase()) ||
      app.doctorSpecialization.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
        <p className="text-muted-foreground mt-1">
          Manage your scheduled consultations, review past medical history, and access prescriptions.
        </p>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <Tabs value={tab} onValueChange={setTab} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-4 w-full sm:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by doctor or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Appointment List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="h-32 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : filteredAppointments.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-semibold">No appointments found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {search ? "Try searching for a different keyword." : "You have no appointments in this category."}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((app) => (
            <Card key={app.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14 border">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                      {getInitials(app.doctorName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{app.doctorName}</h3>
                      <Badge
                        variant="secondary"
                        className={
                          app.status === "upcoming"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : app.status === "completed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }
                      >
                        {app.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">
                      {app.doctorSpecialization}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1 font-semibold text-foreground">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        {app.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {app.time}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 justify-end">
                  {app.status === "upcoming" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 border-destructive/20"
                      onClick={() => cancelMutation.mutate(app.id)}
                      disabled={cancelMutation.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-1.5" />
                      Cancel Booking
                    </Button>
                  )}

                  {app.status === "completed" && app.prescriptionId && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setSelectedPrescriptionId(app.prescriptionId!)}
                    >
                      <FileText className="h-4 w-4 text-primary" />
                      View Prescription
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Prescription Modal */}
      <Dialog open={!!selectedPrescriptionId} onOpenChange={(open) => !open && setSelectedPrescriptionId(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-5 w-5 text-primary" />
              Prescription Details
            </DialogTitle>
            <DialogDescription>
              Issued by {prescription?.doctorName} on {prescription?.createdAt}
            </DialogDescription>
          </DialogHeader>

          {loadingPrescription ? (
            <div className="py-8 text-center text-sm text-muted-foreground animate-pulse">
              Loading prescription data...
            </div>
          ) : prescription ? (
            <div className="space-y-4 py-2">
              <div className="bg-muted/40 p-3.5 rounded-lg space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Diagnosis
                </span>
                <p className="text-sm font-bold text-foreground">{prescription.diagnosis}</p>
              </div>

              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Prescribed Medications
                </span>
                <div className="mt-2 border rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted text-muted-foreground font-semibold">
                      <tr>
                        <th className="p-2.5">Medicine Name</th>
                        <th className="p-2.5">Dosage</th>
                        <th className="p-2.5">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {prescription.medications.map((med, idx) => (
                        <tr key={idx} className="hover:bg-muted/20">
                          <td className="p-2.5 font-medium">{med.name}</td>
                          <td className="p-2.5">{med.dosage}</td>
                          <td className="p-2.5">{med.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {prescription.notes && (
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Doctor's Advice / Notes
                  </span>
                  <p className="text-xs text-muted-foreground bg-amber-50/50 border border-amber-200/60 p-3 rounded-lg mt-1 leading-relaxed">
                    {prescription.notes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-destructive py-4">Prescription details unavailable.</p>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setSelectedPrescriptionId(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
