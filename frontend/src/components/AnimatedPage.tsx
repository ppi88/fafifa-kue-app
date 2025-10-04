import { motion } from "framer-motion";
import React from 'react';

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

const transition = {
  type: "tween",
  duration: 0.35,
  ease: [0.25, 0.8, 0.25, 1],
};

interface AnimatedPageProps {
  children: React.ReactNode;
  direction: number;
}

const AnimatedPage: React.FC<AnimatedPageProps> = ({ children, direction }) => {
  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={transition}
      style={{ willChange: 'transform' }}
      className="absolute top-0 left-0 w-full h-full"
    >
      {children}
    </motion.div>
  );
};

export default AnimatedPage;