import { BinanceChartTimeFrames } from "../models/chartTimeFrames.enum";
import { CryptoAssetId } from "../models/cryptoAssetId.enum";
import { RsiDivergenceResult } from "../models/rsi-divergence-result.model";
import {
  RsiDivergenceDirection,
  RsiDivergenceTypes,
} from "../models/rsi-divergence-types.enum";
import { TelegramService } from "./telegram.service";
import { Utils } from "./utils.service";

export class AlertMessageService {
  public static async sendAlertMessage(
    assetId: CryptoAssetId,
    result: RsiDivergenceResult,
    imageData?: Uint8Array<ArrayBufferLike> | null
  ): Promise<void> {
    let directionEmoji = "⚪️";
    if (result.direction === RsiDivergenceDirection.Bullish) {
      directionEmoji = "🟢";
    } else if (result.direction === RsiDivergenceDirection.Bearish) {
      directionEmoji = "🔴";
    }

    const paddedTimeFrame = result.timeFrame.padEnd(3);
    const assetIdWithoutUsdt = assetId.replace("USDT", "");

    let message = `${directionEmoji} ${assetIdWithoutUsdt} ${paddedTimeFrame} ${result.divergence}`;
    let messageForLogger = message.slice(3);

    if (result.divergence != RsiDivergenceTypes.NotAvailable) {
      if (imageData) {
        await TelegramService.pushAlertWithChart(message, imageData);
      } else {
        await TelegramService.pushAlertMessage(message);
      }

      Utils.logMessage("-------------------------");
      Utils.logMessage(messageForLogger);
      Utils.logMessage("-------------------------");
      return;
    }

    Utils.logMessage(messageForLogger);
  }
}
