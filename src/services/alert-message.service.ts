import { BinanceChartTimeFrames } from "../models/chartTimeFrames.enum";
import { RsiDivergenceResult } from "../models/rsi-divergence-result.model";
import {
  RsiDivergenceDirection,
  RsiDivergenceTypes,
} from "../models/rsi-divergence-types.enum";
import { TelegramService } from "./telegram.service";
import { Utils } from "./utils.service";

export class AlertMessageService {
  private static assetId = "BTC";

  public static async sendAlertMessage(
    result: RsiDivergenceResult
  ): Promise<void> {
    let directionEmoji = "⚪️";
    if (result.direction === RsiDivergenceDirection.Bullish) {
      directionEmoji = "🟢";
    } else if (result.direction === RsiDivergenceDirection.Bearish) {
      directionEmoji = "🔴";
    }

    const paddedTimeFrame = result.timeFrame.padEnd(3);

    let message = `${directionEmoji} ${this.assetId} ${paddedTimeFrame} ${result.divergence}`;
    let messageForLogger = message.slice(3);

    if (result.divergence != RsiDivergenceTypes.NotAvailable) {
      await TelegramService.pushAlertMessage(message);
      Utils.logMessage("-------------------------");
      Utils.logMessage(messageForLogger);
      Utils.logMessage("-------------------------");
      return;
    }

    Utils.logMessage(messageForLogger);
  }

  public static async sendLogMessage(
    timeFrames: BinanceChartTimeFrames[]
  ): Promise<void> {
    const timeFramesString = timeFrames
      .map((timeFrame) => `🔰${timeFrame}`)
      .join(", ");
    const message = `Analyzer ran on ${Utils.getDateTimeForLogging()}\nfor ${
      this.assetId
    } ${timeFramesString}`;
    await TelegramService.pushLogMessage(message);
  }
}
