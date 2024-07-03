# Animator

Utility package designed to make keyframe-like animations in code easier.

## Installation

```bash
npm install @lucasdinonolte/animator
```

## Usage

### Basic use case

```javascript
import { transition } from '@lucasdinonolte/animator';

// transition returns a function that can be called for
// each frame of the animation with the tick value
const xPos = transition({
  from: 0,
  to: 100,
  // These can be frames or seconds, depending on what
  // you pass as the tick in the next step
  duration: 10,
  delay: 1,

  // Allows to set how often the transition should run
  // Defaults to 1
  iterationCount: 10,

  // Defines the direction of the animation
  // forward (0 -> 1)
  // runs the animation in the specified direction
  //
  // reverse (1 -> 0)
  // runs the animation in the reversed direction
  //
  // alternate (0 -> 1 -> 0 -> 1 -> ...)
  // runs the animation in alternating directions, starting
  // with a forwards run.
  //
  // alternateReverse (1 -> 0 -> -> 0 -> ...)
  // runs the animation in alternating directions, starting
  // with a reversed run.
  //
  // Defaults to forward
  direction: 'alternate',

  // Sets the easing curve of the transition. Accepts a custom
  // function or a string referring to one of the predefined
  // easing curves. See `src/easings.js` for a list of all
  // predefined easings.
  //
  // Defaults to linear
  easing: 'easeInOutExpo',
});

// The defined transition can then be called with a tick
// value. The tick value is a value that increases from
// animation frame to frame. Usually this will either be
// the current frame's number or a timestamp value.
const x = xPos(frameNumber);
```

### Custom easing function

```javascript
import { transition } from '@lucasdinonolte/animator';

const xPos = transition({
  from: 23,
  to: 123,
  duration: 2,

  // Easing functions are called with a linear t value below 0 and 1
  // and map this value to whatever easing curve you want to approximate
  //
  // The example below maps to a cubic curve
  easing: (t) => t * t * t,
});
```

### Sequential Transition

```javascript
import { sequentialTransition } from '@lucasdinonolte/animator';

const xPos = sequentialTransition(
  // The first argument passed to sequentialTransition
  // describes the original state of the animation
  {
    from: 0,

    // If set, this duration will be used as the default
    // for animation steps that don’t define their own
    // duration.
    duration: 60,

    // If set, this easing will be used as the default
    // for animation steps that don't define their own
    // easing.
    easing: 'easeInQuad',
  },
  // All following argument describe keyframes of the animation
  // This keyframe will animate to 10, the transition will take
  // 60 frames (assuming frames are used as the tick value) and
  // start at 10 frames.
  {
    to: 10,
    delay: 10,
    duration: 60,
  },
  // This keyframe will animation back to 0. The transition will
  // take 120 frames and will start 20 frames after the previous
  // transition has ended.
  {
    to: 0,
    delay: 20,
    duration: 120,
  },
);
```

### Transition multiple values

```javascript
// Transition allows you to interpolate between numbers, or arrays
// and object of numbers. When working with arrays and objects make
// sure the shape of from and to value matches.
const pos = transition({
  from: { x: 10, y: 20 },
  to: { x: 0, y: 100 },
  duration: 20,
});

const { x, y } = pos(10);
```
