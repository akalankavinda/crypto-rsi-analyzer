import { RsiCandlestickData } from "../../models/candlestick-data.model";
import { BinanceChartTimeFrames } from "../../models/chartTimeFrames.enum";
import { RsiDivergenceResult } from "../../models/rsi-divergence-result.model";
import {
  RsiDivergenceDirection,
  RsiDivergenceTypes,
} from "../../models/rsi-divergence-types.enum";
import { RsiProcessedData } from "../../models/rsi-processed-data.model";

export class RsiBearishDivergenceService {
  public static hasDivergence(
    rsiData: RsiCandlestickData[],
    timeFrame: BinanceChartTimeFrames
  ): RsiDivergenceResult {
    const percentageLimit = 7.5;

    //---------------------- START OF BEARISH DIVERGENCE LOGIC ----------------------

    let rsiHighestTopIndex = rsiData.length - 1;
    let rsiHighestTop = rsiData[rsiHighestTopIndex];

    rsiData.forEach((item, index) => {
      if (item.rsi > rsiHighestTop.rsi) {
        rsiHighestTop = item;
        rsiHighestTopIndex = index;
      }
    });

    let rsiSecondHighestTop = rsiData[rsiData.length - 3];

    const last1stRsi = rsiData[rsiData.length - 2].rsi;
    const last2ndRsi = rsiData[rsiData.length - 3].rsi;
    const last3rdRsi = rsiData[rsiData.length - 4].rsi;
    const last4thRsi = rsiData[rsiData.length - 5].rsi;

    // 1st condition
    let lastClosedCandleFormedLowerHigh =
      last1stRsi < last2ndRsi &&
      last2ndRsi > last3rdRsi &&
      last3rdRsi > last4thRsi;

    // 2nd condition
    let topsAreInOverboughtRegion =
      rsiHighestTop.rsi > 70 && rsiSecondHighestTop.rsi > 60;

    // 3rd condition
    let topsHasEnoughCandleGap =
      rsiSecondHighestTop.eventNumber - rsiHighestTop.eventNumber > 7;

    // 4th condition
    let rsiTopsShowDescendingOrder =
      rsiHighestTop.rsi > rsiSecondHighestTop.rsi;

    // 5th condition
    // const rsiHighestTopFairClosePrice =
    //   rsiHighestTop.closePrice - (rsiHighestTop.closePrice / 100) * 1;
    let pricesShowAscendingOrder =
      rsiSecondHighestTop.close > rsiHighestTop.close;

    // 6th condition
    let noRsiTopsInBetween = true;

    // y = mx + c
    let bearGradient =
      (rsiHighestTop.rsi - rsiSecondHighestTop.rsi) /
      (rsiHighestTop.eventNumber - rsiSecondHighestTop.eventNumber); // gradient (m) = (y-c) / x

    let bearIntercept =
      rsiHighestTop.rsi - bearGradient * rsiHighestTop.eventNumber; // intercept (c) = y - mx

    let topsTouchingLine: number[] = [];

    rsiData.forEach((rsiWithPrice) => {
      topsTouchingLine.push(
        bearGradient * rsiWithPrice.eventNumber + bearIntercept
      );
    });

    for (
      let index = rsiHighestTopIndex + 1;
      index < rsiData.length - 3;
      index++
    ) {
      if (rsiData[index].rsi > topsTouchingLine[index]) {
        noRsiTopsInBetween = false;
      }
    }

    // 7th condition
    let minPriceForRsiSecondHighestTop =
      rsiHighestTop.close + (rsiHighestTop.close / 100) * percentageLimit;

    let rsiTopsHasConsiderableDiff =
      rsiSecondHighestTop.rsi < rsiHighestTop.rsi - 10;

    let topsPricesHasConsiderableDiff =
      rsiSecondHighestTop.close > minPriceForRsiSecondHighestTop;

    let rsiTopsValuesOrPricesHasConsiderableDiff =
      topsPricesHasConsiderableDiff || rsiTopsHasConsiderableDiff;

    // Check all conditions are passed
    let rsiBearishDivergenceFormed =
      topsAreInOverboughtRegion &&
      topsHasEnoughCandleGap &&
      rsiTopsShowDescendingOrder &&
      pricesShowAscendingOrder &&
      lastClosedCandleFormedLowerHigh &&
      noRsiTopsInBetween;
    // rsiTopsValuesOrPricesHasConsiderableDiff;

    const rsiResult: RsiDivergenceResult = {
      divergence: RsiDivergenceTypes.NotAvailable,
      timeFrame: timeFrame,
      direction: RsiDivergenceDirection.NotAvailable,
      candleDistance: 0,
    };

    if (rsiBearishDivergenceFormed) {
      const candleDistance = rsiData.length - rsiHighestTopIndex;
      rsiResult.divergence = RsiDivergenceTypes.Bearish;
      rsiResult.direction = RsiDivergenceDirection.Bearish;
      rsiResult.candleDistance = candleDistance;
    }

    return rsiResult;
  }
}
