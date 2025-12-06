"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const health_routes_1 = require("./routes/health.routes");
const price_routes_1 = require("./routes/price.routes");
const mode_routes_1 = require("./routes/mode.routes");
const logger_1 = require("./logger");
const price_controller_1 = require("./controllers/price.controller");
exports.app = (0, express_1.default)();
(0, logger_1.log)("Initializing app...");
exports.app.use(express_1.default.json());
// Request logger
exports.app.use((req, res, next) => {
    (0, logger_1.log)("Incoming request:", req.method, req.url);
    next();
});
const publicPath = path_1.default.join(__dirname, "..", "public");
(0, logger_1.log)("Serving static files from:", publicPath);
exports.app.use(express_1.default.static(publicPath));
// ✅ Root-level aliases for your frontend
exports.app.get("/btc-price", price_controller_1.getPrice);
exports.app.get("/btc-price-compare", price_controller_1.getPriceCompare);
(0, logger_1.log)("Mounting /api routes...");
exports.app.use("/api", health_routes_1.healthRouter);
exports.app.use("/api", price_routes_1.priceRouter);
exports.app.use("/api", mode_routes_1.modeRouter);
(0, logger_1.log)("App initialized");
