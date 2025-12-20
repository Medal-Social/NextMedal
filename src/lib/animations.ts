export const DURATION = {
  fast: 0.1,
  base: 0.2,
  slow: 0.3,
  slowest: 0.5,
} as const;

export const EASE = {
  linear: 'linear',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  spring: {
    type: 'spring',
    stiffness: 500,
    damping: 30,
  },
} as const;

export const FADE_IN = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: DURATION.base, ease: EASE.easeInOut },
};

export const SLIDE_UP = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: { duration: DURATION.base, ease: EASE.easeInOut },
};

export const ANIMATIONS = {
  duration: DURATION,
  ease: EASE,
  variants: {
    fadeIn: FADE_IN,
    slideUp: SLIDE_UP,
  },
};
