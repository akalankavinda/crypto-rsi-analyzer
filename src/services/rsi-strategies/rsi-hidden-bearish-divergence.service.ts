import { RsiProcessedData } from "../../models/rsi-processed-data.model";

export class RsiHiddenBearishDivergenceService {
  public static hasDivergence(rsiData: RsiProcessedData[]): boolean {
    let rsiHighestTop: RsiProcessedData = rsiData[rsiData.length - 3];

    const last1stRsi = rsiData[rsiData.length - 2].rsiValue;
    const last2ndRsi = rsiData[rsiData.length - 3].rsiValue;
    const last3rdRsi = rsiData[rsiData.length - 4].rsiValue;
    const last4thRsi = rsiData[rsiData.length - 5].rsiValue;

    // 1st condition
    let lastClosedCandleFormedLowestBottom =
      last1stRsi < last2ndRsi &&
      last2ndRsi > last3rdRsi &&
      last3rdRsi > last4thRsi;

    // 2nd condition
    let rsi2ndHighestTopFound = false;
    let rsi2ndHighestTopIndex = rsiData.length - 20;

    for (let i1 = rsi2ndHighestTopIndex; i1 > 3; i1--) {
      const rsi2ndHighestTop = rsiData[i1];

      const candleAfterTop = rsiData[i1 + 1].rsiValue;
      const candleAtTop = rsiData[i1].rsiValue;
      const candleBeforeTop = rsiData[i1 - 1].rsiValue;
      const candleBeforeTop2 = rsiData[i1 - 2].rsiValue;

      const hasFormedTopPattern =
        candleAtTop > candleAfterTop &&
        candleAtTop > candleBeforeTop &&
        candleBeforeTop > candleBeforeTop2;

      const bottomRsiIsHigherThanLowestBottom =
        rsi2ndHighestTop.rsiValue < rsiHighestTop.rsiValue;

      const pricesShowDescendingOrder =
        rsi2ndHighestTop.closePrice > rsiHighestTop.closePrice;

      // 6th condition
      let noRsiTopsInBetween = true;

      // y = mx + c
      let bearGradient =
        (rsiHighestTop.rsiValue - rsi2ndHighestTop.rsiValue) /
        (rsiHighestTop.eventNumber - rsi2ndHighestTop.eventNumber); // gradient (m) = (y-c) / x

      let bearIntercept =
        rsiHighestTop.rsiValue - bearGradient * rsiHighestTop.eventNumber; // intercept (c) = y - mx

      let topsTouchingLine: number[] = [];

      rsiData.forEach((rsiWithPrice: RsiProcessedData) => {
        topsTouchingLine.push(
          bearGradient * rsiWithPrice.eventNumber + bearIntercept
        );
      });

      for (let i2 = rsiData.length - 3; i2 >= i1 - 3; i2--) {
        if (rsiData[i2].rsiValue > topsTouchingLine[i2]) {
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
      }
    }

    // 3rd condition
    const highestTopRsiIsAbove50 = rsiHighestTop.rsiValue > 50;

    const rsiHiddenBearishDivergenceFound =
      lastClosedCandleFormedLowestBottom &&
      rsi2ndHighestTopFound &&
      highestTopRsiIsAbove50;

    return rsiHiddenBearishDivergenceFound;
  }
}
