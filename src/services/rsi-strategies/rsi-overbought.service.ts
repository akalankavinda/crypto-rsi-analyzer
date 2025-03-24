import { BinanceChartTimeFrames } from "../../models/chartTimeFrames.enum";
import { RsiProcessedData } from "../../models/rsi-processed-data.model";

export class RsiOverboughtService {
  public static hasOverbought(
    rsiData: RsiProcessedData[],
    timeFrame: BinanceChartTimeFrames
  ): boolean {
    let lastClosedCandle = rsiData[rsiData.length - 2];

    const lastCandleRsiIsAboveThreshold = lastClosedCandle.rsiValue > 87.5;

    const lastCandleClosePrice = lastClosedCandle.closePrice;
    const last7thCandleClosePrice = rsiData[rsiData.length - 8].closePrice;
    const priceGain = lastCandleClosePrice - last7thCandleClosePrice;
    const priceGainPercentage = (priceGain / lastCandleClosePrice) * 100;

    let hasConsiderablePriceGain = false;

    if (timeFrame === BinanceChartTimeFrames.chart1hour) {
      hasConsiderablePriceGain = priceGainPercentage > 2.5;
    } else if (timeFrame === BinanceChartTimeFrames.chart4hour) {
      hasConsiderablePriceGain = priceGainPercentage > 4.5;
    } else if (timeFrame === BinanceChartTimeFrames.chart1Day) {
      hasConsiderablePriceGain = true;
    }

    const hasOverbought =
      lastCandleRsiIsAboveThreshold && hasConsiderablePriceGain;

    return hasOverbought;
  }
}
