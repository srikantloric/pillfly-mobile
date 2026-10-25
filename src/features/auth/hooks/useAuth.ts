import { useShallow } from "zustand/react/shallow";

import { useAuthStore } from "../store/auth.store";

/** Whole auth store (state + actions); re-renders only when a top-level field changes. */
export function useAuth() {
  return useAuthStore(useShallow((state) => state));
}
