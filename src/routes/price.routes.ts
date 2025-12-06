import { Router } from "express";
import { getPrice, getPriceCompare } from "../controllers/price.controller";

export const priceRouter = Router();

// Extra aliases to match your frontend calls
priceRouter.get("/btc-price", getPrice);
priceRouter.get("/btc-price-compare", getPriceCompare);

priceRouter.get("/price", getPrice);
priceRouter.get("/price/compare", getPriceCompare);
