import { useEffect } from "react";

// A tiny reusable hook — any page calls usePageTitle('About Us') and
// the browser tab updates automatically. Centralizing the " | Synergein"
// suffix here means changing the site name later only requires one edit.
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | Synergein` : "Synergein";
  }, [title]);
}
