import { BinanceChartTimeFrames } from "../../models/chartTimeFrames.enum";
import { RsiProcessedData } from "../../models/rsi-processed-data.model";

export class RsiOversoldService {
  public static hasOversold(
    rsiData: RsiProcessedData[],
    timeFrame: BinanceChartTimeFrames
  ): boolean {
    let lastClosedCandle = rsiData[rsiData.length - 2];

    const lastCandleRsiIsBelowThreshold = lastClosedCandle.rsiValue < 12.5;

    const lastCandleClosePrice = lastClosedCandle.closePrice;
    const last7thCandleClosePrice = rsiData[rsiData.length - 8].closePrice;
    const priceDrop = last7thCandleClosePrice - lastCandleClosePrice;
    const priceDropPercentage = (priceDrop / last7thCandleClosePrice) * 100;

    let hasConsiderablePriceDrop = false;

    if (timeFrame === BinanceChartTimeFrames.chart1hour) {
      hasConsiderablePriceDrop = priceDropPercentage > 2.5;
    } else if (timeFrame === BinanceChartTimeFrames.chart4hour) {
      hasConsiderablePriceDrop = priceDropPercentage > 4.5;
    } else if (timeFrame === BinanceChartTimeFrames.chart1Day) {
      hasConsiderablePriceDrop = true;
    }

    const hasOversold =
      lastCandleRsiIsBelowThreshold && hasConsiderablePriceDrop;

    return hasOversold;
  }
}
