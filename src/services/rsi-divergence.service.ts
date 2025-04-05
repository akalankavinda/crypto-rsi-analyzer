import { BinanceChartTimeFrames } from "../models/chartTimeFrames.enum";
import { RsiDivergenceResult } from "../models/rsi-divergence-result.model";
import {
  RsiDivergenceDirection,
  RsiDivergenceTypes,
} from "../models/rsi-divergence-types.enum";
import { RsiProcessedData } from "../models/rsi-processed-data.model";
import { RSI } from "technicalindicators";
import { RsiBearishDivergenceService } from "./rsi-strategies/rsi-bearish-divergence.service";
import { RsiHiddenBullishDivergenceService } from "./rsi-strategies/rsi-hidden-bullish-divergence.service";
import { RsiHiddenBearishDivergenceService } from "./rsi-strategies/rsi-hidden-bearish-divergence.service";
import { RsiBullishDivergenceService } from "./rsi-strategies/rsi-bullish-divergence.service";
import { RsiOverboughtService } from "./rsi-strategies/rsi-overbought.service";
import { RsiOversoldService } from "./rsi-strategies/rsi-oversold.service";
import {
  CandlestickData,
  RsiCandlestickData,
} from "../models/candlestick-data.model";

export class RsiDivergenceService {
  public static findRsiDivergence(
    candlestickData: RsiCandlestickData[],
    timeFrame: BinanceChartTimeFrames
  ): RsiDivergenceResult {
    /* closingPrices = [......................., (last_candle - 2), (last_candle - 1), last_candle] */

    // const rsi14PeriodData = this.extractRsiDataFromClosingPrices(
    //   closingPrices,
    //   14
    // );

    const selectedCandlestickData = candlestickData.slice(
      candlestickData.length - 66,
      candlestickData.length
    );

    const rsiResult: RsiDivergenceResult = {
      divergence: RsiDivergenceTypes.NotAvailable,
      timeFrame: timeFrame,
      direction: RsiDivergenceDirection.NotAvailable,
      candleDistance: 0,
    };

    const rsiBullishResult = RsiBullishDivergenceService.hasDivergence(
      selectedCandlestickData,
      timeFrame
    );
    if (rsiBullishResult.divergence == RsiDivergenceTypes.Bullish) {
      return rsiBullishResult;
    }

    const rsiBearishResult = RsiBearishDivergenceService.hasDivergence(
      selectedCandlestickData,
      timeFrame
    );
    if (rsiBearishResult.divergence == RsiDivergenceTypes.Bearish) {
      return rsiBearishResult;
    }

    const rsiHiddenBullishResult =
      RsiHiddenBullishDivergenceService.hasDivergence(
        selectedCandlestickData,
        timeFrame
      );
    if (rsiHiddenBullishResult.divergence == RsiDivergenceTypes.HiddenBullish) {
      return rsiHiddenBullishResult;
    }

    const rsiHiddenBearishResult = RsiBearishDivergenceService.hasDivergence(
      selectedCandlestickData,
      timeFrame
    );
    if (rsiHiddenBearishResult.divergence == RsiDivergenceTypes.HiddenBearish) {
      return rsiHiddenBearishResult;
    }

    return rsiResult;

    ///////////////////////////////////////////////////////

    // if (RsiBullishDivergenceService.hasDivergence(rsi14PeriodData)) {
    //   rsiResult.divergence = RsiDivergenceTypes.Bullish;
    //   rsiResult.direction = RsiDivergenceDirection.Bullish;
    // } else if (RsiBearishDivergenceService.hasDivergence(rsi14PeriodData)) {
    //   rsiResult.divergence = RsiDivergenceTypes.Bearish;
    //   rsiResult.direction = RsiDivergenceDirection.Bearish;
    // } else {
    //   if (timeFrame != BinanceChartTimeFrames.chart5minute) {
    //     if (RsiHiddenBullishDivergenceService.hasDivergence(rsi14PeriodData)) {
    //       rsiResult.divergence = RsiDivergenceTypes.HiddenBullish;
    //       rsiResult.direction = RsiDivergenceDirection.Bullish;
    //     } else if (
    //       RsiHiddenBearishDivergenceService.hasDivergence(rsi14PeriodData)
    //     ) {
    //       rsiResult.divergence = RsiDivergenceTypes.HiddenBearish;
    //       rsiResult.direction = RsiDivergenceDirection.Bearish;
    //     }
    //   }
    // }

    // if (rsiResult.divergence === RsiDivergenceTypes.NotAvailable) {
    //   const rsi7PeriodData = this.extractRsiDataFromClosingPrices(
    //     closingPrices,
    //     7
    //   );

    //   if (!rsi7PeriodData) {
    //     return rsiResult;
    //   }

    //   if (RsiOverboughtService.hasOverbought(rsi7PeriodData, timeFrame)) {
    //     rsiResult.divergence = RsiDivergenceTypes.OverBought;
    //     rsiResult.direction = RsiDivergenceDirection.Bearish;
    //   } else if (RsiOversoldService.hasOversold(rsi7PeriodData, timeFrame)) {
    //     rsiResult.divergence = RsiDivergenceTypes.OverSold;
    //     rsiResult.direction = RsiDivergenceDirection.Bullish;
    //   }
    // }

    return rsiResult;
  }

  private static extractRsiDataFromClosingPrices(
    closingPrices: number[],
    rsiPeriod: number
  ): RsiProcessedData[] | null {
    if (closingPrices.length < 100) {
      return null;
    }

    const rsiResults = RSI.calculate({
      values: closingPrices,
      period: rsiPeriod,
    });

    let rsiProcessedData: RsiProcessedData[] = [];

    for (let index = 1; index < 66; index++) {
      rsiProcessedData.unshift({
        rsiValue: rsiResults[rsiResults.length - index],
        closePrice: closingPrices[closingPrices.length - index],
        eventNumber: rsiResults.length - index,
      });
    }

    return rsiProcessedData;
  }
}
