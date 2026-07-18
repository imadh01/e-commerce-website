import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// React Router does not automatically reset scroll position when
// navigating between pages (unlike a traditional multi-page site,
// where a full page load naturally resets it). This component fixes
// that: it watches the current URL, and scrolls to top every time
// it changes.

// It also disables the browser's built-in scroll restoration on
// refresh — by default some browsers try to restore your previous
// scroll position after a hard refresh, which we're deliberately
// overriding so every fresh load always starts at the top.
if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
