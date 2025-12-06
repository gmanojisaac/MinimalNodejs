import { Request, Response } from "express";
import { getExternalPrice } from "../integrations/externalPrice.client";
import {
  getCurrentPrice,
  setCurrentPrice,
  getSymbol,
} from "../services/price.service";
import { getMode } from "../services/mode.service";
import { getTickGateway } from "../websockets/tickGateway";
import { log } from "../logger";

export async function getPrice(req: Request, res: Response) {
  log("GET price handler called for URL:", req.url);

  const symbol = getSymbol();
  const mode = getMode();
  let price = getCurrentPrice();

  log("Mode:", mode);
  log("Stored price before:", price);

  if (mode === "API" || price == null) {
    log("Fetching external price for symbol:", symbol);
    price = await getExternalPrice(symbol);
    setCurrentPrice(price);
    log("New price from external source:", price);
  }

  const gateway = getTickGateway();
  if (gateway && price != null) {
    log("Broadcasting tick via WebSocket");
    gateway.broadcast({
      symbol,
      price,
      time: Date.now(),
      source: mode,
    });
  } else {
    log("No gateway or price null, not broadcasting");
  }

  res.json({
    symbol,
    price,
    mode,
  });
}

export async function getPriceCompare(req: Request, res: Response) {
  log("GET price compare handler called for URL:", req.url);

  const symbol = getSymbol();
  const mode = getMode();
  const currentPrice = getCurrentPrice();

  log("Current stored price:", currentPrice);
  log("Fetching external price for compare...");

  const externalPrice = await getExternalPrice(symbol);

  log("External price:", externalPrice);

  res.json({
    symbol,
    mode,
    currentPrice,
    externalPrice,
  });
}
