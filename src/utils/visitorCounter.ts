import { useState, useEffect } from "react";

const COUNTER_API_URL = "https://api.counterapi.dev/v1/mayor-simulator-gripet43/pv";

export function useVisitorCount(): number | null {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function incrementAndFetch() {
      try {
        const hasHitThisSession = sessionStorage.getItem("has_hit_pv");
        const endpoint = hasHitThisSession ? COUNTER_API_URL : `${COUNTER_API_URL}/up`;

        const res = await fetch(endpoint, { method: "GET" });
        if (res.ok) {
          const data = await res.json();
          if (typeof data.count === "number" && isMounted) {
            setCount(data.count);
            if (!hasHitThisSession) {
              sessionStorage.setItem("has_hit_pv", "true");
            }
            return;
          }
        }
      } catch (err) {
        // Fallthrough to local fallback if network / adblocker blocks external API
      }

      if (isMounted) {
        const localPV = parseInt(localStorage.getItem("fallback_local_pv") || "128", 10);
        const nextPV = localPV + 1;
        localStorage.setItem("fallback_local_pv", nextPV.toString());
        setCount(nextPV);
      }
    }

    incrementAndFetch();

    return () => {
      isMounted = false;
    };
  }, []);

  return count;
}
