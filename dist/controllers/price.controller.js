"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrice = getPrice;
exports.getPriceCompare = getPriceCompare;
const externalPrice_client_1 = require("../integrations/externalPrice.client");
const price_service_1 = require("../services/price.service");
const mode_service_1 = require("../services/mode.service");
const tickGateway_1 = require("../websockets/tickGateway");
const logger_1 = require("../logger");
async function getPrice(req, res) {
    (0, logger_1.log)("GET price handler called for URL:", req.url);
    const symbol = (0, price_service_1.getSymbol)();
    const mode = (0, mode_service_1.getMode)();
    let price = (0, price_service_1.getCurrentPrice)();
    (0, logger_1.log)("Mode:", mode);
    (0, logger_1.log)("Stored price before:", price);
    if (mode === "API" || price == null) {
        (0, logger_1.log)("Fetching external price for symbol:", symbol);
        price = await (0, externalPrice_client_1.getExternalPrice)(symbol);
        (0, price_service_1.setCurrentPrice)(price);
        (0, logger_1.log)("New price from external source:", price);
    }
    const gateway = (0, tickGateway_1.getTickGateway)();
    if (gateway && price != null) {
        (0, logger_1.log)("Broadcasting tick via WebSocket");
        gateway.broadcast({
            symbol,
            price,
            time: Date.now(),
            source: mode,
        });
    }
    else {
        (0, logger_1.log)("No gateway or price null, not broadcasting");
    }
    res.json({
        symbol,
        price,
        mode,
    });
}
async function getPriceCompare(req, res) {
    (0, logger_1.log)("GET price compare handler called for URL:", req.url);
    const symbol = (0, price_service_1.getSymbol)();
    const mode = (0, mode_service_1.getMode)();
    const currentPrice = (0, price_service_1.getCurrentPrice)();
    (0, logger_1.log)("Current stored price:", currentPrice);
    (0, logger_1.log)("Fetching external price for compare...");
    const externalPrice = await (0, externalPrice_client_1.getExternalPrice)(symbol);
    (0, logger_1.log)("External price:", externalPrice);
    res.json({
        symbol,
        mode,
        currentPrice,
        externalPrice,
    });
}
