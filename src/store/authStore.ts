import { create } from "zustand";
import type { User, UserRole } from "@/mocks/data";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  isDoctor: () => boolean;
  isPatient: () => boolean;
  getRole: () => UserRole | null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: (() => {
    try {
      const stored = localStorage.getItem("healhub_user") || localStorage.getItem("ambula_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem("healhub_token") || localStorage.getItem("ambula_token"),
  isAuthenticated: !!(localStorage.getItem("healhub_token") || localStorage.getItem("ambula_token")),

  login: (user: User, token: string) => {
    localStorage.setItem("healhub_token", token);
    localStorage.setItem("healhub_user", JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("healhub_token");
    localStorage.removeItem("healhub_user");
    localStorage.removeItem("ambula_token");
    localStorage.removeItem("ambula_user");
    set({ user: null, token: null, isAuthenticated: false });
  },

  isDoctor: () => get().user?.role === "doctor",
  isPatient: () => get().user?.role === "patient",
  getRole: () => get().user?.role ?? null,
}));
