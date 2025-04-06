import { RsiDivergenceService } from "./services/rsi-divergence.service";
import { BinanceApiService } from "./services/binance-api.service";
import { TimeFrameService } from "./services/time-frame.service";
import { AlertMessageService } from "./services/alert-message.service";
import { Utils } from "./services/utils.service";
import { RsiDivergenceTypes } from "./models/rsi-divergence-types.enum";
import { PuppeteerService } from "./services/puppeteer.service";

async function executeAnalysis(): Promise<void> {
  // Just to make sure last candle is closed before the analyzer runs
  await new Promise((resolve) => setTimeout(() => resolve(0), 1000));

  const timeFramesToAnalyze = TimeFrameService.getTimeFramesToAnalyze();

  for (let index = 0; index < timeFramesToAnalyze.length; index++) {
    const timeFrame = timeFramesToAnalyze[index];
    const candleStickData = await BinanceApiService.fetchCandlestickData(
      timeFrame
    );

    if (candleStickData) {
      // for (let index = 1; index < candleStickData.length - 100; index++) {
      //   const dataPart = candleStickData.slice(
      //     candleStickData.length - index - 100,
      //     candleStickData.length - index
      //   );
      //   const rsiDivergenceResult = RsiDivergenceService.findRsiDivergence(
      //     dataPart,
      //     timeFrame
      //   );
      //   if (rsiDivergenceResult.divergence != RsiDivergenceTypes.NotAvailable) {
      //     const chartImage = await PuppeteerService.getChartImage(
      //       dataPart,
      //       rsiDivergenceResult
      //     );
      //     await AlertMessageService.sendAlertMessage(
      //       rsiDivergenceResult,
      //       chartImage
      //     );
      //   }
      // }

      const rsiDivergenceResult = RsiDivergenceService.findRsiDivergence(
        candleStickData,
        timeFrame
      );
      let chartImage: Uint8Array<ArrayBufferLike> | null = null;
      if (rsiDivergenceResult.divergence !== RsiDivergenceTypes.NotAvailable) {
        chartImage = await PuppeteerService.getChartImage(
          candleStickData,
          rsiDivergenceResult
        );
      }
      await AlertMessageService.sendAlertMessage(
        rsiDivergenceResult,
        chartImage
      );
    }

    // give some time between api calls
    await new Promise((resolve) => setTimeout(() => resolve(0), 1000));
  }
}

executeAnalysis();

/* 
===============================================================================
||  -------- Following section is added to keep the process alive --------   ||
||  If you are running the analyzer as a cronjob, comment out the following  ||
||  section so that the process will exit after the analysis is done         ||
===============================================================================
*/

// Start of keep-alive section ================================================
//
// Utils.logMessage("-------------------------");
// Utils.logMessage("Analyzer started");
// Utils.logMessage("-------------------------");

// const reTryInterval = 1000 * 60; // 1 minute
// setInterval(() => {
//   executeAnalysis();
// }, reTryInterval);
//
// End of keep-alive section ===================================================
