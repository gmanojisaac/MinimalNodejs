import express from "express";
import path from "path";

const app = express();
const PORT = 3000;

// --------- BASIC LOGGING ----------
app.use((req, res, next) => {
  console.log("[SERVER]", req.method, req.url);
  next();
});

// To read JSON bodies in POST
app.use(express.json());

// --------- STATIC & INDEX.HTML ----------
const publicPath = path.join(__dirname, "..", "public");
console.log("[SERVER] Serving static files from:", publicPath);

// Serve index.html explicitly on "/"
app.get("/", (req, res) => {
  const indexPath = path.join(publicPath, "index.html");
  console.log("[SERVER] Handling GET /, sending:", indexPath);
  res.sendFile(indexPath);
});

// Serve other static files (JS, CSS, etc.) if present
app.use(express.static(publicPath));

// --------- PRICE + MODE STATE ----------
let currentPrice: number | null = null;
const symbol = "BTCUSD";

// "API" = always use external/random price
// "MANUAL" = price moves only based on manual direction
let mode: "MANUAL" | "API" = "MANUAL";

// up/down/none for manual mode
let manualDirection: "up" | "down" | "none" = "none";

// generate a random-ish price around base
function randomPrice(base = 50000): number {
  return base + Math.floor(Math.random() * 1000) - 500;
}

// apply one manual step based on direction
function applyManualStep() {
  if (currentPrice == null) {
    currentPrice = randomPrice();
  }

  const STEP = 50;

  if (manualDirection === "up") {
    currentPrice += STEP;
  } else if (manualDirection === "down") {
    currentPrice -= STEP;
  }
}

// --------- ROUTES ----------

// GET /btc-price
// - API mode: always fetch new "external" price and store it
// - MANUAL mode: move price according to manualDirection each time it's called
app.get("/btc-price", (req, res) => {
  if (mode === "API") {
    currentPrice = randomPrice();
    console.log("[SERVER] /btc-price (API mode)", {
      symbol,
      currentPrice,
      mode,
    });
  } else {
    // MANUAL mode
    if (currentPrice === null) {
      currentPrice = randomPrice();
    }
    applyManualStep();
    console.log("[SERVER] /btc-price (MANUAL mode)", {
      symbol,
      currentPrice,
      mode,
      manualDirection,
    });
  }

  res.json({
    symbol,
    price: currentPrice,
    mode,
    manualDirection,
  });
});

// GET /btc-price-compare
// Always fetch a fresh external price and return it alongside currentPrice
app.get("/btc-price-compare", (req, res) => {
  if (currentPrice === null) {
    currentPrice = randomPrice();
  }
  const externalPrice = randomPrice();

  console.log("[SERVER] /btc-price-compare ->", {
    symbol,
    mode,
    currentPrice,
    externalPrice,
  });

  res.json({
    symbol,
    mode,
    currentPrice,
    externalPrice,
  });
});

// POST /mode  { mode: "API" | "MANUAL" }
app.post("/mode", (req, res) => {
  const newMode = req.body.mode as "API" | "MANUAL" | undefined;
  console.log("[SERVER] POST /mode body:", req.body);

  if (newMode !== "API" && newMode !== "MANUAL") {
    return res
      .status(400)
      .json({ error: "mode must be 'API' or 'MANUAL'", received: newMode });
  }

  mode = newMode;
  manualDirection = "none"; // reset direction whenever mode changes

  if (currentPrice === null) {
    currentPrice = randomPrice();
  }

  console.log("[SERVER] Mode changed to:", mode);

  res.json({
    message: "Mode updated",
    mode,
    manualDirection,
    currentPrice,
  });
});

// POST /manual-direction  { direction: "up" | "down" | "none" }
app.post("/manual-direction", (req, res) => {
  const direction = req.body.direction as "up" | "down" | "none" | undefined;
  console.log("[SERVER] POST /manual-direction body:", req.body);

  if (direction !== "up" && direction !== "down" && direction !== "none") {
    return res.status(400).json({
      error: "direction must be 'up', 'down', or 'none'",
      received: direction,
    });
  }

  manualDirection = direction;

  // apply one immediate step so user feels it right away
  if (mode === "MANUAL") {
    applyManualStep();
  } else if (currentPrice === null) {
    currentPrice = randomPrice();
  }

  console.log("[SERVER] Manual direction set:", manualDirection, {
    currentPrice,
    mode,
  });

  res.json({
    message: "Manual direction updated",
    mode,
    manualDirection,
    currentPrice,
  });
});

// --------- START SERVER ----------
app.listen(PORT, () => {
  console.log(`[SERVER] Listening on http://localhost:${PORT}`);
});
