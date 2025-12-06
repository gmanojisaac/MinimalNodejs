import http from "http";
import { WebSocketServer } from "ws";
import { app } from "./app";
import { createTickGateway, setTickGateway } from "./websockets/tickGateway";
import { log } from "./logger";

const PORT = 3000;

log("Starting server...");

const server = http.createServer(app);

const wss = new WebSocketServer({ server });

log("WebSocket server created");

// tick gateway
const gateway = createTickGateway(wss);
setTickGateway(gateway);

log("Tick gateway initialized");

server.listen(PORT, () => {
  log(`HTTP server running on http://localhost:${PORT}`);
});
