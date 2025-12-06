import express from "express";
import path from "path";
import { healthRouter } from "./routes/health.routes";
import { priceRouter } from "./routes/price.routes";
import { modeRouter } from "./routes/mode.routes";
import { log } from "./logger";
import { getPrice, getPriceCompare } from "./controllers/price.controller";

export const app = express();

log("Initializing app...");

app.use(express.json());

// Request logger
app.use((req, res, next) => {
  log("Incoming request:", req.method, req.url);
  next();
});

const publicPath = path.join(__dirname, "..", "public");
log("Serving static files from:", publicPath);
app.use(express.static(publicPath));

// ✅ Root-level aliases for your frontend
app.get("/btc-price", getPrice);
app.get("/btc-price-compare", getPriceCompare);

log("Mounting /api routes...");
app.use("/api", healthRouter);
app.use("/api", priceRouter);
app.use("/api", modeRouter);

log("App initialized");
