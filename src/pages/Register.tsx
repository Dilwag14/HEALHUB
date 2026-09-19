import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Heart, UserPlus } from "lucide-react";
import { toast } from "sonner";

import {
  patientRegisterSchema,
  doctorRegisterSchema,
  type PatientRegisterFormData,
  type DoctorRegisterFormData,
} from "@/lib/schemas";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const SPECIALIZATIONS = [
  "Cardiologist",
  "Dermatologist",
  "Pediatrician",
  "Neurologist",
  "Orthopedic",
  "General Physician",
];

/* ------------------------------------------------------------------ */
/*  Patient Registration Form                                         */
/* ------------------------------------------------------------------ */
function PatientForm({ onSuccess }: { onSuccess: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PatientRegisterFormData>({
    resolver: zodResolver(patientRegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      dob: "",
      bloodGroup: "",
    },
  });

  const onSubmit = async (data: PatientRegisterFormData) => {
    setIsLoading(true);
    try {
      const { data: res } = await api.post("/auth/register", {
        role: "patient",
        name: data.name,
        email: data.email,
        password: data.password,
        dob: data.dob,
        bloodGroup: data.bloodGroup,
      });
      login(res.user, res.token);
      toast.success("Account created successfully!");
      onSuccess();
    } catch (error: unknown) {
      const message =
        error instanceof Error &&
        "response" in error &&
        typeof (error as Record<string, unknown>).response === "object"
          ? (
              ((error as Record<string, unknown>).response as Record<string, unknown>)
                ?.data as Record<string, string> | undefined
            )?.message
          : undefined;
      toast.error(message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="patient-name">Full Name</Label>
        <Input
          id="patient-name"
          placeholder="Sarah Johnson"
          autoComplete="name"
          {...register("name")}
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="patient-email">Email</Label>
        <Input
          id="patient-email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          {...register("email")}
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Password row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="patient-password">Password</Label>
          <Input
            id="patient-password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register("password")}
            className={errors.password ? "border-destructive" : ""}
          />
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="patient-confirmPassword">Confirm Password</Label>
          <Input
            id="patient-confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register("confirmPassword")}
            className={errors.confirmPassword ? "border-destructive" : ""}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      {/* Date of Birth & Blood Group */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="patient-dob">Date of Birth</Label>
          <Input
            id="patient-dob"
            type="date"
            {...register("dob")}
            className={errors.dob ? "border-destructive" : ""}
          />
          {errors.dob && (
            <p className="text-sm text-destructive">{errors.dob.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="patient-bloodGroup">Blood Group</Label>
          <Select
            onValueChange={(value) => setValue("bloodGroup", value, { shouldValidate: true })}
          >
            <SelectTrigger
              id="patient-bloodGroup"
              className={errors.bloodGroup ? "border-destructive" : ""}
            >
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {BLOOD_GROUPS.map((bg) => (
                <SelectItem key={bg} value={bg}>
                  {bg}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.bloodGroup && (
            <p className="text-sm text-destructive">
              {errors.bloodGroup.message}
            </p>
          )}
        </div>
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full gap-2 mt-2" disabled={isLoading}>
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Creating account…
          </span>
        ) : (
          <>
            <UserPlus className="h-4 w-4" />
            Create Patient Account
          </>
        )}
      </Button>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  Doctor Registration Form                                          */
/* ------------------------------------------------------------------ */
function DoctorForm({ onSuccess }: { onSuccess: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DoctorRegisterFormData>({
    resolver: zodResolver(doctorRegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      specialization: "",
      licenseNumber: "",
      clinicName: "",
    },
  });

  const onSubmit = async (data: DoctorRegisterFormData) => {
    setIsLoading(true);
    try {
      const { data: res } = await api.post("/auth/register", {
        role: "doctor",
        name: data.name,
        email: data.email,
        password: data.password,
        specialization: data.specialization,
        licenseNumber: data.licenseNumber,
        clinicName: data.clinicName,
      });
      login(res.user, res.token);
      toast.success("Account created successfully!");
      onSuccess();
    } catch (error: unknown) {
      const message =
        error instanceof Error &&
        "response" in error &&
        typeof (error as Record<string, unknown>).response === "object"
          ? (
              ((error as Record<string, unknown>).response as Record<string, unknown>)
                ?.data as Record<string, string> | undefined
            )?.message
          : undefined;
      toast.error(message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="doctor-name">Full Name</Label>
        <Input
          id="doctor-name"
          placeholder="Dr. Emily Carter"
          autoComplete="name"
          {...register("name")}
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="doctor-email">Email</Label>
        <Input
          id="doctor-email"
          type="email"
          placeholder="doctor@example.com"
          autoComplete="email"
          {...register("email")}
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Password row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="doctor-password">Password</Label>
          <Input
            id="doctor-password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register("password")}
            className={errors.password ? "border-destructive" : ""}
          />
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="doctor-confirmPassword">Confirm Password</Label>
          <Input
            id="doctor-confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register("confirmPassword")}
            className={errors.confirmPassword ? "border-destructive" : ""}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      {/* Specialization */}
      <div className="space-y-2">
        <Label htmlFor="doctor-specialization">Specialization</Label>
        <Select
          onValueChange={(value) =>
            setValue("specialization", value, { shouldValidate: true })
          }
        >
          <SelectTrigger
            id="doctor-specialization"
            className={errors.specialization ? "border-destructive" : ""}
          >
            <SelectValue placeholder="Select specialization" />
          </SelectTrigger>
          <SelectContent>
            {SPECIALIZATIONS.map((spec) => (
              <SelectItem key={spec} value={spec}>
                {spec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.specialization && (
          <p className="text-sm text-destructive">
            {errors.specialization.message}
          </p>
        )}
      </div>

      {/* License & Clinic */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="doctor-licenseNumber">License Number</Label>
          <Input
            id="doctor-licenseNumber"
            placeholder="MC-2024-XXXX"
            {...register("licenseNumber")}
            className={errors.licenseNumber ? "border-destructive" : ""}
          />
          {errors.licenseNumber && (
            <p className="text-sm text-destructive">
              {errors.licenseNumber.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="doctor-clinicName">Clinic Name</Label>
          <Input
            id="doctor-clinicName"
            placeholder="HealthFirst Clinic"
            {...register("clinicName")}
            className={errors.clinicName ? "border-destructive" : ""}
          />
          {errors.clinicName && (
            <p className="text-sm text-destructive">
              {errors.clinicName.message}
            </p>
          )}
        </div>
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full gap-2 mt-2" disabled={isLoading}>
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Creating account…
          </span>
        ) : (
          <>
            <UserPlus className="h-4 w-4" />
            Create Doctor Account
          </>
        )}
      </Button>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  Register Page                                                     */
/* ------------------------------------------------------------------ */
export default function Register() {
  const navigate = useNavigate();
  const { isAuthenticated, getRole } = useAuthStore();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const role = getRole();
      navigate(role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard", {
        replace: true,
      });
    }
  }, [isAuthenticated, getRole, navigate]);

  const handleSuccess = () => {
    const role = useAuthStore.getState().getRole();
    navigate(
      role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard",
      { replace: true }
    );
  };

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4 sm:p-6">
      <div className="w-full max-w-lg animate-slide-up">
        <Card className="card-shadow">
          <CardHeader className="text-center space-y-3 pb-2">
            {/* Branding */}
            <div className="mx-auto rounded-xl bg-primary p-2.5 w-fit">
              <Heart
                className="h-7 w-7 text-primary-foreground"
                fill="currentColor"
              />
            </div>
            <div>
              <CardTitle className="font-heading text-2xl">
                Create your account
              </CardTitle>
              <CardDescription className="mt-1">
                Join HEALHUB and take control of your healthcare
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pt-4 space-y-6">
            <Tabs defaultValue="patient" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="patient" className="gap-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Patient
                </TabsTrigger>
                <TabsTrigger value="doctor" className="gap-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="m18 2 4 4" />
                    <path d="m17 7 3-3" />
                    <path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5" />
                    <path d="m9 11 4 4" />
                    <path d="m5 19-3 3" />
                    <path d="m14 4 6 6" />
                  </svg>
                  Doctor
                </TabsTrigger>
              </TabsList>

              <TabsContent value="patient" className="mt-6">
                <PatientForm onSuccess={handleSuccess} />
              </TabsContent>

              <TabsContent value="doctor" className="mt-6">
                <DoctorForm onSuccess={handleSuccess} />
              </TabsContent>
            </Tabs>

            {/* Login link */}
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
