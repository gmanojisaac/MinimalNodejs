"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHealth = getHealth;
const price_service_1 = require("../services/price.service");
const mode_service_1 = require("../services/mode.service");
function getHealth(req, res) {
    res.json({
        status: "ok",
        symbol: (0, price_service_1.getSymbol)(),
        mode: (0, mode_service_1.getMode)(),
    });
}
