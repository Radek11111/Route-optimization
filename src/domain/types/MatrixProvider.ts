import { Point } from "./Point";

export type MatrixResult = {
  durationMatrix: number[][];
  distanceMatrix: number[][];
};

export interface MatrixProvider {
  getMatrix(points: Point[]): Promise<MatrixResult>;
}
