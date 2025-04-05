export interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface RsiCandlestickData extends CandlestickData {
  rsi: number;
  eventNumber: number;
}
