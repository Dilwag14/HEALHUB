import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { HealthRecord } from "@/mocks/data";
import { toast } from "sonner";

export function useHealthRecords(patientId?: string) {
  return useQuery<HealthRecord[]>({
    queryKey: ["health-records", patientId],
    queryFn: async () => {
      const params = patientId ? `?patientId=${patientId}` : "";
      const { data } = await api.get(`/health-records${params}`);
      return data;
    },
  });
}

export function useUploadRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recordId, file }: { recordId: string; file: string }) => {
      const { data } = await api.post("/health-records/upload", { recordId, file });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health-records"] });
      toast.success("File uploaded successfully!");
    },
    onError: () => {
      toast.error("Failed to upload file.");
    },
  });
}
