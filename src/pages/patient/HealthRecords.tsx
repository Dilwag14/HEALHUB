import { useState } from "react";
import { useHealthRecords, useUploadRecord } from "@/hooks/useHealthRecords";
import { usePrescription } from "@/hooks/usePrescriptions";
import { FileText, Search, Upload, Calendar, User, Download, Plus, CheckCircle, File, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function PatientHealthRecords() {
  const [search, setSearch] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string | null>(null);

  const { data: records = [], isLoading } = useHealthRecords();
  const uploadMutation = useUploadRecord();
  const { data: prescription } = usePrescription(selectedPrescriptionId || undefined);

  const filteredRecords = records.filter(
    (rec) =>
      rec.diagnosis.toLowerCase().includes(search.toLowerCase()) ||
      rec.doctorName.toLowerCase().includes(search.toLowerCase())
  );

  const handleUploadSubmit = () => {
    if (!newFileName.trim()) {
      toast.error("Please enter a file description or name.");
      return;
    }
    const targetRecordId = selectedRecordId || records[0]?.id;
    if (!targetRecordId) {
      toast.error("No record selected to attach file.");
      return;
    }

    uploadMutation.mutate(
      { recordId: targetRecordId, file: newFileName.trim() },
      {
        onSuccess: () => {
          setUploadDialogOpen(false);
          setNewFileName("");
          setSelectedRecordId(null);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Upload CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Health Records & History</h1>
          <p className="text-muted-foreground mt-1">
            Access past consultation notes, medical reports, and attached prescription files.
          </p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)} className="gap-2 shadow-sm">
          <Upload className="h-4 w-4" />
          Upload Record / Lab File
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search records by diagnosis or doctor name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </Card>

      {/* Health Records List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="h-36 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : filteredRecords.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-semibold">No medical records found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {search ? "No records match your search filter." : "Your health record history will appear here after consultations."}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((rec) => (
            <Card key={rec.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{rec.diagnosis}</h3>
                    <Badge variant="outline" className="text-xs">
                      Consultation
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <User className="h-3.5 w-3.5 text-primary" />
                      {rec.doctorName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {rec.date}
                    </span>
                  </div>

                  {/* Files / Attachments */}
                  {rec.files && rec.files.length > 0 && (
                    <div className="pt-2">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Attached Documents & Reports:
                      </span>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {rec.files.map((file, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="gap-1.5 py-1 px-2.5 font-normal text-xs hover:bg-secondary/80 cursor-pointer"
                            onClick={() => toast.info(`Viewing file: ${file}`)}
                          >
                            <File className="h-3 w-3 text-primary" />
                            {file}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {rec.prescription && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setSelectedPrescriptionId(rec.prescription!.id)}
                    >
                      <Eye className="h-4 w-4 text-primary" />
                      View Prescription
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setSelectedRecordId(rec.id);
                      setUploadDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Attach File
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Medical Document</DialogTitle>
            <DialogDescription>
              Upload lab reports, X-rays, or past medical records to attach to your health history.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Document Title / Filename
              </label>
              <Input
                placeholder="e.g. Blood_Test_Report_Jan2026.pdf"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadSubmit} disabled={uploadMutation.isPending}>
              {uploadMutation.isPending ? "Uploading..." : "Upload Document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Prescription Dialog */}
      <Dialog open={!!selectedPrescriptionId} onOpenChange={(open) => !open && setSelectedPrescriptionId(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-5 w-5 text-primary" />
              Prescription Record
            </DialogTitle>
            <DialogDescription>
              Issued by {prescription?.doctorName}
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
                    Doctor Advice
                  </span>
                  <p className="text-xs text-muted-foreground bg-amber-50/50 border border-amber-200/60 p-3 rounded-lg mt-1">
                    {prescription.notes}
                  </p>
                </div>
              )}
            </div>
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
