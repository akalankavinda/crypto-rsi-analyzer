import { Browser, launch, Page } from "puppeteer";
import { RsiCandlestickData } from "../models/candlestick-data.model";
import { readFileSync } from "fs";
import { join } from "path";
import { RsiDivergenceResult } from "../models/rsi-divergence-result.model";
import { time } from "console";

export class PuppeteerService {
  private static browser: Browser | null = null;

  static async getChartImage(
    chartData: RsiCandlestickData[],
    divergenceResult: RsiDivergenceResult
  ): Promise<Uint8Array<ArrayBufferLike> | null> {
    const page = await this.createPage();

    const rsiChartData = chartData.map((item) => ({
      time: item.time,
      value: item.rsi,
    }));

    const rsiCandleGap = divergenceResult.candleDistance;

    await page.evaluate(
      (chartData, rsiChartData, rsiCandleGap) => {
        (globalThis as any).setChartData(chartData, rsiChartData, rsiCandleGap);
      },
      chartData,
      rsiChartData,
      rsiCandleGap
    );

    await new Promise((resolve) => setTimeout(resolve, 500));

    const screenshotBuffer = await page.screenshot();

    await this.closePage();

    return screenshotBuffer;
  }

  private static async createPage(): Promise<Page> {
    const htmlFilePath = join(__dirname, "chart.html");
    const htmlContent = readFileSync(htmlFilePath, "utf-8");

    this.browser = await launch({
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
    await this.browser?.close();
  }
}
