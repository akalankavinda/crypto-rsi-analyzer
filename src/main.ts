import { RsiDivergenceService } from "./services/rsi-divergence.service";
import { BinanceApiService } from "./services/binance-api.service";
import { TimeFrameService } from "./services/time-frame.service";
import { AlertMessageService } from "./services/alert-message.service";
import { Utils } from "./services/utils.service";

async function executeAnalysis(): Promise<void> {
  // Just to make sure last candle is closed before the analyzer runs
  await new Promise((resolve) => setTimeout(() => resolve(0), 1000));

  const timeFramesToAnalyze = TimeFrameService.getTimeFramesToAnalyze();

  for (let index = 0; index < timeFramesToAnalyze.length; index++) {
    const timeFrame = timeFramesToAnalyze[index];
    const closingData = await BinanceApiService.getClosingPricesList(timeFrame);

    if (closingData) {
      const rsiDivergenceResult = RsiDivergenceService.findRsiDivergence(
        closingData,
        timeFrame
      );

      await AlertMessageService.sendAlertMessage(rsiDivergenceResult);
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
