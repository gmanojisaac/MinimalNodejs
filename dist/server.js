"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
const app_1 = require("./app");
const tickGateway_1 = require("./websockets/tickGateway");
const logger_1 = require("./logger");
const PORT = 3000;
(0, logger_1.log)("Starting server...");
const server = http_1.default.createServer(app_1.app);
const wss = new ws_1.WebSocketServer({ server });
(0, logger_1.log)("WebSocket server created");
// tick gateway
const gateway = (0, tickGateway_1.createTickGateway)(wss);
(0, tickGateway_1.setTickGateway)(gateway);
(0, logger_1.log)("Tick gateway initialized");
server.listen(PORT, () => {
    (0, logger_1.log)(`HTTP server running on http://localhost:${PORT}`);
});
