export function log(...args: any[]) {
  console.log("[LOG]", ...args);
}

export function warn(...args: any[]) {
  console.warn("[WARN]", ...args);
}

export function error(...args: any[]) {
  console.error("[ERROR]", ...args);
}
