import { RsiProcessedData } from "../../models/rsi-processed-data.model";

export class RsiBullishDivergenceService {
  public static hasDivergence(rsiData: RsiProcessedData[]): boolean {
    //---------------------- START OF BULLISH DIVERGENCE LOGIC ----------------------

    const percentageLimit = 7.5;

    let rsiLowestBottomIndex = rsiData.length - 1;
    let rsiLowestBottom: RsiProcessedData = rsiData[rsiLowestBottomIndex];

    rsiData.forEach((item, index) => {
      if (item.rsiValue < rsiLowestBottom.rsiValue) {
        rsiLowestBottom = item;
        rsiLowestBottomIndex = index;
      }
    });

    let rsiSecondLowestBottom: RsiProcessedData = rsiData[rsiData.length - 3];

    const last1stRsi = rsiData[rsiData.length - 2].rsiValue;
    const last2ndRsi = rsiData[rsiData.length - 3].rsiValue;
    const last3rdRsi = rsiData[rsiData.length - 4].rsiValue;
    const last4thRsi = rsiData[rsiData.length - 5].rsiValue;

    // 1st condition
    let lastClosedCandleFormedSecondLowestBottom =
      last1stRsi > last2ndRsi &&
      last2ndRsi < last3rdRsi &&
      last3rdRsi < last4thRsi;

    // 2nd condition
    let bottomsAreInOversoldRegion =
      rsiLowestBottom.rsiValue < 27 && rsiSecondLowestBottom.rsiValue < 37;

    // 3rd condition
    let bottomsHasEnoughCandleGap =
      rsiSecondLowestBottom.eventNumber - rsiLowestBottom.eventNumber > 7;

    // 4th condition
    let rsiBottomsShowAscendingOrder =
      rsiSecondLowestBottom.rsiValue > rsiLowestBottom.rsiValue;

    // 5th condition
    const rsiLowestBottomFairClosePrice =
      rsiLowestBottom.closePrice + (rsiLowestBottom.closePrice / 100) * 1.25;
    let pricesShowDescendingOrder =
      rsiSecondLowestBottom.closePrice < rsiLowestBottomFairClosePrice;

    // 6th condition
    let noRsiBottomsInBetween = true;

    // y = mx + c
    let bulGradient =
      (rsiLowestBottom.rsiValue - rsiSecondLowestBottom.rsiValue) /
      (rsiLowestBottom.eventNumber - rsiSecondLowestBottom.eventNumber); // gradient (m) = (y-c) / x

    let bulIntercept =
      rsiLowestBottom.rsiValue - bulGradient * rsiLowestBottom.eventNumber; // intercept (c) = y - mx

    let bottomsTouchingLine: number[] = [];

    rsiData.forEach((rsiWithPrice: RsiProcessedData) => {
      bottomsTouchingLine.push(
        bulGradient * rsiWithPrice.eventNumber + bulIntercept
      );
    });

    for (
      let index = rsiLowestBottomIndex + 1;
      index < rsiData.length - 3;
      index++
    ) {
      if (rsiData[index].rsiValue < bottomsTouchingLine[index]) {
        noRsiBottomsInBetween = false;
      }
    }

    // 7th condition
    let maxPriceForRsiSecondLowestBottom =
      rsiLowestBottom.closePrice -
      (rsiLowestBottom.closePrice / 100) * percentageLimit;

    let rsiBottomsHasConsiderableDiff =
      rsiSecondLowestBottom.rsiValue > rsiLowestBottom.rsiValue + 10;

    let bottomPricesHasConsiderableDiff =
      rsiSecondLowestBottom.closePrice < maxPriceForRsiSecondLowestBottom;

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

    return rsiBullishDivergenceFormed;
  }
}
