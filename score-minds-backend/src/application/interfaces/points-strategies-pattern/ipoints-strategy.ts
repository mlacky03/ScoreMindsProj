export interface IPointsCalculationStrategy {
  calculatePoints(
    prediction: any, match: any, actualWinner: string
  ): number;
}