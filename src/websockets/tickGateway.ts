import { WebSocketServer } from "ws";
import { Tick } from "../types/tick";
import { log } from "../logger";

export interface TickGateway {
  broadcast(tick: Tick): void;
}

let gatewayInstance: TickGateway | null = null;

export function createTickGateway(wss: WebSocketServer): TickGateway {
  log("Creating WebSocket tick gateway...");

  wss.on("connection", () => {
    log("New WebSocket client connected");
  });

  return {
    broadcast(tick: Tick) {
      log("Broadcasting tick:", tick);

      const payload = JSON.stringify(tick);
      wss.clients.forEach((client: any) => {
        if (client.readyState === client.OPEN) {
          client.send(payload);
        }
      });
    },
  };
}

export function setTickGateway(gateway: TickGateway) {
  log("Tick gateway set");
  gatewayInstance = gateway;
}

export function getTickGateway(): TickGateway | null {
  return gatewayInstance;
}
