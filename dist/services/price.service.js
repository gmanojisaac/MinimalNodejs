"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSymbol = getSymbol;
exports.getCurrentPrice = getCurrentPrice;
exports.setCurrentPrice = setCurrentPrice;
let currentPrice = null;
const symbol = "BTCUSD";
function getSymbol() {
    return symbol;
}
function getCurrentPrice() {
    return currentPrice;
}
function setCurrentPrice(price) {
    currentPrice = price;
}
