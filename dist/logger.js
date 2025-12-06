"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = log;
exports.warn = warn;
exports.error = error;
function log(...args) {
    console.log("[LOG]", ...args);
}
function warn(...args) {
    console.warn("[WARN]", ...args);
}
function error(...args) {
    console.error("[ERROR]", ...args);
}
