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
            limit: "100",
          }).toString()
      );

      const data = await response.json();

      return (data as any[]).map((candleData: any[]) => candleData[4]);
    } catch (error) {
      console.log("failed to fetch data from binance api", error);
    }

    return undefined;
  }
}
