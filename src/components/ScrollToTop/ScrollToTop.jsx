import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// React Router does not automatically reset scroll position when
// navigating between pages (unlike a traditional multi-page site,
// where a full page load naturally resets it). This component fixes
// that: it watches the current URL, and scrolls to top every time
// it changes.
//
// Renders nothing — this is a "logic-only" component, mounted once
// near the top of the app.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
