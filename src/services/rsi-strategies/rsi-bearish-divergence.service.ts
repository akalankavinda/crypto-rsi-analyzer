import { RsiProcessedData } from "../../models/rsi-processed-data.model";

export class RsiBearishDivergenceService {
  public static hasDivergence(rsiData: RsiProcessedData[]): boolean {
    const percentageLimit = 7.5;

    //---------------------- START OF BEARISH DIVERGENCE LOGIC ----------------------

    let rsiHighestTopIndex = rsiData.length - 1;
    let rsiHighestTop: RsiProcessedData = rsiData[rsiHighestTopIndex];

    rsiData.forEach((item, index) => {
      if (item.rsiValue > rsiHighestTop.rsiValue) {
        rsiHighestTop = item;
        rsiHighestTopIndex = index;
      }
    });

    let rsiSecondHighestTop: RsiProcessedData = rsiData[rsiData.length - 3];

    const last1stRsi = rsiData[rsiData.length - 2].rsiValue;
    const last2ndRsi = rsiData[rsiData.length - 3].rsiValue;
    const last3rdRsi = rsiData[rsiData.length - 4].rsiValue;
    const last4thRsi = rsiData[rsiData.length - 5].rsiValue;

    // 1st condition
    let lastClosedCandleFormedLowerHigh =
      last1stRsi < last2ndRsi &&
      last2ndRsi > last3rdRsi &&
      last3rdRsi > last4thRsi;

    // 2nd condition
    let topsAreInOverboughtRegion =
      rsiHighestTop.rsiValue > 73 && rsiSecondHighestTop.rsiValue > 63;

    // 3rd condition
    let topsHasEnoughCandleGap =
      rsiSecondHighestTop.eventNumber - rsiHighestTop.eventNumber > 7;

    // 4th condition
    let rsiTopsShowDescendingOrder =
      rsiHighestTop.rsiValue > rsiSecondHighestTop.rsiValue;

    // 5th condition
    const rsiHighestTopFairClosePrice =
      rsiHighestTop.closePrice - (rsiHighestTop.closePrice / 100) * 1.25;
    let pricesShowAscendingOrder =
      rsiSecondHighestTop.closePrice > rsiHighestTopFairClosePrice;

    // 6th condition
    let noRsiTopsInBetween = true;

    // y = mx + c
    let bearGradient =
      (rsiHighestTop.rsiValue - rsiSecondHighestTop.rsiValue) /
      (rsiHighestTop.eventNumber - rsiSecondHighestTop.eventNumber); // gradient (m) = (y-c) / x

    let bearIntercept =
      rsiHighestTop.rsiValue - bearGradient * rsiHighestTop.eventNumber; // intercept (c) = y - mx

    let topsTouchingLine: number[] = [];

    rsiData.forEach((rsiWithPrice: RsiProcessedData) => {
      topsTouchingLine.push(
        bearGradient * rsiWithPrice.eventNumber + bearIntercept
      );
    });

    for (
      let index = rsiHighestTopIndex + 1;
      index < rsiData.length - 3;
      index++
    ) {
      if (rsiData[index].rsiValue > topsTouchingLine[index]) {
        noRsiTopsInBetween = false;
      }
    }

    // 7th condition
    let minPriceForRsiSecondHighestTop =
      rsiHighestTop.closePrice +
      (rsiHighestTop.closePrice / 100) * percentageLimit;

    let rsiTopsHasConsiderableDiff =
      rsiSecondHighestTop.rsiValue < rsiHighestTop.rsiValue - 10;

    let topsPricesHasConsiderableDiff =
      rsiSecondHighestTop.closePrice > minPriceForRsiSecondHighestTop;

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

    return rsiBearishDivergenceFormed;
  }
}
