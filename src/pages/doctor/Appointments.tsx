import { useState } from "react";
import { useAppointments, useCompleteAppointment, useCancelAppointment } from "@/hooks/useAppointments";
import { useCreatePrescription, usePrescription } from "@/hooks/usePrescriptions";
import { Calendar, Clock, User, CheckCircle2, FileText, Search, XCircle, Plus, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { getInitials } from "@/lib/utils";
import type { Appointment } from "@/mocks/data";

export default function DoctorAppointments() {
  const [tab, setTab] = useState<string>("all");
  const [search, setSearch] = useState("");
  
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
  const [viewPrescriptionId, setViewPrescriptionId] = useState<string | null>(null);
  
  const [diagnosis, setDiagnosis] = useState("");
  const [medications, setMedications] = useState([
    { name: "", dosage: "", duration: "" },
  ]);
  const [notes, setNotes] = useState("");

  const { data: appointments = [], isLoading } = useAppointments();
  const completeMutation = useCompleteAppointment();
  const cancelMutation = useCancelAppointment();
  const createPrescriptionMutation = useCreatePrescription();
  const { data: prescription } = usePrescription(viewPrescriptionId || undefined);

  const filteredAppointments = appointments.filter((app) => {
    const matchesTab = tab === "all" || app.status === tab;
    const matchesSearch = app.patientName.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

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
    if (!activeAppointment || !diagnosis.trim()) return;

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Patient Schedule</h1>
        <p className="text-muted-foreground mt-1">
          Review appointment requests, conduct patient visits, and issue medical prescriptions.
        </p>
      </div>

      {/* Filter Tabs & Search */}
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
            placeholder="Search patient name..."
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
            {search ? "No patient matches your search keyword." : "No appointments in this category."}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((app) => (
            <Card key={app.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14 border">
                    <AvatarFallback className="bg-emerald-50 text-emerald-700 font-bold text-lg">
                      {getInitials(app.patientName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{app.patientName}</h3>
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
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
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

                <div className="flex flex-wrap items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 justify-end">
                  {app.status === "upcoming" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 border-destructive/20"
                        onClick={() => cancelMutation.mutate(app.id)}
                        disabled={cancelMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-1.5" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                        onClick={() => setActiveAppointment(app)}
                      >
                        <FileText className="h-4 w-4" />
                        Complete & Prescribe
                      </Button>
                    </>
                  )}

                  {app.status === "completed" && app.prescriptionId && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setViewPrescriptionId(app.prescriptionId!)}
                    >
                      <Eye className="h-4 w-4 text-emerald-600" />
                      View Issued Prescription
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Prescription Creator Dialog */}
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

      {/* View Prescription Dialog */}
      <Dialog open={!!viewPrescriptionId} onOpenChange={(open) => !open && setViewPrescriptionId(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-5 w-5 text-emerald-600" />
              Prescription Details
            </DialogTitle>
            <DialogDescription>
              Patient: {prescription?.patientName} • Issued on {prescription?.createdAt}
            </DialogDescription>
          </DialogHeader>

          {prescription && (
            <div className="space-y-4 py-2">
              <div className="bg-muted/40 p-3.5 rounded-lg space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Diagnosis
                </span>
                <p className="text-sm font-bold">{prescription.diagnosis}</p>
              </div>

              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Medications
                </span>
                <div className="mt-2 border rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted text-muted-foreground font-semibold">
                      <tr>
                        <th className="p-2.5">Medicine</th>
                        <th className="p-2.5">Dosage</th>
                        <th className="p-2.5">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {prescription.medications.map((med, idx) => (
                        <tr key={idx}>
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
                    Advice / Notes
                  </span>
                  <p className="text-xs text-muted-foreground bg-muted p-3 rounded-lg mt-1">
                    {prescription.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setViewPrescriptionId(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
