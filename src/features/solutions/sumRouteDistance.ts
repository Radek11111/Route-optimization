export function sumRouteDistance(
  route: number[],
  distanceMatrix: number[][],
  depotIndex: number,
  returnToDepot: boolean,
): number {
  if (route.length === 0) return 0;

  let totalMeters = 0;
  let currentIndex = depotIndex;

  for (const pointIndex of route) {
    const distance = distanceMatrix[currentIndex]?.[pointIndex];
    if (distance === undefined) {
      throw new Error(
        `Distance from point ${currentIndex} to point ${pointIndex} is undefined`,
      );
    }
    totalMeters += distance;
    currentIndex = pointIndex;
  }
  if (returnToDepot && currentIndex !== depotIndex) {
    const returnDistance = distanceMatrix[currentIndex]?.[depotIndex];

    if (returnDistance === undefined) {
      throw new Error(
        `Distance from point ${currentIndex} to depot ${depotIndex} is undefined`,
      );
    }
    totalMeters += returnDistance;
  }
  return totalMeters;
}
