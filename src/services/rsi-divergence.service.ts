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

export class RsiDivergenceService {
  public static findRsiDivergence(
    closingPrices: number[],
    timeFrame: BinanceChartTimeFrames
  ): RsiDivergenceResult {
    /* closingPrices = [......................., (last_candle - 2), (last_candle - 1), last_candle] */

    const rsiData = this.extractRsiDataFromClosingPrices(closingPrices);

    const rsiResult: RsiDivergenceResult = {
      divergence: RsiDivergenceTypes.NotAvailable,
      timeFrame: timeFrame,
      direction: RsiDivergenceDirection.NotAvailable,
    };

    if (!rsiData) {
      return rsiResult;
    }

    if (RsiBullishDivergenceService.hasDivergence(rsiData)) {
      rsiResult.divergence = RsiDivergenceTypes.Bullish;
      rsiResult.direction = RsiDivergenceDirection.Bullish;
    } else if (RsiBearishDivergenceService.hasDivergence(rsiData)) {
      rsiResult.divergence = RsiDivergenceTypes.Bearish;
      rsiResult.direction = RsiDivergenceDirection.Bearish;
    } else {
      if (timeFrame != BinanceChartTimeFrames.chart15minute) {
        if (RsiHiddenBullishDivergenceService.hasDivergence(rsiData)) {
          rsiResult.divergence = RsiDivergenceTypes.HiddenBullish;
          rsiResult.direction = RsiDivergenceDirection.Bullish;
        } else if (RsiHiddenBearishDivergenceService.hasDivergence(rsiData)) {
          rsiResult.divergence = RsiDivergenceTypes.HiddenBearish;
          rsiResult.direction = RsiDivergenceDirection.Bearish;
        }
      }
    }

    return rsiResult;
  }

  private static extractRsiDataFromClosingPrices(
    closingPrices: number[]
  ): RsiProcessedData[] | null {
    if (closingPrices.length < 100) {
      return null;
    }

    const rsiResults = RSI.calculate({
      values: closingPrices,
      period: 14,
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
