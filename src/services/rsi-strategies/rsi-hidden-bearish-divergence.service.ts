import { RsiCandlestickData } from "../../models/candlestick-data.model";
import { BinanceChartTimeFrames } from "../../models/chartTimeFrames.enum";
import { RsiDivergenceResult } from "../../models/rsi-divergence-result.model";
import {
  RsiDivergenceDirection,
  RsiDivergenceTypes,
} from "../../models/rsi-divergence-types.enum";
import { RsiProcessedData } from "../../models/rsi-processed-data.model";

export class RsiHiddenBearishDivergenceService {
  public static hasDivergence(
    rsiData: RsiCandlestickData[],
    timeFrame: BinanceChartTimeFrames
  ): RsiDivergenceResult {
    let rsiHighestTop = rsiData[rsiData.length - 3];

    const last1stRsi = rsiData[rsiData.length - 2].rsi;
    const last2ndRsi = rsiData[rsiData.length - 3].rsi;
    const last3rdRsi = rsiData[rsiData.length - 4].rsi;
    const last4thRsi = rsiData[rsiData.length - 5].rsi;

    // 1st condition
    let lastClosedCandleFormedLowestBottom =
      last1stRsi < last2ndRsi &&
      last2ndRsi > last3rdRsi &&
      last3rdRsi > last4thRsi;

    // 2nd condition
    let rsi2ndHighestTopFound = false;
    let rsi2ndHighestTopIndex = rsiData.length - 10;

    for (let i1 = rsi2ndHighestTopIndex; i1 > 3; i1--) {
      const rsi2ndHighestTop = rsiData[i1];

      const candleAfterTop = rsiData[i1 + 1].rsi;
      const candleAtTop = rsiData[i1].rsi;
      const candleBeforeTop = rsiData[i1 - 1].rsi;
      const candleBeforeTop2 = rsiData[i1 - 2].rsi;

      const hasFormedTopPattern =
        candleAtTop > candleAfterTop &&
        candleAtTop > candleBeforeTop &&
        candleBeforeTop > candleBeforeTop2;

      const bottomRsiIsHigherThanLowestBottom =
        rsi2ndHighestTop.rsi < rsiHighestTop.rsi;

      const pricesShowDescendingOrder =
        rsi2ndHighestTop.close > rsiHighestTop.close;

      // 6th condition
      let noRsiTopsInBetween = true;

      // y = mx + c
      let bearGradient =
        (rsiHighestTop.rsi - rsi2ndHighestTop.rsi) /
        (rsiHighestTop.eventNumber - rsi2ndHighestTop.eventNumber); // gradient (m) = (y-c) / x

      let bearIntercept =
        rsiHighestTop.rsi - bearGradient * rsiHighestTop.eventNumber; // intercept (c) = y - mx

      let topsTouchingLine: number[] = [];

      rsiData.forEach((rsiWithPrice) => {
        topsTouchingLine.push(
          bearGradient * rsiWithPrice.eventNumber + bearIntercept
        );
      });

      for (let i2 = rsiData.length - 3; i2 >= i1 - 3; i2--) {
        if (rsiData[i2].rsi > topsTouchingLine[i2]) {
          noRsiTopsInBetween = false;
        }
      }

      if (
        hasFormedTopPattern &&
        bottomRsiIsHigherThanLowestBottom &&
        pricesShowDescendingOrder &&
        noRsiTopsInBetween
      ) {
        rsi2ndHighestTopFound = true;
        rsi2ndHighestTopIndex = i1;
      }
    }

    // 3rd condition
    const highestTopRsiIsAbove50 = rsiHighestTop.rsi > 50;

    const rsiHiddenBearishDivergenceFound =
      lastClosedCandleFormedLowestBottom &&
      rsi2ndHighestTopFound &&
      highestTopRsiIsAbove50;

    const rsiResult: RsiDivergenceResult = {
      divergence: RsiDivergenceTypes.NotAvailable,
      timeFrame: timeFrame,
      direction: RsiDivergenceDirection.NotAvailable,
      candleDistance: 0,
    };

    if (rsiHiddenBearishDivergenceFound) {
      const candleDistance = rsiData.length - rsi2ndHighestTopIndex;
      rsiResult.divergence = RsiDivergenceTypes.HiddenBearish;
      rsiResult.direction = RsiDivergenceDirection.Bearish;
      rsiResult.candleDistance = candleDistance;
    }

    return rsiResult;
  }
}
