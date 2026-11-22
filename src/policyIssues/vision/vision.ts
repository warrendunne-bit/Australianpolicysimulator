import { useState } from "react";

export const visionPriorities = {
  prosperity: { label: "Prosperity", description: "Household living standards, productive jobs and a strong economy." },
  security: { label: "Security", description: "Stable housing, reliable services and the ability to withstand shocks." },
  fairness: { label: "Fairness", description: "Who benefits, who pays and how outcomes differ across groups." },
  agency: { label: "Freedom and agency", description: "Having options and control over everyday decisions." },
  wellbeing: { label: "Wellbeing", description: "Health, social connection and quality of life." },
  sustainability: { label: "Sustainability", description: "A healthy environment and resources for future generations." },
} as const;

export type VisionPriority = keyof typeof visionPriorities;

export interface CountryVisionValue {
  primary: VisionPriority | null;
  secondary: VisionPriority | null;
}

export const visionStorageKey = "social-simulator:country-vision:v1";
export const emptyCountryVision: CountryVisionValue = { primary: null, secondary: null };

export function isVisionPriority(value: unknown): value is VisionPriority {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(visionPriorities, value);
}

function validateVision(value: unknown): CountryVisionValue {
  if (typeof value !== "object" || value === null || !("primary" in value) || !isVisionPriority(value.primary)) {
    return emptyCountryVision;
  }
  const secondary = "secondary" in value && isVisionPriority(value.secondary) && value.secondary !== value.primary
    ? value.secondary
    : null;
  return { primary: value.primary, secondary };
}

function readVision(): CountryVisionValue {
  try {
    const stored = window.localStorage.getItem(visionStorageKey);
    return stored ? validateVision(JSON.parse(stored)) : emptyCountryVision;
  } catch {
    return emptyCountryVision;
  }
}

export function useCountryVision() {
  const [vision, setCurrentVision] = useState(readVision);

  function setVision(value: CountryVisionValue) {
    const next = validateVision(value);
    setCurrentVision(next);

    try {
      if (next.primary) window.localStorage.setItem(visionStorageKey, JSON.stringify(next));
      else window.localStorage.removeItem(visionStorageKey);
      return true;
    } catch {
      return false;
    }
  }

  return { vision, setVision };
}
