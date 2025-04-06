import { RsiDivergenceService } from "./services/rsi-divergence.service";
import { BinanceApiService } from "./services/binance-api.service";
import { TimeFrameService } from "./services/time-frame.service";
import { AlertMessageService } from "./services/alert-message.service";
import { RsiDivergenceTypes } from "./models/rsi-divergence-types.enum";
import { PuppeteerService } from "./services/puppeteer.service";
import { CryptoAssetId } from "./models/cryptoAssetId.enum";
import { BinanceChartTimeFrames } from "./models/chartTimeFrames.enum";
import { RsiCandlestickData } from "./models/candlestick-data.model";

async function runAnalyzer(): Promise<void> {
  // Just to make sure last candle is closed before the analyzer runs
  await new Promise((resolve) => setTimeout(() => resolve(0), 1000));

  const assetIdList = Object.values(CryptoAssetId);
  await analyzeAssets(assetIdList);
}

async function analyzeAssets(assetIdList: CryptoAssetId[]): Promise<void> {
  for (let index = 0; index < assetIdList.length; index++) {
    const assetId = assetIdList[index];
    await analyzeAssetTimeFrames(assetId);

    await new Promise((resolve) => setTimeout(() => resolve(0), 1000));
  }
}
async function analyzeAssetTimeFrames(assetId: CryptoAssetId): Promise<void> {
  const timeFramesToAnalyze = TimeFrameService.getTimeFramesToAnalyze();

  for (let index = 0; index < timeFramesToAnalyze.length; index++) {
    const timeFrame = timeFramesToAnalyze[index];
    await analyzeAssetChartData(assetId, timeFrame);

    await new Promise((resolve) => setTimeout(() => resolve(0), 1000));
  }
}
async function analyzeAssetChartData(
  assetId: CryptoAssetId,
  timeFrame: BinanceChartTimeFrames
): Promise<void> {
  const candleStickData = await BinanceApiService.fetchCandlestickData(
    assetId,
    timeFrame
  );

  if (candleStickData) {
    // await backTestStrategies(assetId, timeFrame, candleStickData);
    await findOpportunities(assetId, timeFrame, candleStickData);
  }
}

async function backTestStrategies(
  assetId: CryptoAssetId,
  timeFrame: BinanceChartTimeFrames,
  candleStickData: RsiCandlestickData[]
): Promise<void> {
  for (let index = 1; index < candleStickData.length - 100; index++) {
    const dataPart = candleStickData.slice(
      candleStickData.length - index - 100,
      candleStickData.length - index
    );
    const rsiDivergenceResult = RsiDivergenceService.findRsiDivergence(
      dataPart,
      timeFrame
    );
    if (rsiDivergenceResult.divergence != RsiDivergenceTypes.NotAvailable) {
      const chartImage = await PuppeteerService.getChartImage(
        assetId,
        dataPart,
        rsiDivergenceResult
      );
      // await AlertMessageService.sendAlertMessage(
      //   rsiDivergenceResult,
      //   chartImage
      // );
    }
  }
}
async function findOpportunities(
  assetId: CryptoAssetId,
  timeFrame: BinanceChartTimeFrames,
  candleStickData: RsiCandlestickData[]
): Promise<void> {
  const rsiDivergenceResult = RsiDivergenceService.findRsiDivergence(
    candleStickData,
    timeFrame
  );
  let chartImage: Uint8Array<ArrayBufferLike> | null = null;
  if (rsiDivergenceResult.divergence !== RsiDivergenceTypes.NotAvailable) {
    chartImage = await PuppeteerService.getChartImage(
      assetId,
      candleStickData,
      rsiDivergenceResult
    );
  }
  await AlertMessageService.sendAlertMessage(
    assetId,
    rsiDivergenceResult,
    chartImage
  );
}

runAnalyzer();

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
