import express from "express";
import path from "path";
import dotenv from "dotenv";
import WebSocket from "ws";

// Load .env
dotenv.config();

// ---------- CONSTANTS ----------
const PORT = 3000;
// Adjust symbol to what Delta expects (e.g. BTCUSD / BTCUSDT)
const SYMBOL = "BTCUSD";

// ---------- EXPRESS APP ----------
const app = express();

// Parse JSON bodies
app.use(express.json());

// Basic request logger
app.use((req, res, next) => {
  console.log("[SERVER]", req.method, req.url);
  next();
});

// ---------- STATIC FILES & INDEX ----------
const publicPath = path.join(__dirname, "..", "public");
console.log("[SERVER] Serving static files from:", publicPath);

app.get("/", (req, res) => {
  const indexPath = path.join(publicPath, "index.html");
  console.log("[SERVER] Handling GET /, sending:", indexPath);
  res.sendFile(indexPath);
});

app.use(express.static(publicPath));

// ---------- DELTA REST CLIENT (lazy + safe) ----------
const DeltaRestClient = require("delta-rest-client");

// we keep a single promise of the client so it's only constructed once
let deltaClientPromise: Promise<any> | null = null;

function toNumberOrNull(v: any): number | null {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}


/**
 * Lazily initialize delta-rest-client and fetch a price.
 * - Never crashes server if keys are missing or request fails.
 * - Logs everything with [DELTA-REST] prefix.
 */
async function fetchDeltaRestPrice(symbol: string = SYMBOL): Promise<number | null> {
  try {
    if (!deltaClientPromise) {
      const apiKey = process.env.DELTA_API_KEY ?? "";
      const apiSecret = process.env.DELTA_API_SECRET ?? "";

      if (!apiKey || !apiSecret) {
        console.warn(
          "[DELTA-REST] Missing DELTA_API_KEY or DELTA_API_SECRET. Skipping REST call."
        );
        return null;
      }

      console.log(
        "[DELTA-REST] Initializing client. key length:",
        apiKey.length,
        "secret length:",
        apiSecret.length
      );

      // This matches the official node-client usage:
      // new DeltaRestClient(api_key, api_secret).then(client => { ... })
      deltaClientPromise = new DeltaRestClient(apiKey, apiSecret);
    }

    const client = await deltaClientPromise;

    console.log("[DELTA-REST] Fetching ticker for", symbol);

    // According to README: client.apis.Products.getProducts(), getOrders, etc.
    // You likely want Products.getTicker or similar; adapt this call
    // to whatever you had in your original deltaRest.ts.
    //
    // Example pattern (you *must* adjust based on your working code):
    const response = await client.apis.Products.getTicker({ symbol });

    const rawData =
      typeof response.data === "string"
        ? response.data
        : response.data?.toString?.() ?? "";

    if (!rawData) {
      console.warn("[DELTA-REST] Empty response from getTicker");
      return null;
    }

    const body = JSON.parse(rawData);

    // Many Delta APIs use { result: {...} } or { result: [ {...} ] }
    let ticker: any = body;
    if (body.result) {
      ticker = Array.isArray(body.result) ? body.result[0] : body.result;
    }

    const rawPrice =
      ticker.last_price ??
      ticker.mark_price ??
      ticker.index_price ??
      ticker.close ??
      ticker.spot_price ??
      ticker.ask ??
      ticker.bid ??
      null;

    const price = toNumberOrNull(rawPrice);
    if (price == null) {
      console.warn("[DELTA-REST] Could not parse numeric price from:", rawPrice);
      return null;
    }

    console.log(`[DELTA-REST] ${symbol} price = ${price}`);
    return price;
  } catch (err: any) {
    console.error(
      "[DELTA-REST] Error in fetchDeltaRestPrice:",
      err?.message ?? err
    );
    return null;
  }
}

// ---------- DELTA WEBSOCKET CLIENT ----------
let deltaWs: WebSocket | null = null;
let lastWsPrice: number | null = null;

/**
 * Start Delta WebSocket connection if not already connected.
 * - You MUST adapt subscription payload & message parsing to match
 *   your original working deltaFeed.ts code.
 */
function startDeltaWs() {
  if (deltaWs && deltaWs.readyState === WebSocket.OPEN) {
    return;
  }

  const url = "wss://socket.india.delta.exchange"; // adjust if you use global/testnet
  console.log("[DELTA-WS] Connecting to", url);

  deltaWs = new WebSocket(url);

  deltaWs.on("open", () => {
    console.log("[DELTA-WS] Connected");

    // TODO: Replace this with your exact subscription payload.
    // This is just an example – use what you had in deltaFeed.ts.
    const subscribeMsg = {
      type: "subscribe",
      payload: {
        channels: [
          {
            name: "v2/ticker",
            symbols: [SYMBOL],
          },
        ],
      },
    };

    console.log("[DELTA-WS] Sending subscription:", subscribeMsg);
    deltaWs!.send(JSON.stringify(subscribeMsg));
  });
deltaWs.on("message", (data: WebSocket.RawData) => {
  try {
    const text = data.toString();
    const msg = JSON.parse(text);
    console.log("[DELTA-WS] Message:", msg);

    // Ignore subscription-ack messages
    if (msg.type === "subscriptions") {
      console.log("[DELTA-WS] Subscription confirmed");
      return;
    }

    // Handle ticker messages
    if (msg.type === "v2/ticker" || msg.type === "ticker") {
      // Adapt these fields based on what you see in logs
      const maybePrice =
        msg.mark_price ??
        msg.spot_price ??
        msg.quotes?.best_bid ??
        msg.quotes?.best_ask ??
        msg.close ??
        null;

      const price = toNumberOrNull(maybePrice);

      if (price != null) {
        lastWsPrice = price;
        console.log("[DELTA-WS] Updated lastWsPrice:", lastWsPrice);
      } else {
        console.log(
          "[DELTA-WS] Could not extract numeric price from ticker message"
        );
      }
    } else {
      console.log("[DELTA-WS] Ignoring WS message type:", msg.type);
    }
  } catch (err) {
    console.error("[DELTA-WS] Error parsing message:", err);
  }
});


  deltaWs.on("error", (err) => {
    console.error("[DELTA-WS] Error:", err);
  });

  deltaWs.on("close", () => {
    console.warn("[DELTA-WS] Connection closed");
    deltaWs = null;
  });
}

// ---------- SOURCE MODE STATE ----------
type SourceMode = "WS" | "REST";

let sourceMode: SourceMode = "REST"; // default
let lastRestPrice: number | null = null;

function randomFallbackPrice(base = 50000): number {
  return base + Math.floor(Math.random() * 1000) - 500;
}

// ---------- API ROUTES ----------

/**
 * GET /active-price
 * Returns the price from the currently-selected source (WS or REST),
 * with graceful fallbacks and detailed logs.
 */
app.get("/active-price", async (req, res) => {
  console.log("[API] GET /active-price, mode:", sourceMode);

  if (sourceMode === "WS") {
    startDeltaWs();

    if (lastWsPrice != null) {
      return res.json({
        source: "WS",
        symbol: SYMBOL,
        price: lastWsPrice,
      });
    }

    console.log("[API] No WS price yet, trying REST as fallback...");
    const restPrice = await fetchDeltaRestPrice();
    if (restPrice != null) {
      lastRestPrice = restPrice;
      return res.json({
        source: "REST (fallback)",
        symbol: SYMBOL,
        price: restPrice,
      });
    }

    const rnd = randomFallbackPrice();
    return res.json({
      source: "RANDOM (fallback)",
      symbol: SYMBOL,
      price: rnd,
    });
  } else {
    // REST mode
    const restPrice = await fetchDeltaRestPrice();
    if (restPrice != null) {
      lastRestPrice = restPrice;
      return res.json({
        source: "REST",
        symbol: SYMBOL,
        price: restPrice,
      });
    }

    if (lastRestPrice != null) {
      return res.json({
        source: "REST (cached)",
        symbol: SYMBOL,
        price: lastRestPrice,
      });
    }

    const rnd = randomFallbackPrice();
    return res.json({
      source: "RANDOM (fallback)",
      symbol: SYMBOL,
      price: rnd,
    });
  }
});

/**
 * GET /price-compare
 * Always tries to show both WS and REST prices side by side,
 * regardless of the current active source.
 */
app.get("/price-compare", async (req, res) => {
  console.log("[API] GET /price-compare");

  startDeltaWs();
  const wsPrice = lastWsPrice;

  const restPrice = await fetchDeltaRestPrice();
  if (restPrice != null) {
    lastRestPrice = restPrice;
  }

  res.json({
    symbol: SYMBOL,
    wsPrice,
    restPrice: restPrice ?? lastRestPrice ?? null,
  });
});

/**
 * POST /source-mode
 * { "mode": "WS" } or { "mode": "REST" }
 * Switches the active source used by /active-price.
 */
app.post("/source-mode", (req, res) => {
  const newMode = req.body.mode as SourceMode | undefined;
  console.log("[API] POST /source-mode body:", req.body);

  if (newMode !== "WS" && newMode !== "REST") {
    return res
      .status(400)
      .json({ error: "mode must be 'WS' or 'REST'", received: newMode });
  }

  sourceMode = newMode;
  console.log("[API] sourceMode changed to:", sourceMode);

  res.json({
    message: "Source mode updated",
    mode: sourceMode,
  });
});

// ---------- START SERVER ----------
app.listen(PORT, () => {
  console.log(`[SERVER] Listening on http://localhost:${PORT}`);
});
