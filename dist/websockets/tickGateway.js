"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTickGateway = createTickGateway;
exports.setTickGateway = setTickGateway;
exports.getTickGateway = getTickGateway;
const logger_1 = require("../logger");
let gatewayInstance = null;
function createTickGateway(wss) {
    (0, logger_1.log)("Creating WebSocket tick gateway...");
    wss.on("connection", () => {
        (0, logger_1.log)("New WebSocket client connected");
    });
    return {
        broadcast(tick) {
            (0, logger_1.log)("Broadcasting tick:", tick);
            const payload = JSON.stringify(tick);
            wss.clients.forEach((client) => {
                if (client.readyState === client.OPEN) {
                    client.send(payload);
                }
            });
        },
    };
}
function setTickGateway(gateway) {
    (0, logger_1.log)("Tick gateway set");
    gatewayInstance = gateway;
}
function getTickGateway() {
    return gatewayInstance;
}
