import { Browser, launch, Page } from "puppeteer";
import { RsiCandlestickData } from "../models/candlestick-data.model";
import { readFileSync } from "fs";
import { join } from "path";
import { RsiDivergenceResult } from "../models/rsi-divergence-result.model";
import { Utils } from "./utils.service";
import { CryptoAssetId } from "../models/cryptoAssetId.enum";
const fs = require("fs").promises;
const path = require("path");

export class PuppeteerService {
  private static browser: Browser | null = null;

  static async getChartImage(
    assetId: CryptoAssetId,
    chartData: RsiCandlestickData[],
    divergenceResult: RsiDivergenceResult
  ): Promise<Uint8Array<ArrayBufferLike> | null> {
    const page = await this.createPage();

    const rsiChartData = chartData.map((item) => ({
      time: item.time,
      value: item.rsi,
    }));

    const rsiCandleGap = divergenceResult.candleDistance;

    const title1 = `${assetId} ${divergenceResult.timeFrame.toUpperCase()}`;
    const title2 = divergenceResult.divergence;
    const title3 = Utils.getDateTimeForLogging();
    const direction = divergenceResult.direction;

    await page.evaluate(
      (chartData, rsiChartData, rsiCandleGap) => {
        (globalThis as any).setChartData(chartData, rsiChartData, rsiCandleGap);
      },
      chartData,
      rsiChartData,
      rsiCandleGap
    );

    await page.evaluate(
      (title1, title2, title3, direction) => {
        (globalThis as any).setChartLegend(title1, title2, title3, direction);
      },
      title1,
      title2,
      title3,
      direction
    );

    await new Promise((resolve) => setTimeout(resolve, 500));

    if (Utils.isBackTesting()) {
      await this.createDirIfNotExists("backtests");
      await page.screenshot({
        path: `backtests/${assetId}-${divergenceResult.timeFrame}-${
          chartData[chartData.length - 1].time
        }.png`,
      });
    }

    const screenshotBuffer = await page.screenshot();

    await this.closePage();

    return screenshotBuffer;
  }

  private static async createPage(): Promise<Page> {
    const htmlFilePath = join(__dirname, "chart.html");
    const htmlContent = readFileSync(htmlFilePath, "utf-8");

    this.browser = await launch({
      // executablePath: "/usr/bin/chromium-browser",
      headless: true, // 👈 This makes the browser visible
      // defaultViewport: null, // Optional: use full window size
      // args: ["--start-maximized"], // Optional: open window maximized
    });

    const page = await this.browser.newPage();

    await page.setViewport({ width: 1000, height: 750 });

    await page.setContent(htmlContent);

    await page.content();

    return page;
  }

  public static async closePage(): Promise<void> {
    // await new Promise((resolve) => setTimeout(resolve, 500000));
    await this.browser?.close();
  }

  private static async createDirIfNotExists(dirPath: string) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (err) {
      console.error(`Error creating directory: ${err}`);
    }
  }
}
