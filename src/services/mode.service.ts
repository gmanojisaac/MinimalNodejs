export type Mode = "API" | "MANUAL";
export type ManualDirection = "up" | "down" | "none";

let mode: Mode = "MANUAL";
let manualDirection: ManualDirection = "none";

export function getMode(): Mode {
  return mode;
}

export function setMode(newMode: Mode) {
  mode = newMode;
  // whenever we change mode, reset direction
  manualDirection = "none";
}

export function getManualDirection(): ManualDirection {
  return manualDirection;
}

export function setManualDirection(direction: ManualDirection) {
  manualDirection = direction;
}
