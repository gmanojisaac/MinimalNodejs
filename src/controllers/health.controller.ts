import { Request, Response } from "express";
import { getSymbol } from "../services/price.service";
import { getMode } from "../services/mode.service";

export function getHealth(req: Request, res: Response) {
  res.json({
    status: "ok",
    symbol: getSymbol(),
    mode: getMode(),
  });
}
