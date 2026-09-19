import { useState } from "react";
import { useDoctors } from "@/hooks/useDoctors";
import { useBookAppointment } from "@/hooks/useAppointments";
import { useAuthStore } from "@/store/authStore";
import type { Doctor, AvailableSlot } from "@/mocks/data";
import { Search, Star, MapPin, Calendar, Clock, Stethoscope, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getInitials } from "@/lib/utils";

const SPECIALIZATIONS = [
  "All Specializations",
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "General Medicine",
  "Orthopedics",
  "Neurology",
  "Gynecology",
];

export default function DoctorSearch() {
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("All Specializations");
  const [minRating, setMinRating] = useState<string>("0");
  
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  
  const { user } = useAuthStore();
  const bookMutation = useBookAppointment();

  const { data: doctors = [], isLoading } = useDoctors({
    search: search || undefined,
    specialization: specialization !== "All Specializations" ? specialization : undefined,
    minRating: minRating !== "0" ? Number(minRating) : undefined,
  });

  const handleBook = () => {
    if (!selectedDoctor || !selectedSlot) return;
    bookMutation.mutate(
      {
        doctorId: selectedDoctor.id,
        date: selectedSlot.date,
        time: selectedSlot.time,
      },
      {
        onSuccess: () => {
          setSelectedDoctor(null);
          setSelectedSlot(null);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Find & Book Doctors</h1>
        <p className="text-muted-foreground mt-1">
          Search top-rated specialists, check real-time availability, and book your appointment instantly.
        </p>
      </div>

      {/* Search & Filters */}
      <Card className="p-4 shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by doctor name or clinic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="w-full md:w-56">
            <Select value={specialization} onValueChange={setSpecialization}>
              <SelectTrigger>
                <Stethoscope className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Specialization" />
              </SelectTrigger>
              <SelectContent>
                {SPECIALIZATIONS.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-44">
            <Select value={minRating} onValueChange={setMinRating}>
              <SelectTrigger>
                <Star className="mr-2 h-4 w-4 text-amber-500 fill-amber-500" />
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any Rating</SelectItem>
                <SelectItem value="4">4.0+ Stars</SelectItem>
                <SelectItem value="4.5">4.5+ Stars</SelectItem>
                <SelectItem value="4.8">4.8+ Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Doctor Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Card key={n} className="h-64 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Filter className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No doctors found</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Try adjusting your search query or filters.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => {
            const openSlots = doctor.availableSlots.filter((s) => !s.booked);
            return (
              <Card key={doctor.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14 border border-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                        {getInitials(doctor.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-bold truncate">{doctor.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1 font-normal">
                        {doctor.specialization}
                      </Badge>
                      <div className="flex items-center gap-1.5 mt-2 text-sm text-amber-600 font-medium">
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                        <span>{doctor.rating}</span>
                        <span className="text-muted-foreground text-xs font-normal">
                          ({doctor.reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 text-sm flex-1">
                  <div className="flex items-center text-muted-foreground gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-primary" />
                    <span className="truncate">{doctor.clinicName}</span>
                  </div>
                  <p className="text-muted-foreground text-xs line-clamp-2">{doctor.bio}</p>
                  
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Available Slots:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {openSlots.slice(0, 3).map((slot, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                          {slot.date.split("-").slice(1).join("/")} {slot.time}
                        </Badge>
                      ))}
                      {openSlots.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{openSlots.length - 3} more
                        </Badge>
                      )}
                      {openSlots.length === 0 && (
                        <span className="text-xs text-muted-foreground">No slots currently open</span>
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-2 border-t">
                  <Button
                    className="w-full gap-2"
                    disabled={openSlots.length === 0 || user?.role === "doctor"}
                    onClick={() => {
                      setSelectedDoctor(doctor);
                      setSelectedSlot(openSlots[0] || null);
                    }}
                  >
                    <Calendar className="h-4 w-4" />
                    Book Appointment
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Booking Dialog */}
      <Dialog open={!!selectedDoctor} onOpenChange={(open) => !open && setSelectedDoctor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book Appointment</DialogTitle>
            <DialogDescription>
              Select an available time slot for your consultation with {selectedDoctor?.name}.
            </DialogDescription>
          </DialogHeader>

          {selectedDoctor && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{getInitials(selectedDoctor.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-sm">{selectedDoctor.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {selectedDoctor.specialization} • {selectedDoctor.clinicName}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Select Time Slot
                </label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto pr-1">
                  {selectedDoctor.availableSlots
                    .filter((s) => !s.booked)
                    .map((slot, idx) => {
                      const isSelected = selectedSlot?.date === slot.date && selectedSlot?.time === slot.time;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`flex items-center justify-between p-2.5 rounded-md text-xs font-medium border transition-colors ${
                            isSelected
                              ? "border-primary bg-primary/10 text-primary"
                              : "hover:bg-muted"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{slot.date}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{slot.time}</span>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSelectedDoctor(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleBook}
              disabled={!selectedSlot || bookMutation.isPending}
            >
              {bookMutation.isPending ? "Confirming..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
