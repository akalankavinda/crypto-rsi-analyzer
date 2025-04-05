import { BinanceChartTimeFrames } from "../../models/chartTimeFrames.enum";
import { RsiProcessedData } from "../../models/rsi-processed-data.model";

export class RsiOverboughtService {
  public static hasOverbought(
    rsiData: RsiProcessedData[],
    timeFrame: BinanceChartTimeFrames
  ): boolean {
    let lastClosedCandle = rsiData[rsiData.length - 2];

    const lastCandleRsiIsAboveThreshold = lastClosedCandle.rsiValue > 85;
    const lastCandleRsiIsExtreme = lastClosedCandle.rsiValue > 90;

    const lastCandleClosePrice = lastClosedCandle.closePrice;
    const last7thCandleClosePrice = rsiData[rsiData.length - 8].closePrice;
    const priceGain = lastCandleClosePrice - last7thCandleClosePrice;
    const priceGainPercentage = (priceGain / lastCandleClosePrice) * 100;

    let hasConsiderablePriceGain = false;

    if (lastCandleRsiIsAboveThreshold) {
      if (timeFrame === BinanceChartTimeFrames.chart1hour) {
        hasConsiderablePriceGain = priceGainPercentage > 2.55;
      } else if (timeFrame === BinanceChartTimeFrames.chart4hour) {
        hasConsiderablePriceGain = priceGainPercentage > 4.25;
      }
    }

    const hasOverbought =
      lastCandleRsiIsAboveThreshold || lastCandleRsiIsExtreme;

    return hasOverbought;
  }
}
