import { Point } from "./Point";

export interface MatrixProvider {
  getMatrix(points: Point[]): Promise<number[][]>;
}
