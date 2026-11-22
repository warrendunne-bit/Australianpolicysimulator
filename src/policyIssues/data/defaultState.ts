import type { SimulationState } from "../core/types";
import { calibrationValues, stateCalibration } from "./calibration";

export const defaultState: SimulationState = calibrationValues(stateCalibration);
