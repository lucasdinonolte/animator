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
  onStart: () => void;
  onUpdate: (progress: number) => void;
  onComplete: () => void;
};

const defaultOptions: TransitionOptions<number> = {
  from: 0,
  to: 0,
  duration: 0,
  delay: 0,
  easing: 'linear',
  iterationCount: 1,
  direction: 'forward',
  onStart: () => {},
  onUpdate: () => {},
  onComplete: () => {},
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
  const { from, to, duration, delay, onStart, onComplete, onUpdate } = options;

  // As transitions are potentially being used in animations of various
  // framerates, we cannot guarantee "pure" lifecycle values for our t
  // values (such as 0 for start and 1 for end).
  // 
  // We therefore keep track of which lifecycle events have been fired,
  // to allow for a more heuristic approach when to fire them. For example
  // the `onStart` event will be fired as soon as the currentTime is bigger
  // than 0 and `onStart` has not been fired before.
  const lifecycle = {
    hasStarted: false,
    hasCompleted: false,
  }

  const tickFn = (tick: number) => {
    const currentTime = Math.max(0, tick - delay);

    if (!lifecycle.hasStarted && currentTime > 0) {
      lifecycle.hasStarted = true;
      onStart();
    }

    // Scaling by 1000 turns any input made in seconds into milliseconds
    // and makes sure we can safely divide numbers
    const t = directionFn(currentTime * 1000, duration * 1000, iterationCount);

    onUpdate(Math.min(1, t));

    if (!lifecycle.hasCompleted && (currentTime * 1000) >= duration * 1000 * iterationCount) {
      lifecycle.hasCompleted = true;
      onComplete();
    }

    return interpolate({ from, to }, easingFn(t));
  };

  tickFn.startsAt = delay;
  tickFn.endsAt = delay + duration * iterationCount;
  tickFn.from = from;
  tickFn.to = to;

  return tickFn;
};

/**
 * Factory function builidng a pre-loaded sequential transition that
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

type Scene = {
  duration: number;
  scene: ({ globalTick, tick, playhead }: { globalTick: number; tick: number; playhead: number }) => void;
}

/**
 * Combines multiple scenes into a single function that determines which scene
 * should be active based on the current tick value.
 * 
 * @param scenes - An array of Scene objects, each containing a duration and a scene function.
 * @returns A function that takes a tick value and executes the appropriate scene
 *          based on the elapsed time.
 */
export const scenes = (...scenes: Array<Scene>) => {
  return (tick: number) => {
    let elapsed = 0;
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i]!;

      if (tick >= elapsed && tick < elapsed + scene.duration) {
        const currentTick = tick - elapsed;
        const playhead = currentTick / scene.duration;

        scene.scene({ globalTick: tick, tick: currentTick, playhead });
        return;
      }

      elapsed += scene.duration;
    }
  };
}
