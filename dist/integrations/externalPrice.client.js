"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExternalPrice = getExternalPrice;
async function getExternalPrice(symbol) {
    // mock BTC price around 50k with small random variation
    const base = 50000;
    const variation = Math.floor(Math.random() * 1000) - 500; // -500..+499
    return base + variation;
}
