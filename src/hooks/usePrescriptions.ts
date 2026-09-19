import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Prescription } from "@/mocks/data";
import { toast } from "sonner";

export function usePrescription(id: string | undefined) {
  return useQuery<Prescription>({
    queryKey: ["prescription", id],
    queryFn: async () => {
      const { data } = await api.get(`/prescriptions/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreatePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prescription: {
      appointmentId: string;
      diagnosis: string;
      medications: { name: string; dosage: string; duration: string }[];
      notes: string;
    }) => {
      const { data } = await api.post("/prescriptions", prescription);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["health-records"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Prescription created successfully!");
    },
    onError: () => {
      toast.error("Failed to create prescription.");
    },
  });
}
