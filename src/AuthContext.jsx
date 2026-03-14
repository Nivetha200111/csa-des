import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiGetMe, apiGetProgress, apiLogin, apiRegister, apiBulkSaveProgress } from "./api";

const AuthContext = createContext(null);

const TOKEN_KEY = "csa-auth-token";

// Storage keys matching App.jsx
const LOCAL_KEYS = {
  days: "csa-des-days",
  selectedDay: "csa-des-selected-day",
  scores: "csa-des-scores",
  notes: "csa-des-notes",
  blueprint: "csa-blueprint-checklist",
  flashcards: "csa-des-flashcards-review-v2",
};

function collectLocalProgress() {
  const progress = {};
  for (const [key, storageKey] of Object.entries(LOCAL_KEYS)) {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) progress[key] = JSON.parse(raw);
    } catch {
      // skip invalid entries
    }
  }
  return progress;
}

function applyProgressToLocal(progress) {
  for (const [key, storageKey] of Object.entries(LOCAL_KEYS)) {
    if (progress[key] !== undefined) {
      localStorage.setItem(storageKey, JSON.stringify(progress[key]));
    }
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // On mount, validate existing token
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    apiGetMe()
      .then(({ user: u }) => {
        setUser(u);
        // Load cloud progress into localStorage
        return apiGetProgress();
      })
      .then(({ progress }) => {
        if (progress && Object.keys(progress).length > 0) {
          applyProgressToLocal(progress);
          // Trigger a storage event so App.jsx picks up the new values
          window.dispatchEvent(new Event("cloud-progress-loaded"));
        }
      })
      .catch(() => {
        // Token expired or invalid
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (email, password) => {
    const { user: u, token: t } = await apiLogin(email, password);
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
    setUser(u);

    // Download cloud progress
    try {
      const { progress } = await apiGetProgress();
      if (progress && Object.keys(progress).length > 0) {
        applyProgressToLocal(progress);
        window.dispatchEvent(new Event("cloud-progress-loaded"));
      } else {
        // First login with no cloud data — upload local data
        const local = collectLocalProgress();
        if (Object.keys(local).length > 0) {
          await apiBulkSaveProgress(local);
        }
      }
    } catch {
      // Non-fatal
    }
  }, []);

  const register = useCallback(async (email, name, password) => {
    const { user: u, token: t } = await apiRegister(email, name, password);
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
    setUser(u);

    // Upload existing local progress to the new account
    try {
      const local = collectLocalProgress();
      if (Object.keys(local).length > 0) {
        await apiBulkSaveProgress(local);
      }
    } catch {
      // Non-fatal
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const syncProgress = useCallback(async () => {
    if (!token) return;

    setSyncing(true);
    try {
      const local = collectLocalProgress();
      await apiBulkSaveProgress(local);
    } catch {
      // silent fail
    } finally {
      setSyncing(false);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, loading, syncing, login, register, logout, syncProgress }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

