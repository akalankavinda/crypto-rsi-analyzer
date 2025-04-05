import { BinanceChartTimeFrames } from "../../models/chartTimeFrames.enum";
import { RsiProcessedData } from "../../models/rsi-processed-data.model";

export class RsiOversoldService {
  public static hasOversold(
    rsiData: RsiProcessedData[],
    timeFrame: BinanceChartTimeFrames
  ): boolean {
    let lastClosedCandle = rsiData[rsiData.length - 2];

    const lastCandleRsiIsBelowThreshold = lastClosedCandle.rsiValue < 15;
    const lastCandleRsiIsExtreme = lastClosedCandle.rsiValue < 10;

    const lastCandleClosePrice = lastClosedCandle.closePrice;
    const last7thCandleClosePrice = rsiData[rsiData.length - 8].closePrice;
    const priceDrop = last7thCandleClosePrice - lastCandleClosePrice;
    const priceDropPercentage = (priceDrop / last7thCandleClosePrice) * 100;

    let hasConsiderablePriceDrop = false;

    if (lastCandleRsiIsBelowThreshold) {
      if (timeFrame === BinanceChartTimeFrames.chart1hour) {
        hasConsiderablePriceDrop = priceDropPercentage > 2.55;
      } else if (timeFrame === BinanceChartTimeFrames.chart4hour) {
        hasConsiderablePriceDrop = priceDropPercentage > 4.25;
      }
    }

    const hasOversold = lastCandleRsiIsBelowThreshold || lastCandleRsiIsExtreme;

    return hasOversold;
  }
}
