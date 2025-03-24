import { RsiProcessedData } from "../../models/rsi-processed-data.model";

export class RsiHiddenBullishDivergenceService {
  public static hasDivergence(rsiData: RsiProcessedData[]): boolean {
    let rsiLowestBottom: RsiProcessedData = rsiData[rsiData.length - 3];

    const last1stRsi = rsiData[rsiData.length - 2].rsiValue;
    const last2ndRsi = rsiData[rsiData.length - 3].rsiValue;
    const last3rdRsi = rsiData[rsiData.length - 4].rsiValue;
    const last4thRsi = rsiData[rsiData.length - 5].rsiValue;

    // 1st condition
    let lastClosedCandleFormedLowestBottom =
      last1stRsi > last2ndRsi &&
      last2ndRsi < last3rdRsi &&
      last3rdRsi < last4thRsi;

    // 2nd condition
    const lowestBottomRsiIsBelow50 = rsiLowestBottom.rsiValue < 50;

    let rsi2ndLowestBottomFound = false;
    let rsi2ndLowestBottomIndex = rsiData.length - 10;

    for (let i1 = rsi2ndLowestBottomIndex; i1 > 3; i1--) {
      const rsi2ndLowestBottom = rsiData[i1];

      const bottomAfterRsi = rsiData[i1 + 1].rsiValue;
      const bottomRsi = rsiData[i1].rsiValue;
      const bottomBeforeRsi = rsiData[i1 - 1].rsiValue;
      const bottomBefore2Rsi = rsiData[i1 - 2].rsiValue;

      // 3rd condition
      const hasFormedBottomPattern =
        bottomRsi < bottomAfterRsi &&
        bottomRsi < bottomBeforeRsi &&
        bottomBeforeRsi < bottomBefore2Rsi;

      // 4th condition
      const bottomRsiIsHigherThanLowestBottom =
        rsi2ndLowestBottom.rsiValue > rsiLowestBottom.rsiValue;

      // 5th condition
      const pricesShowAscendingOrder =
        rsi2ndLowestBottom.closePrice < rsiLowestBottom.closePrice;

      // 6th condition
      let noRsiBottomsInBetween = true;

      // y = mx + c
      let bulGradient =
        (rsiLowestBottom.rsiValue - rsi2ndLowestBottom.rsiValue) /
        (rsiLowestBottom.eventNumber - rsi2ndLowestBottom.eventNumber); // gradient (m) = (y-c) / x

      let bulIntercept =
        rsiLowestBottom.rsiValue - bulGradient * rsiLowestBottom.eventNumber; // intercept (c) = y - mx

      let bottomsTouchingLine: number[] = [];

      rsiData.forEach((rsiWithPrice: RsiProcessedData) => {
        bottomsTouchingLine.push(
          bulGradient * rsiWithPrice.eventNumber + bulIntercept
        );
      });

      for (let i2 = rsiData.length - 3; i2 >= i1 - 3; i2--) {
        if (rsiData[i2].rsiValue < bottomsTouchingLine[i2]) {
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
      }
    }

    const rsiHiddenBullishDivergenceFound =
      lastClosedCandleFormedLowestBottom &&
      rsi2ndLowestBottomFound &&
      lowestBottomRsiIsBelow50;

    return rsiHiddenBullishDivergenceFound;
  }
}
