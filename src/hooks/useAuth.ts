import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export function useAuth() {
  const store = useAuthStore();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const { data } = await api.get("/auth/me");
      return data;
    },
    enabled: store.isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  return {
    ...store,
    profile: profile?.profile,
    isLoading,
  };
}
