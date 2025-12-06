export type TickSource = "API" | "MANUAL";

export interface Tick {
  symbol: string;
  price: number;
  time: number;
  source: TickSource;
}
