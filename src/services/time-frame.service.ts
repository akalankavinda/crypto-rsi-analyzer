import { BinanceChartTimeFrames } from "../models/chartTimeFrames.enum";

export class TimeFrameService {
  public static getTimeFramesToAnalyze(): BinanceChartTimeFrames[] {
    const timeFramesToAnalyze: BinanceChartTimeFrames[] = [];
    // const timeFramesToAnalyze: BinanceChartTimeFrames[] = [
    //   BinanceChartTimeFrames.chart15minute,
    //   BinanceChartTimeFrames.chart1hour,
    //   BinanceChartTimeFrames.chart2hour,
    //   BinanceChartTimeFrames.chart4hour,
    //   BinanceChartTimeFrames.chart1Day,
    // ];

    const today = new Date();
    const currentMinute = today.getUTCMinutes();
    const currentHour = today.getUTCHours();
    const currentDay = today.getUTCDay();

    const analyze5minChart = currentMinute % 5 === 0;
    if (analyze5minChart) {
      timeFramesToAnalyze.push(BinanceChartTimeFrames.chart5minute);

      const analyze15minChart = currentMinute % 15 === 0;
      if (analyze15minChart) {
        timeFramesToAnalyze.push(BinanceChartTimeFrames.chart15minute);

        const analyze1hrChart = currentMinute === 0;
        if (analyze1hrChart) {
          timeFramesToAnalyze.push(BinanceChartTimeFrames.chart1hour);

          const analyze2hrChart = currentHour % 2 === 0;
          if (analyze2hrChart) {
            timeFramesToAnalyze.push(BinanceChartTimeFrames.chart2hour);

            const analyze4hrChart = currentHour % 4 === 0;
            if (analyze4hrChart) {
              timeFramesToAnalyze.push(BinanceChartTimeFrames.chart4hour);

              const analyze1dChart = currentHour === 0;
              if (analyze1dChart) {
                timeFramesToAnalyze.push(BinanceChartTimeFrames.chart1Day);

                const analyze7dChart = analyze1dChart && currentDay === 1;
                if (analyze7dChart) {
                  timeFramesToAnalyze.push(BinanceChartTimeFrames.chart7Day);
                }
              }
            }
          }
        }
      }
    }

    return timeFramesToAnalyze;
  }
}
