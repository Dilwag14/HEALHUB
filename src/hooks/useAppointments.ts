import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Appointment } from "@/mocks/data";
import { toast } from "sonner";

export function useAppointments() {
  return useQuery<Appointment[]>({
    queryKey: ["appointments"],
    queryFn: async () => {
      const { data } = await api.get("/appointments");
      return data;
    },
  });
}

export function useBookAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (booking: { doctorId: string; date: string; time: string }) => {
      const { data } = await api.post("/appointments", booking);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Appointment booked successfully!");
    },
    onError: () => {
      toast.error("Failed to book appointment. Please try again.");
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const { data } = await api.patch(`/appointments/${appointmentId}`, {
        status: "cancelled",
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Appointment cancelled.");
    },
    onError: () => {
      toast.error("Failed to cancel appointment.");
    },
  });
}

export function useCompleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const { data } = await api.patch(`/appointments/${appointmentId}`, {
        status: "completed",
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment marked as complete.");
    },
    onError: () => {
      toast.error("Failed to update appointment.");
    },
  });
}
