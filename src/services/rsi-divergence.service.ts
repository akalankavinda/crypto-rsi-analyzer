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

export class RsiDivergenceService {
  public static findRsiDivergence(
    closingPrices: number[],
    timeFrame: BinanceChartTimeFrames
  ): RsiDivergenceResult {
    /* closingPrices = [......................., (last_candle - 2), (last_candle - 1), last_candle] */

    const rsi14PeriodData = this.extractRsiDataFromClosingPrices(
      closingPrices,
      14
    );

    const rsiResult: RsiDivergenceResult = {
      divergence: RsiDivergenceTypes.NotAvailable,
      timeFrame: timeFrame,
      direction: RsiDivergenceDirection.NotAvailable,
    };

    if (!rsi14PeriodData) {
      return rsiResult;
    }

    if (RsiBullishDivergenceService.hasDivergence(rsi14PeriodData)) {
      rsiResult.divergence = RsiDivergenceTypes.Bullish;
      rsiResult.direction = RsiDivergenceDirection.Bullish;
    } else if (RsiBearishDivergenceService.hasDivergence(rsi14PeriodData)) {
      rsiResult.divergence = RsiDivergenceTypes.Bearish;
      rsiResult.direction = RsiDivergenceDirection.Bearish;
    } else {
      if (timeFrame != BinanceChartTimeFrames.chart15minute) {
        if (RsiHiddenBullishDivergenceService.hasDivergence(rsi14PeriodData)) {
          rsiResult.divergence = RsiDivergenceTypes.HiddenBullish;
          rsiResult.direction = RsiDivergenceDirection.Bullish;
        } else if (
          RsiHiddenBearishDivergenceService.hasDivergence(rsi14PeriodData)
        ) {
          rsiResult.divergence = RsiDivergenceTypes.HiddenBearish;
          rsiResult.direction = RsiDivergenceDirection.Bearish;
        }
      }
    }

    if (rsiResult.divergence === RsiDivergenceTypes.NotAvailable) {
      const rsi5PeriodData = this.extractRsiDataFromClosingPrices(
        closingPrices,
        5
      );

      if (!rsi5PeriodData) {
        return rsiResult;
      }

      if (RsiOverboughtService.hasOverbought(rsi5PeriodData, timeFrame)) {
        rsiResult.divergence = RsiDivergenceTypes.OverBought;
        rsiResult.direction = RsiDivergenceDirection.Bearish;
      } else if (RsiOversoldService.hasOversold(rsi5PeriodData, timeFrame)) {
        rsiResult.divergence = RsiDivergenceTypes.OverSold;
        rsiResult.direction = RsiDivergenceDirection.Bullish;
      }
    }

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
