import { RsiCandlestickData } from "../../models/candlestick-data.model";
import { BinanceChartTimeFrames } from "../../models/chartTimeFrames.enum";
import { RsiDivergenceResult } from "../../models/rsi-divergence-result.model";
import {
  RsiDivergenceDirection,
  RsiDivergenceTypes,
} from "../../models/rsi-divergence-types.enum";
import { RsiProcessedData } from "../../models/rsi-processed-data.model";

export class RsiBullishDivergenceService {
  public static hasDivergence(
    rsiData: RsiCandlestickData[],
    timeFrame: BinanceChartTimeFrames
  ): RsiDivergenceResult {
    //---------------------- START OF BULLISH DIVERGENCE LOGIC ----------------------

    const percentageLimit = 7.5;

    let rsiLowestBottomIndex = rsiData.length - 1;
    let rsiLowestBottom = rsiData[rsiLowestBottomIndex];

    rsiData.forEach((item, index) => {
      if (item.rsi < rsiLowestBottom.rsi) {
        rsiLowestBottom = item;
        rsiLowestBottomIndex = index;
      }
    });

    let rsiSecondLowestBottom = rsiData[rsiData.length - 3];

    const last1stRsi = rsiData[rsiData.length - 2].rsi;
    const last2ndRsi = rsiData[rsiData.length - 3].rsi;
    const last3rdRsi = rsiData[rsiData.length - 4].rsi;
    const last4thRsi = rsiData[rsiData.length - 5].rsi;

    // 1st condition
    let lastClosedCandleFormedSecondLowestBottom =
      last1stRsi > last2ndRsi &&
      last2ndRsi < last3rdRsi &&
      last3rdRsi < last4thRsi;

    // 2nd condition
    let bottomsAreInOversoldRegion =
      rsiLowestBottom.rsi < 30 && rsiSecondLowestBottom.rsi < 40;

    // 3rd condition
    let bottomsHasEnoughCandleGap =
      rsiSecondLowestBottom.eventNumber - rsiLowestBottom.eventNumber > 7;

    // 4th condition
    let rsiBottomsShowAscendingOrder =
      rsiSecondLowestBottom.rsi > rsiLowestBottom.rsi;

    // 5th condition
    // const rsiLowestBottomFairClosePrice =
    //   rsiLowestBottom.closePrice + (rsiLowestBottom.closePrice / 100) * 1;
    let pricesShowDescendingOrder =
      rsiSecondLowestBottom.close < rsiLowestBottom.close;

    // 6th condition
    let noRsiBottomsInBetween = true;

    // y = mx + c
    let bulGradient =
      (rsiLowestBottom.rsi - rsiSecondLowestBottom.rsi) /
      (rsiLowestBottom.eventNumber - rsiSecondLowestBottom.eventNumber); // gradient (m) = (y-c) / x

    let bulIntercept =
      rsiLowestBottom.rsi - bulGradient * rsiLowestBottom.eventNumber; // intercept (c) = y - mx

    let bottomsTouchingLine: number[] = [];

    rsiData.forEach((rsiWithPrice) => {
      bottomsTouchingLine.push(
        bulGradient * rsiWithPrice.eventNumber + bulIntercept
      );
    });

    for (
      let index = rsiLowestBottomIndex + 1;
      index < rsiData.length - 3;
      index++
    ) {
      if (rsiData[index].rsi < bottomsTouchingLine[index]) {
        noRsiBottomsInBetween = false;
      }
    }

    // 7th condition
    let maxPriceForRsiSecondLowestBottom =
      rsiLowestBottom.close - (rsiLowestBottom.close / 100) * percentageLimit;

    let rsiBottomsHasConsiderableDiff =
      rsiSecondLowestBottom.rsi > rsiLowestBottom.rsi + 10;

    let bottomPricesHasConsiderableDiff =
      rsiSecondLowestBottom.close < maxPriceForRsiSecondLowestBottom;

    let rsiBottomValuesOrPricesHasConsiderableDiff =
      bottomPricesHasConsiderableDiff || rsiBottomsHasConsiderableDiff;

    // Check all conditions are passed
    let rsiBullishDivergenceFormed =
      bottomsAreInOversoldRegion &&
      bottomsHasEnoughCandleGap &&
      rsiBottomsShowAscendingOrder &&
      pricesShowDescendingOrder &&
      lastClosedCandleFormedSecondLowestBottom &&
      noRsiBottomsInBetween;
    // rsiBottomValuesOrPricesHasConsiderableDiff;

    const rsiResult: RsiDivergenceResult = {
      divergence: RsiDivergenceTypes.NotAvailable,
      timeFrame: timeFrame,
      direction: RsiDivergenceDirection.NotAvailable,
      candleDistance: 0,
    };

    if (rsiBullishDivergenceFormed) {
      const candleDistance = rsiData.length - rsiLowestBottomIndex;
      rsiResult.divergence = RsiDivergenceTypes.Bullish;
      rsiResult.direction = RsiDivergenceDirection.Bullish;
      rsiResult.candleDistance = candleDistance;
    }

    return rsiResult;
  }
}
