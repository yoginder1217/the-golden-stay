import React from 'react';
import { motion } from 'framer-motion';

const FadeIn = ({ children, delay = 0 }) => {
  // Ensure motion is used clearly
  const MotionDiv = motion.div;

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: delay }}
    >
      {children}
    </MotionDiv>
  );
};

export default FadeIn;