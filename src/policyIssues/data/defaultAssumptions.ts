import type { Assumptions } from "../core/types";
import { assumptionCalibration, calibrationValues } from "./calibration";

export const defaultAssumptions: Assumptions = calibrationValues(assumptionCalibration);
