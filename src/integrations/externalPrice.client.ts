export async function getExternalPrice(symbol: string): Promise<number> {
  // mock BTC price around 50k with small random variation
  const base = 50000;
  const variation = Math.floor(Math.random() * 1000) - 500; // -500..+499
  return base + variation;
}
