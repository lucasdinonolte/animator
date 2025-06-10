import { createCubicBezier } from './bezier';

const easeOutBounce = (t: number) => {
  const scaledTime = t / 1;

  if (scaledTime < 1 / 2.75) {
    return 7.5625 * scaledTime * scaledTime;
  } else if (scaledTime < 2 / 2.75) {
    const scaledTime2 = scaledTime - 1.5 / 2.75;
    return 7.5625 * scaledTime2 * scaledTime2 + 0.75;
  } else if (scaledTime < 2.5 / 2.75) {
    const scaledTime2 = scaledTime - 2.25 / 2.75;
    return 7.5625 * scaledTime2 * scaledTime2 + 0.9375;
  } else {
    const scaledTime2 = scaledTime - 2.625 / 2.75;
    return 7.5625 * scaledTime2 * scaledTime2 + 0.984375;
  }
};

const easeInBounce = (t: number) => {
  return 1 - easeOutBounce(1 - t);
};

/**
 * A pre-configured collection of the most commonly used
 * easing curves.
 *
 * Ported from https://gist.github.com/gre/1650294
 * and https://github.com/AndrewRayCode/easing-utils/blob/master/src/easing.js
 */
export const EasingFunctions = {
  // no easing, no acceleration
  linear: (t: number) => t,

  // accelerating from zero velocity
  easeInQuad: (t: number) => t * t,

  // decelerating to zero velocity
  easeOutQuad: (t: number) => t * (2 - t),

  // acceleration until halfway, then deceleration
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

  // accelerating from zero velocity
  easeInCubic: (t: number) => t * t * t,

  // decelerating to zero velocity
  easeOutCubic: (t: number) => --t * t * t + 1,

  // acceleration until halfway, then deceleration
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

  // accelerating from zero velocity
  easeInQuart: (t: number) => t * t * t * t,

  // decelerating to zero velocity
  easeOutQuart: (t: number) => 1 - --t * t * t * t,

  // acceleration until halfway, then deceleration
  easeInOutQuart: (t: number) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,

  // accelerating from zero velocity
  easeInQuint: (t: number) => t * t * t * t * t,

  // decelerating to zero velocity
  easeOutQuint: (t: number) => 1 + --t * t * t * t * t,

  // acceleration until halfway, then deceleration
  easeInOutQuint: (t: number) =>
    t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t,

  // Accelerate exponentially until finish
  easeInExpo: (t: number) => {
    if (t === 0) {
      return 0;
    }

    return Math.pow(2, 10 * (t - 1));
  },

  // Initial exponential acceleration slowing to stop
  easeOutExpo: (t: number) => {
    if (t === 1) {
      return 1;
    }

    return -Math.pow(2, -10 * t) + 1;
  },

  // Exponential acceleration and deceleration
  easeInOutExpo: (t: number) => {
    if (t === 0 || t === 1) {
      return t;
    }

    const scaledTime = t * 2;
    const scaledTime1 = scaledTime - 1;

    if (scaledTime < 1) {
      return 0.5 * Math.pow(2, 10 * scaledTime1);
    }

    return 0.5 * (-Math.pow(2, -10 * scaledTime1) + 2);
  },

  // Increasing velocity until stop
  easeInCirc: (t: number) => {
    const scaledTime = t / 1;
    return -1 * (Math.sqrt(1 - scaledTime * t) - 1);
  },

  // Start fast, decreasing velocity until stop
  easeOutCirc: (t: number) => {
    const t1 = t - 1;
    return Math.sqrt(1 - t1 * t1);
  },

  // Fast increase in velocity, fast decrease in velocity
  easeInOutCirc: (t: number) => {
    const scaledTime = t * 2;
    const scaledTime1 = scaledTime - 2;

    if (scaledTime < 1) {
      return -0.5 * (Math.sqrt(1 - scaledTime * scaledTime) - 1);
    }

    return 0.5 * (Math.sqrt(1 - scaledTime1 * scaledTime1) + 1);
  },

  // Slow movement backwards then fast snap to finish
  easeInBack: (t, magnitude = 1.70158) => {
    return t * t * ((magnitude + 1) * t - magnitude);
  },

  // Fast snap to backwards point then slow resolve to finish
  easeOutBack: (t, magnitude = 1.70158) => {
    const scaledTime = t / 1 - 1;

    return (
      scaledTime * scaledTime * ((magnitude + 1) * scaledTime + magnitude) + 1
    );
  },

  // Slow movement backwards, fast snap to past finish, slow resolve to finish
  easeInOutBack: (t, magnitude = 1.70158) => {
    const scaledTime = t * 2;
    const scaledTime2 = scaledTime - 2;

    const s = magnitude * 1.525;

    if (scaledTime < 1) {
      return 0.5 * scaledTime * scaledTime * ((s + 1) * scaledTime - s);
    }

    return 0.5 * (scaledTime2 * scaledTime2 * ((s + 1) * scaledTime2 + s) + 2);
  },

  // Bounces slowly then quickly to finish
  easeInElastic: (t, magnitude = 0.7) => {
    if (t === 0 || t === 1) {
      return t;
    }

    const scaledTime = t / 1;
    const scaledTime1 = scaledTime - 1;

    const p = 1 - magnitude;
    const s = (p / (2 * Math.PI)) * Math.asin(1);

    return -(
      Math.pow(2, 10 * scaledTime1) *
      Math.sin(((scaledTime1 - s) * (2 * Math.PI)) / p)
    );
  },

  // Fast acceleration, bounces to zero
  easeOutElastic: (t, magnitude = 0.7) => {
    if (t === 0 || t === 1) {
      return t;
    }

    const p = 1 - magnitude;
    const scaledTime = t * 2;

    const s = (p / (2 * Math.PI)) * Math.asin(1);
    return (
      Math.pow(2, -10 * scaledTime) *
        Math.sin(((scaledTime - s) * (2 * Math.PI)) / p) +
      1
    );
  },

  // Slow start and end, two bounces sandwich a fast motion
  easeInOutElastic: (t, magnitude = 0.65) => {
    if (t === 0 || t === 1) {
      return t;
    }

    const p = 1 - magnitude;
    const scaledTime = t * 2;
    const scaledTime1 = scaledTime - 1;

    const s = (p / (2 * Math.PI)) * Math.asin(1);

    if (scaledTime < 1) {
      return (
        -0.5 *
        (Math.pow(2, 10 * scaledTime1) *
          Math.sin(((scaledTime1 - s) * (2 * Math.PI)) / p))
      );
    }

    return (
      Math.pow(2, -10 * scaledTime1) *
        Math.sin(((scaledTime1 - s) * (2 * Math.PI)) / p) *
        0.5 +
      1
    );
  },

  // Bounce to completion
  easeOutBounce,

  // Bounce increasing in velocity until completion
  easeInBounce,

  // Bounce in and bounce out
  easeInOutBounce: (t: number) => {
    if (t < 0.5) {
      return easeInBounce(t * 2) * 0.5;
    }

    return easeOutBounce(t * 2 - 1) * 0.5 + 0.5;
  },
} as const;

type NamedEasing = keyof typeof EasingFunctions;
type EasingFunction = (t: number) => number;
type CubicBezier = [number, number, number, number];

export type Easing = NamedEasing | EasingFunction | CubicBezier;

/**
 * Turns the user specified easing into a function that can
 * be executed by the transition utility.
 *
 * Easing can either be a string referencing one of the
 * pre-built easing functions or a custom function.
 */
export const resolveEasing = (easing: Easing): EasingFunction => {
  // If the user specified a function for the easing,
  // we’re using that
  if (typeof easing === 'function') return easing;

  if (Array.isArray(easing)) {
    if (easing.length !== 4) {
      throw new Error(`Cubic bezier easing must be an array of 4 numbers.`);
    }

    return createCubicBezier(...easing);
  }

  // If not, we check if we can return a pre-built
  // easing function
  if (EasingFunctions[easing]) return EasingFunctions[easing];

  // Lastly we need to throw
  throw new Error(
    `Unexpected easing (${easing}) passed to transition function. Easing should either be a custom function or one of the pre-built values: ${Object.keys(
      EasingFunctions,
    ).join(', ')}.`,
  );
};
