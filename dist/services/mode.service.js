"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMode = getMode;
exports.setMode = setMode;
exports.getManualDirection = getManualDirection;
exports.setManualDirection = setManualDirection;
let mode = "MANUAL";
let manualDirection = "none";
function getMode() {
    return mode;
}
function setMode(newMode) {
    mode = newMode;
    // whenever we change mode, reset direction
    manualDirection = "none";
}
function getManualDirection() {
    return manualDirection;
}
function setManualDirection(direction) {
    manualDirection = direction;
}
