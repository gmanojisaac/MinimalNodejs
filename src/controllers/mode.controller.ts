import { Request, Response } from "express";
import { getMode, setMode, setManualDirection, getManualDirection } from "../services/mode.service";
import { getCurrentPrice, setCurrentPrice, getSymbol } from "../services/price.service";
import { getTickGateway } from "../websockets/tickGateway";
import { log } from "../logger";

export function updateMode(req: Request, res: Response) {
  log("POST /mode called with body:", req.body);

  const { mode } = req.body;

  if (mode !== "API" && mode !== "MANUAL") {
    log("Invalid mode:", mode);
    return res.status(400).json({ error: "mode must be API or MANUAL" });
  }

  setMode(mode);
  log("Mode changed to:", mode);

  return res.json({ message: "Mode updated", mode: getMode() });
}

export function updateManualDirection(req: Request, res: Response) {
  log("POST /manual-direction called with body:", req.body);

  const { direction } = req.body;

  if (direction !== "up" && direction !== "down" && "none" !== direction) {
    log("Invalid manual direction:", direction);
    return res.status(400).json({ error: "direction must be up/down/none" });
  }

  setManualDirection(direction);
  log("Manual direction set:", direction);

  let price = getCurrentPrice() ?? 50000;
  const step = 50;

  if (direction === "up") price += step;
  if (direction === "down") price -= step;

  setCurrentPrice(price);
  log("Updated manual price:", price);

  const gateway = getTickGateway();
  if (gateway) {
    gateway.broadcast({
      symbol: getSymbol(),
      price,
      time: Date.now(),
      source: getMode(),
    });
  }

  res.json({ message: "Direction updated", direction, price });
}
