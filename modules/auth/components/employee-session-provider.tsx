"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { SessionUser } from "@/modules/auth/auth.types";
import {
  canAccessCrmShell,
  canAccessDispatcherWorkspace,
  canAccessKitchenWorkspace,
  hasPermission,
  type AuthPermission,
} from "@/modules/auth/authz";
import { browserBackendJson } from "@/shared/api/browser-backend";

type EmployeeSessionStatus = "authenticated" | "anonymous" | "refreshing" | "error";

type EmployeeSessionContextValue = {
  user: SessionUser | null;
  role: SessionUser["role"] | null;
  permissions: string[];
  status: EmployeeSessionStatus;
  can: (permission: AuthPermission) => boolean;
  canAccessCrm: boolean;
  canAccessDispatcher: boolean;
  canAccessKitchen: boolean;
  refreshSession: () => Promise<SessionUser | null>;
  clearSessionState: () => void;
};

const EmployeeSessionContext = createContext<EmployeeSessionContextValue | null>(null);

export function EmployeeSessionProvider({
  initialUser,
  children,
}: {
  initialUser: SessionUser | null;
  children: ReactNode;
}) {
  const [user, setUser] = useState(initialUser);
  const [status, setStatus] = useState<EmployeeSessionStatus>(initialUser ? "authenticated" : "anonymous");
  const refreshPromiseRef = useRef<Promise<SessionUser | null> | null>(null);

  const refreshSession = useCallback(async () => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    setStatus("refreshing");
    refreshPromiseRef.current = browserBackendJson<SessionUser | null>("/api/v1/auth/me", {
      method: "GET",
    })
      .then((nextUser) => {
        setUser(nextUser);
        setStatus(nextUser ? "authenticated" : "anonymous");
        return nextUser;
      })
      .catch((error: unknown) => {
        setStatus("error");
        throw error;
      })
      .finally(() => {
        refreshPromiseRef.current = null;
      });

    return refreshPromiseRef.current;
  }, []);

  const clearSessionState = useCallback(() => {
    setUser(null);
    setStatus("anonymous");
  }, []);

  const value = useMemo<EmployeeSessionContextValue>(() => ({
    user,
    role: user?.role ?? null,
    permissions: user?.permissions ?? [],
    status,
    can: (permission) => (user ? hasPermission(user, permission) : false),
    canAccessCrm: user ? canAccessCrmShell(user) : false,
    canAccessDispatcher: user ? canAccessDispatcherWorkspace(user) : false,
    canAccessKitchen: user ? canAccessKitchenWorkspace(user) : false,
    refreshSession,
    clearSessionState,
  }), [clearSessionState, refreshSession, status, user]);

  return (
    <EmployeeSessionContext.Provider value={value}>
      {children}
    </EmployeeSessionContext.Provider>
  );
}

export function useEmployeeSession() {
  const context = useContext(EmployeeSessionContext);

  if (!context) {
    throw new Error("useEmployeeSession must be used inside EmployeeSessionProvider");
  }

  return context;
}
