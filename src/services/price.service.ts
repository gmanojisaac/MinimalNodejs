let currentPrice: number | null = null;
const symbol = "BTCUSD";

export function getSymbol(): string {
  return symbol;
}

export function getCurrentPrice(): number | null {
  return currentPrice;
}

export function setCurrentPrice(price: number) {
  currentPrice = price;
}
