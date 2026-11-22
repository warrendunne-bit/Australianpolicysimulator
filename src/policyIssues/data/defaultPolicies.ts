import type { PolicySettings } from "../core/types";
import { calibrationValues, policyCalibration } from "./calibration";

export const defaultPolicies: PolicySettings = calibrationValues(policyCalibration);
