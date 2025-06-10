type InterpolatableBaseType = number;
export type Interpolatable =
  | InterpolatableBaseType
  | Array<Interpolatable>
  | Record<string, InterpolatableBaseType>;

const interpolateNumber = (
  { from, to }: { from: number; to: number },
  t: number,
) => {
  const change = to - from;
  return change * t + from;
};

const interpolateArray = (
  { from, to }: { from: Array<Interpolatable>; to: Array<Interpolatable> },
  t: number,
): Array<Interpolatable> => {
  if (from.length !== to.length)
    throw new Error(
      'When interpolating arrays they need to have the same length.',
    );

  return from.map((v, i) => interpolate({ from: v, to: to[i] }, t));
};

const interpolateObject = (
  {
    from,
    to,
  }: {
    from: Record<string, Interpolatable>;
    to: Record<string, Interpolatable>;
  },
  t: number,
): Record<string, Interpolatable> => {
  const allKeys = Object.keys({ ...from, ...to });

  return allKeys.reduce(
    (acc, cur) => {
      const _f = from[cur] ?? to[cur];
      const _t = to[cur] ?? from[cur];

      acc[cur] = interpolate({ from: _f, to: _t }, t);
      return acc;
    },
    {} as Record<string, Interpolatable>,
  );
};

/**
 * Interpolates between two values based on the current
 * t value. Checks for the type of the values to dispatch
 * the correct interpolation method.
 */
export const interpolate = (
  { from, to }: { from: Interpolatable; to: Interpolatable },
  t: number,
) => {
  if (typeof from === 'number' && typeof to === 'number')
    return interpolateNumber({ from, to }, t);
  if (Array.isArray(from) && Array.isArray(to))
    return interpolateArray({ from, to }, t);
  if (typeof from === 'object' && typeof to === 'object')
    return interpolateObject({ from, to }, t);
  if (typeof from === typeof to) return t < 0.5 ? from : to;

  throw new Error(
    'Interpolation failed. The from and to values need to be of the same type.',
  );
};

/**
 * Merges from and to values, if they are an object
 */
export const mergeValues = (from: Interpolatable, to: Interpolatable) => {
  if (typeof from === 'number' && typeof to === 'number') return to;
  if (Array.isArray(from) && Array.isArray(to)) return to;
  if (typeof from === 'object' && typeof to === 'object')
    return { ...from, ...to };
  if (typeof from === typeof to) return to;

  throw new Error(
    'Interpolation failed. The from and to values need to be of the same type.',
  );
};
