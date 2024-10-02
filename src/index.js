import { DirectionFunctions, resolveDirection } from './directions';
import { EasingFunctions, resolveEasing } from './easing';
import { interpolate } from './interpolate';

const defaultOptions = {
  from: 0,
  to: 0,
  duration: 0,
  delay: 0,
  easing: 'linear',
  iterationCount: 1,
  direction: 'forward',
};

/**
 * Validates the iteration supplied by the user to be a positive
 * integer value.
 *
 * @params{any} iteration
 * @returns number
 */
const validateIterationCount = (iteration) => {
  if (
    typeof iteration !== 'number' ||
    iteration < 0 ||
    (!Number.isInteger(iteration) && Number.isFinite(iteration))
  ) {
    throw new Error(
      `iterationCount expects a positive integer. Got ${iteration}.`,
    );
  }

  return iteration;
};

/**
 * Merges from and to values, if they are an object
 */
const mergeValues = (from, to) => {
  if (typeof from === 'number' && typeof to === 'number') return to;
  if (Array.isArray(from) && Array.isArray(to)) return to;
  if (typeof from === 'object' && typeof to === 'object')
    return { ...from, ...to };
  if (typeof from === typeof to) return to;

  throw new Error(
    'Interpolation failed. The from and to values need to be of the same type.',
  );
};

/**
 * Factory function building a pre-loaded transition that can be
 * ticked on every frame.
 *
 * @params {object} options
 * @returns {function}
 */
export const transition = (_options = {}) => {
  const options = Object.assign({}, defaultOptions, _options);
  const easingFn = resolveEasing(options.easing);
  const directionFn = resolveDirection(options.direction);
  const iterationCount = validateIterationCount(options.iterationCount);
  const { from, to, duration, delay } = options;

  const tickFn = (tick) => {
    const currentTime = Math.max(0, tick - delay);

    // Scaling by 1000 turns any input made in seconds into milliseconds
    // and makes sure we can safely divide numbers
    const t = directionFn(currentTime * 1000, duration * 1000, iterationCount);
    return interpolate({ from, to }, easingFn(t));
  };

  tickFn.startsAt = delay;
  tickFn.endsAt = delay + duration * iterationCount;
  tickFn.from = from;
  tickFn.to = to;

  return tickFn;
};

/**
 * Factory function building a pre-loaded sequential transition
 * that can be ticked on every frame.
 *
 * @param {object} initial
 * @param {...object} keyframes
 * @returns {function}
 */
export const sequentialTransition = (initial, ...keyframes) => {
  const initialOptions = Object.assign({}, defaultOptions, initial);
  const initialEasing = initialOptions.easing;
  const initialDuration = initialOptions.duration;

  let currentTime = initialOptions.delay;
  const transitions = [];

  for (let i = 0; i < keyframes.length; i++) {
    const keyframe = keyframes[i];

    const from = i === 0 ? initialOptions.from : transitions[i - 1].to;
    const to = mergeValues(from, keyframe.to);
    const duration = keyframe.duration ?? initialDuration;
    const delay = currentTime + (keyframe.delay ?? 0);
    const easing = keyframe.easing ?? initialEasing;

    currentTime += duration + (keyframe.delay ?? 0);

    transitions.push(
      transition({
        from,
        to,
        duration,
        delay,
        easing,
      }),
    );
  }

  return (tick) => {
    for (let i = 0; i < transitions.length; i++) {
      const transition = transitions[i];
      const value = transition(tick);
      if (i === transitions.length - 1) return value;
      if (tick >= transition.endsAt) continue;
      return value;
    }
  };
};

/**
 * Factory function building a pre-loaded parallel transition
 * that can be ticked on every frame.
 *
 * @param {...function|object} args
 * @returns {function}
 */
export const parallelTransition = (...args) => {
  const transitions = args.map((arg) => {
    if (typeof arg === 'function') return arg;
    return transition(arg);
  });

  return (tick) => {
    return transitions.map((transition) => transition(tick));
  };
};

export const namedEasings = Object.keys(EasingFunctions);
export const namedDirections = Object.keys(DirectionFunctions);
