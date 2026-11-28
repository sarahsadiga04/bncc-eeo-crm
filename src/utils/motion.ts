import type {Transition, Variants} from 'motion/react';

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export const MODAL_TRANSITION: Transition = {
  duration: 0.24,
  ease: EASE_OUT_EXPO,
};

export const modalBackdropVariants: Variants = {
  hidden: {opacity: 0},
  visible: {
    opacity: 1,
    transition: {duration: 0.2, ease: 'easeOut'},
  },
  exit: {
    opacity: 0,
    transition: {duration: 0.16, ease: 'easeIn'},
  },
};

export const modalPanelVariants: Variants = {
  hidden: {opacity: 0, scale: 0.96, y: 16},
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {duration: 0.24, ease: EASE_OUT_EXPO},
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 10,
    transition: {duration: 0.15, ease: 'easeIn'},
  },
};

export const drawerBackdropVariants: Variants = {
  hidden: {opacity: 0},
  visible: {opacity: 1, transition: {duration: 0.2}},
  exit: {opacity: 0, transition: {duration: 0.18}},
};

export const drawerPanelVariants: Variants = {
  hidden: {x: '-100%'},
  visible: {
    x: 0,
    transition: {type: 'spring', stiffness: 380, damping: 36},
  },
  exit: {
    x: '-100%',
    transition: {duration: 0.2, ease: 'easeIn'},
  },
};

export const staggerContainerVariants: Variants = {
  hidden: {opacity: 0},
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.03,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: {opacity: 0, y: 12},
  visible: {
    opacity: 1,
    y: 0,
    transition: {duration: 0.28, ease: EASE_OUT_EXPO},
  },
};

export const alertVariants: Variants = {
  hidden: {opacity: 0, y: -6, scale: 0.99},
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {duration: 0.2, ease: 'easeOut'},
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {duration: 0.14, ease: 'easeIn'},
  },
};
