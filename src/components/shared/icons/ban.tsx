"use client";

import type { Variants } from "motion/react";
import { motion } from "motion/react";
import { createAnimatedIcon } from "./animated-icon";

const circleVariants: Variants = {
  normal: {
    opacity: 1,
    pathLength: 1,
    transition: {
      duration: 0.3,
      opacity: { duration: 0.1 },
    },
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    transition: {
      duration: 0.4,
      opacity: { duration: 0.1 },
    },
  },
};

const lineVariants: Variants = {
  normal: {
    opacity: 1,
    pathLength: 1,
    transition: {
      duration: 0.3,
      opacity: { duration: 0.1 },
    },
  },
  slash: () => ({
    opacity: [0, 1],
    pathLength: [0, 1],
    transition: {
      duration: 0.4,
      opacity: { duration: 0.1 },
    },
  }),
};

const BanIcon = createAnimatedIcon({
  paths: (controls) => (
    <>
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        variants={circleVariants}
        initial="normal"
        animate={controls}
      />
      <motion.path
        d="m4.9 4.9 14.2 14.2"
        variants={lineVariants}
        initial="normal"
        animate={controls}
      />
    </>
  ),
});

export { BanIcon };
