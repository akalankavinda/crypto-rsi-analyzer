import { RsiCandlestickData } from "../../models/candlestick-data.model";
import { BinanceChartTimeFrames } from "../../models/chartTimeFrames.enum";
import { RsiDivergenceResult } from "../../models/rsi-divergence-result.model";
import {
  RsiDivergenceDirection,
  RsiDivergenceTypes,
} from "../../models/rsi-divergence-types.enum";
import { RsiProcessedData } from "../../models/rsi-processed-data.model";

export class RsiHiddenBullishDivergenceService {
  public static hasDivergence(
    rsiData: RsiCandlestickData[],
    timeFrame: BinanceChartTimeFrames
  ): RsiDivergenceResult {
    let rsiLowestBottom = rsiData[rsiData.length - 3];

    const last1stRsi = rsiData[rsiData.length - 2].rsi;
    const last2ndRsi = rsiData[rsiData.length - 3].rsi;
    const last3rdRsi = rsiData[rsiData.length - 4].rsi;
    const last4thRsi = rsiData[rsiData.length - 5].rsi;

    // 1st condition
    let lastClosedCandleFormedLowestBottom =
      last1stRsi > last2ndRsi &&
      last2ndRsi < last3rdRsi &&
      last3rdRsi < last4thRsi;

    // 2nd condition
    const lowestBottomRsiIsBelow50 = rsiLowestBottom.rsi < 50;

    let rsi2ndLowestBottomFound = false;
    let rsi2ndLowestBottomIndex = rsiData.length - 10;

    for (let i1 = rsi2ndLowestBottomIndex; i1 > 3; i1--) {
      const rsi2ndLowestBottom = rsiData[i1];

      const bottomAfterRsi = rsiData[i1 + 1].rsi;
      const bottomRsi = rsiData[i1].rsi;
      const bottomBeforeRsi = rsiData[i1 - 1].rsi;
      const bottomBefore2Rsi = rsiData[i1 - 2].rsi;

      // 3rd condition
      const hasFormedBottomPattern =
        bottomRsi < bottomAfterRsi &&
        bottomRsi < bottomBeforeRsi &&
        bottomBeforeRsi < bottomBefore2Rsi;

      // 4th condition
      const bottomRsiIsHigherThanLowestBottom =
        rsi2ndLowestBottom.rsi > rsiLowestBottom.rsi;

      // 5th condition
      const pricesShowAscendingOrder =
        rsi2ndLowestBottom.close < rsiLowestBottom.close;

      // 6th condition
      let noRsiBottomsInBetween = true;

      // y = mx + c
      let bulGradient =
        (rsiLowestBottom.rsi - rsi2ndLowestBottom.rsi) /
        (rsiLowestBottom.eventNumber - rsi2ndLowestBottom.eventNumber); // gradient (m) = (y-c) / x

      let bulIntercept =
        rsiLowestBottom.rsi - bulGradient * rsiLowestBottom.eventNumber; // intercept (c) = y - mx

      let bottomsTouchingLine: number[] = [];

      rsiData.forEach((rsiWithPrice) => {
        bottomsTouchingLine.push(
          bulGradient * rsiWithPrice.eventNumber + bulIntercept
        );
      });

      for (let i2 = rsiData.length - 3; i2 >= i1 - 3; i2--) {
        if (rsiData[i2].rsi < bottomsTouchingLine[i2]) {
          noRsiBottomsInBetween = false;
        }
      }

      if (
        hasFormedBottomPattern &&
        bottomRsiIsHigherThanLowestBottom &&
        pricesShowAscendingOrder &&
        noRsiBottomsInBetween
      ) {
        rsi2ndLowestBottomFound = true;
        rsi2ndLowestBottomIndex = i1;
      }
    }

    const rsiHiddenBullishDivergenceFound =
      lastClosedCandleFormedLowestBottom &&
      rsi2ndLowestBottomFound &&
      lowestBottomRsiIsBelow50;

    const rsiResult: RsiDivergenceResult = {
      divergence: RsiDivergenceTypes.NotAvailable,
      timeFrame: timeFrame,
      direction: RsiDivergenceDirection.NotAvailable,
      candleDistance: 0,
    };

    if (rsiHiddenBullishDivergenceFound) {
      const candleDistance = rsiData.length - rsi2ndLowestBottomIndex;
      rsiResult.divergence = RsiDivergenceTypes.HiddenBullish;
      rsiResult.direction = RsiDivergenceDirection.Bullish;
      rsiResult.candleDistance = candleDistance;
    }

    return rsiResult;
  }
}
