import { RSI } from "technicalindicators";
import {
  CandlestickData,
  RsiCandlestickData,
} from "../models/candlestick-data.model";
import { BinanceChartTimeFrames } from "../models/chartTimeFrames.enum";
import { CryptoAssetIds } from "../models/cryptoAssetIds.enum";

export class BinanceApiService {
  /*   [
    [
      1591258320000,      	// Open time
      "9640.7",       	 	// Open
      "9642.4",       	 	// High
      "9640.6",       	 	// Low
      "9642.0",      	 	 	// Close (or latest price)
      "206", 			 		// Volume
      1591258379999,       	// Close time
      "2.13660389",    		// Base asset volume
      48,             		// Number of trades
      "119",    				// Taker buy volume
      "1.23424865",      		// Taker buy base asset volume
      "0" 					// Ignore.
    ]
  ] */

  private static binanceApiEndpoint = `https://api.binance.com/api/v3/klines`;

  public static async getClosingPricesList(
    timeFrame: BinanceChartTimeFrames
  ): Promise<number[] | undefined> {
    try {
      let response = await fetch(
        this.binanceApiEndpoint +
          "?" +
          new URLSearchParams({
            symbol: CryptoAssetIds.BTC,
            interval: timeFrame,
            limit: "1000",
          }).toString()
      );

      const data = await response.json();

      return (data as any[]).map((candleData: any[]) => candleData[4]);
    } catch (error) {
      console.log("failed to fetch data from binance api", error);
    }

    return undefined;
  }

  public static async fetchCandlestickData(
    timeFrame: BinanceChartTimeFrames
  ): Promise<RsiCandlestickData[] | undefined> {
    try {
      let response = await fetch(
        this.binanceApiEndpoint +
          "?" +
          new URLSearchParams({
            symbol: CryptoAssetIds.BTC,
            interval: timeFrame,
            limit: "200",
          }).toString()
      );

      const data = await response.json();

      const candlestickData = (data as any[]).map((candleData: any[]) => {
        return {
          time: candleData[0],
          open: parseInt(candleData[1]),
          high: parseInt(candleData[2]),
          low: parseInt(candleData[3]),
          close: parseInt(candleData[4]),
        };
      });

      return this.getRsiCandlestickData(candlestickData, 14);
    } catch (error) {
      console.log("failed to fetch data from binance api", error);
    }

    return undefined;
  }

  private static getRsiCandlestickData(
    candlestickData: CandlestickData[],
    rsiPeriod: number
  ): RsiCandlestickData[] {
    const closingPrices = candlestickData.map((candle) => candle.close);
    const rsiResults = RSI.calculate({
      values: closingPrices,
      period: rsiPeriod,
    });

    const rsiCandlestickData: RsiCandlestickData[] = [];

    for (let index = 1; index < rsiResults.length - 1; index++) {
      rsiCandlestickData.unshift({
        open: candlestickData[candlestickData.length - index].open,
        high: candlestickData[candlestickData.length - index].high,
        low: candlestickData[candlestickData.length - index].low,
        close: candlestickData[candlestickData.length - index].close,
        time: candlestickData[candlestickData.length - index].time,
        rsi: rsiResults[rsiResults.length - index],
        eventNumber: rsiResults.length - index,
      });
    }

    return rsiCandlestickData;
  }
}
