import { BinanceChartTimeFrames } from "./chartTimeFrames.enum";
import {
  RsiDivergenceDirection,
  RsiDivergenceTypes,
} from "./rsi-divergence-types.enum";

export interface RsiDivergenceResult {
  divergence: RsiDivergenceTypes;
  timeFrame: BinanceChartTimeFrames;
  direction: RsiDivergenceDirection;
}
