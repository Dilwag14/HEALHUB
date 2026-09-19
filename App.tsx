import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import DoctorSearch from "@/pages/DoctorSearch";
import PatientDashboard from "@/pages/patient/Dashboard";
import PatientAppointments from "@/pages/patient/Appointments";
import PatientHealthRecords from "@/pages/patient/HealthRecords";
import DoctorDashboard from "@/pages/doctor/Dashboard";
import DoctorAppointments from "@/pages/doctor/Appointments";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes with layout */}
          <Route element={<Layout />}>
            {/* Doctor search - accessible by any authenticated user */}
            <Route
              path="/doctors"
              element={
                <ProtectedRoute>
                  <DoctorSearch />
                </ProtectedRoute>
              }
            />

            {/* Patient routes */}
            <Route
              path="/patient/dashboard"
              element={
                <ProtectedRoute role="patient">
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/appointments"
              element={
                <ProtectedRoute role="patient">
                  <PatientAppointments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/records"
              element={
                <ProtectedRoute role="patient">
                  <PatientHealthRecords />
                </ProtectedRoute>
              }
            />

            {/* Doctor routes */}
            <Route
              path="/doctor/dashboard"
              element={
                <ProtectedRoute role="doctor">
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/appointments"
              element={
                <ProtectedRoute role="doctor">
                  <DoctorAppointments />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  );
}
