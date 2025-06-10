import { Direction, resolveDirection } from './directions';
import { Easing, resolveEasing } from './easing';
import { interpolate, mergeValues } from './interpolate';

type TransitionOptions<T> = {
  from: T;
  to: T;
  duration: number;
  delay: number;
  easing: Easing;
  direction: Direction;
  iterationCount: number;
};

const defaultOptions: TransitionOptions<number> = {
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
 */
const validateIterationCount = (iteration: unknown): number => {
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
 * Factory function building a pre-loaded transition that can be
 * ticked on every frame.
 */
export const transition = <T>(_options: Partial<TransitionOptions<T>> = {}) => {
  const options = Object.assign({}, defaultOptions, _options);
  const easingFn = resolveEasing(options.easing);
  const directionFn = resolveDirection(options.direction);
  const iterationCount = validateIterationCount(options.iterationCount);
  const { from, to, duration, delay } = options;

  const tickFn = (tick: number) => {
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
 * Factor function builidng a pre-loaded sequential transition that
 * can be ticked on every frame.
 */
export const sequentialTransition = <T>(
  initial: Partial<TransitionOptions<T>>,
  ...keyframes: Array<Partial<TransitionOptions<T>>>
) => {
  const initialOptions = Object.assign({}, defaultOptions, initial);
  const initialEasing = initialOptions.easing;
  const initialDuration = initialOptions.duration;

  let currentTime = initialOptions.delay;
  const transitions: Array<ReturnType<typeof transition>> = [];

  for (let i = 0; i < keyframes.length; i++) {
    const keyframe = keyframes[i]!;

    const from = i === 0 ? initialOptions.from : transitions[i - 1]!.to;
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

  return (tick: number) => {
    for (let i = 0; i < transitions.length; i++) {
      const transition = transitions[i]!;
      const value = transition(tick);
      if (i === transitions.length - 1) return value;
      if (tick >= transition.endsAt) continue;
      return value;
    }

    return transitions[transitions.length - 1]!.to;
  };
};
