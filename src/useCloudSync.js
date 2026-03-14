import { useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";

const SYNC_KEYS = [
  "csa-des-days",
  "csa-des-selected-day",
  "csa-des-scores",
  "csa-des-notes",
  "csa-blueprint-checklist",
  "csa-des-flashcards-review-v2",
];

/**
 * Debounced cloud sync hook.
 * Watches localStorage writes and syncs to the server after a short delay.
 */
export default function useCloudSync() {
  const { token, syncProgress } = useAuth();
  const timerRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    // Override localStorage.setItem to detect writes
    const originalSetItem = Storage.prototype.setItem;

    Storage.prototype.setItem = function (key, value) {
      originalSetItem.call(this, key, value);

      if (SYNC_KEYS.includes(key)) {
        // Debounce sync — wait 2 seconds after last write
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          syncProgress();
        }, 2000);
      }
    };

    return () => {
      Storage.prototype.setItem = originalSetItem;
      clearTimeout(timerRef.current);
    };
  }, [token, syncProgress]);
}

