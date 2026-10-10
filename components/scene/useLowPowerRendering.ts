"use client";

import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = "(max-width: 720px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function readLowPowerPreference() {
  if (typeof window === "undefined") return true;
  const cores = navigator.hardwareConcurrency || 0;
  return (
    window.matchMedia(MOBILE_BREAKPOINT).matches ||
    window.matchMedia(REDUCED_MOTION_QUERY).matches ||
    (cores > 0 && cores <= 4)
  );
}

export function useLowPowerRendering() {
  const [lowPower, setLowPower] = useState(readLowPowerPreference);

  useEffect(() => {
    const mobileQuery = window.matchMedia(MOBILE_BREAKPOINT);
    const motionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    const update = () => setLowPower(readLowPowerPreference());

    update();
    mobileQuery.addEventListener("change", update);
    motionQuery.addEventListener("change", update);
    window.addEventListener("resize", update, { passive: true });

    return () => {
      mobileQuery.removeEventListener("change", update);
      motionQuery.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return lowPower;
}
