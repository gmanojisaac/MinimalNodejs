"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMode = updateMode;
exports.updateManualDirection = updateManualDirection;
const mode_service_1 = require("../services/mode.service");
const price_service_1 = require("../services/price.service");
const tickGateway_1 = require("../websockets/tickGateway");
const logger_1 = require("../logger");
function updateMode(req, res) {
    (0, logger_1.log)("POST /mode called with body:", req.body);
    const { mode } = req.body;
    if (mode !== "API" && mode !== "MANUAL") {
        (0, logger_1.log)("Invalid mode:", mode);
        return res.status(400).json({ error: "mode must be API or MANUAL" });
    }
    (0, mode_service_1.setMode)(mode);
    (0, logger_1.log)("Mode changed to:", mode);
    return res.json({ message: "Mode updated", mode: (0, mode_service_1.getMode)() });
}
function updateManualDirection(req, res) {
    (0, logger_1.log)("POST /manual-direction called with body:", req.body);
    const { direction } = req.body;
    if (direction !== "up" && direction !== "down" && "none" !== direction) {
        (0, logger_1.log)("Invalid manual direction:", direction);
        return res.status(400).json({ error: "direction must be up/down/none" });
    }
    (0, mode_service_1.setManualDirection)(direction);
    (0, logger_1.log)("Manual direction set:", direction);
    let price = (0, price_service_1.getCurrentPrice)() ?? 50000;
    const step = 50;
    if (direction === "up")
        price += step;
    if (direction === "down")
        price -= step;
    (0, price_service_1.setCurrentPrice)(price);
    (0, logger_1.log)("Updated manual price:", price);
    const gateway = (0, tickGateway_1.getTickGateway)();
    if (gateway) {
        gateway.broadcast({
            symbol: (0, price_service_1.getSymbol)(),
            price,
            time: Date.now(),
            source: (0, mode_service_1.getMode)(),
        });
    }
    res.json({ message: "Direction updated", direction, price });
}
