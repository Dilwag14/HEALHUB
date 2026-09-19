import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Doctor } from "@/mocks/data";

interface DoctorFilters {
  search?: string;
  specialization?: string;
  availability?: string;
  minRating?: number;
}

export function useDoctors(filters: DoctorFilters = {}) {
  return useQuery<Doctor[]>({
    queryKey: ["doctors", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.specialization) params.set("specialization", filters.specialization);
      if (filters.availability) params.set("availability", filters.availability);
      if (filters.minRating) params.set("minRating", String(filters.minRating));
      const { data } = await api.get(`/doctors?${params.toString()}`);
      return data;
    },
  });
}

export function useDoctor(id: string) {
  return useQuery<Doctor>({
    queryKey: ["doctor", id],
    queryFn: async () => {
      const { data } = await api.get(`/doctors/${id}`);
      return data;
    },
    enabled: !!id,
  });
}
