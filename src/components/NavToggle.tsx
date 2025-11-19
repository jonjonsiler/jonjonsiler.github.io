import { useCallback, useEffect, useMemo, useState } from "react";

const NAV_TOGGLE_SELECTOR = "[data-nav-toggle]";
const SMALL_SCREEN_QUERY = "(max-width: 767px)";
const { CLOSED, OPEN } = {CLOSED: "closed", OPEN: "open"};

type NavState = typeof CLOSED | typeof OPEN;

const NavToggle = () => {
  const isBrowser =
    typeof window !== "undefined" && typeof document !== "undefined";
  const getDefaultState = (): NavState => !isBrowser ? OPEN : window.matchMedia(SMALL_SCREEN_QUERY).matches ? CLOSED : OPEN;

  const syncDomState = (nextState: NavState) => {
    if (!isBrowser) return;
    document.body.dataset.navState = nextState;
    const toggles = document.querySelectorAll(NAV_TOGGLE_SELECTOR);
    toggles.forEach((toggle) => toggle.setAttribute("aria-expanded", nextState === OPEN ? "true" : "false"));
  };

  const [navState, setNavState] = useState<NavState>(() => getDefaultState());
  const isOpen = navState === OPEN;

  const handleToggle = useCallback(() => setNavState((prev) => (prev === OPEN ? CLOSED : OPEN)), []);

  useEffect(() => syncDomState(navState), [navState]);

  useEffect(() => {
    if (!isBrowser) return;
    const query = window.matchMedia(SMALL_SCREEN_QUERY);
    const controller = new AbortController();
    const { signal } = controller;
    const handleSmallScreenChange = (event: MediaQueryListEvent) => {
      if (event.matches) setNavState(CLOSED);
    };

    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", handleSmallScreenChange, { signal });
    } else {
      query.addListener(handleSmallScreenChange);
      signal.addEventListener(
        "abort",
        () => query.removeListener(handleSmallScreenChange),
        { once: true }
      );
    }
    return () => controller.abort();
  }, []);

  return (
    <button
      type="button"
      className="btn btn-muted btn-sm z-40 flex h-11 w-11 mr-3 items-center justify-center rounded-2xl border border-sky-400/40 bg-sky-400/20 shadow-inner shadow-sky-500/30 transition hover:border-sky-300/80 hover:bg-sky-300/25"
      data-nav-toggle
      aria-controls="primary-navigation"
      aria-expanded={isOpen}
      onClick={handleToggle}
    >
      <span className="sr-only">Toggle navigation rail</span>
      <i className="text-sm font-semibold text-sky-200">JS</i>
    </button>
  );
};

export default NavToggle;
