import { createContext } from "react";
import type { AuthUser } from "../features/auth/client";

export type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
