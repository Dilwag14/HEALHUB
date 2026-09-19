import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useNotificationStore } from "@/store/notificationStore";
import { useEffect } from "react";
import type { Notification } from "@/mocks/data";
import { useAuthStore } from "@/store/authStore";

export function useNotifications() {
  const { setNotifications } = useNotificationStore();
  const { isAuthenticated } = useAuthStore();

  const query = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await api.get("/notifications");
      return data;
    },
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (query.data) {
      setNotifications(query.data);
    }
  }, [query.data, setNotifications]);

  return query;
}
