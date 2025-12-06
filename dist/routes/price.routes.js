"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.priceRouter = void 0;
const express_1 = require("express");
const price_controller_1 = require("../controllers/price.controller");
exports.priceRouter = (0, express_1.Router)();
// Extra aliases to match your frontend calls
exports.priceRouter.get("/btc-price", price_controller_1.getPrice);
exports.priceRouter.get("/btc-price-compare", price_controller_1.getPriceCompare);
exports.priceRouter.get("/price", price_controller_1.getPrice);
exports.priceRouter.get("/price/compare", price_controller_1.getPriceCompare);
