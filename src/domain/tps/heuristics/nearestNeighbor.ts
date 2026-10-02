export function nearestNeighbor(
  pointCount: number,
  durationMatrix: number[][],
  startIndex: number = 0,
): number[] {
  if (pointCount <= 1) return [];

  const unvisited = new Set<number>();
  for (let i = 0; i < pointCount; i++) {
    if (i !== startIndex) {
      unvisited.add(i);
    }
  }

  const route: number[] = [];
  let currentIndex = startIndex;

  while (unvisited.size > 0) {
    let nearestIndex: number | null = null;
    let nearestDistance = Infinity;

    for (const candidateIndex of unvisited) {
      const duration = durationMatrix[currentIndex][candidateIndex];

      if (duration === undefined) {
        throw new Error(
          `Duration from ${currentIndex} to ${candidateIndex} is undefined.`,
        );
      }

      if (duration < nearestDistance) {
        nearestDistance = duration;
        nearestIndex = candidateIndex;
      }
    }
    if (nearestIndex === null) break;

    route.push(nearestIndex);
    unvisited.delete(nearestIndex);
    currentIndex = nearestIndex;
  }
  return route;
}
