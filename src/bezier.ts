type Point = [number, number];

export const createCubicBezier = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) => {
  const points: [Point, Point, Point, Point] = [
    [0, 0],
    [x1, y1],
    [x2, y2],
    [1, 1],
  ];

  const steps = 100;
  const lut: Array<Point> = Array.from({ length: steps }).map((_, i) => {
    const t = i / (steps - 1);
    if (t === 0) return [0, 0];
    if (t === 1) return [1, 1];

    const mt = 1 - t;
    const mt2 = mt * mt;
    const t2 = t * t;
    const a = mt2 * mt;
    const b = mt2 * t * 3;
    const c = mt * t2 * 3;
    const d = t * t2;

    const x = a * 0 + b * points[1][0] + c * points[2][0] + d * 1;
    const y = a * 0 + b * points[1][1] + c * points[2][1] + d * 1;

    return [x, y];
  });

  return (x: number) => {
    let closest: Point = lut[0]!;
    let secondClosest: Point = lut[0]!;

    for (let i = 1; i < lut.length; i++) {
      const point = lut[i]!;
      if (point[0] <= x && point[0] > closest[0]) {
        secondClosest = closest;
        closest = point;
      } else if (point[0] <= x && point[0] > secondClosest[0]) {
        secondClosest = point;
      }
    }

    // If x is outside the range of the lookup table, return the corresponding y
    if (x <= closest[0]) return closest[1];
    if (x >= secondClosest[0]) return secondClosest[1];

    // Linear interpolation
    const t = (x - closest[0]) / (secondClosest[0] - closest[0]);
    const y = closest[1] + t * (secondClosest[1] - closest[1]);
    return y;
  };
};
