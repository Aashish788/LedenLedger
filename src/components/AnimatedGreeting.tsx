/**
 * AnimatedGreeting Component
 * Premium typewriter effect with character-by-character animation
 * Industry-standard UX implementation
 * 
 * @module AnimatedGreeting
 */

import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";

interface AnimatedGreetingProps {
  text: string;
  className?: string;
  typingSpeed?: number; // milliseconds per character
  showCursor?: boolean;
}

export function AnimatedGreeting({ 
  text, 
  className = "",
  typingSpeed = 50,
  showCursor = true 
}: AnimatedGreetingProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const controls = useAnimation();

  // Reset and start typing when text changes
  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
    setIsComplete(false);
    controls.start({ opacity: 1 });
  }, [text, controls]);

  // Typewriter effect
  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, typingSpeed);

      return () => clearTimeout(timeout);
    } else if (currentIndex === text.length && text.length > 0) {
      setIsComplete(true);
    }
  }, [currentIndex, text, typingSpeed]);

  return (
    <motion.h1
      className={`${className} relative inline-block`}
      initial={{ opacity: 0 }}
      animate={controls}
      aria-label={text}
    >
      {/* Typed text with smooth appearance */}
      <span className="relative">
        {displayedText.split("").map((char, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
            className="inline-block"
            style={{
              whiteSpace: char === " " ? "pre" : "normal",
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </span>
      
      {/* Animated cursor */}
      {showCursor && (
        <motion.span
          className="inline-block w-0.5 h-[0.9em] bg-current ml-0.5 align-middle"
          animate={{
            opacity: isComplete ? [1, 0] : 1,
          }}
          transition={{
            duration: 0.5,
            repeat: isComplete ? Infinity : 0,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          style={{
            display: currentIndex === 0 ? "none" : "inline-block",
          }}
        />
      )}
    </motion.h1>
  );
}

/**
 * Alternative: Stagger animation (characters appear one by one with spring effect)
 * For a more dynamic feel - uncomment to use
 */
export function AnimatedGreetingStagger({ 
  text, 
  className = "",
}: AnimatedGreetingProps) {
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey(prev => prev + 1);
  }, [text]);

  const characters = text.split("");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.1,
      },
    },
  };

  const characterVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 200,
      },
    },
  };

  return (
    <motion.h1
      key={key}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      aria-label={text}
    >
      {characters.map((char, index) => (
        <motion.span
          key={`${index}-${char}`}
          variants={characterVariants}
          className="inline-block"
          style={{
            whiteSpace: char === " " ? "pre" : "normal",
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.h1>
  );
}

/**
 * Alternative: Typing effect animation (like a typewriter)
 * Uncomment to use this style instead
 */
export function AnimatedGreetingTyping({ text, className = "" }: AnimatedGreetingProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Reset when text changes
    setDisplayedText("");
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 50); // Speed of typing

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return (
    <motion.h1
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {displayedText}
      {currentIndex < text.length && (
        <motion.span
          className="inline-block w-0.5 h-6 bg-current ml-1"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        />
      )}
    </motion.h1>
  );
}

/**
 * Alternative: Wave animation (characters wave in sequence)
 */
export function AnimatedGreetingWave({ text, className = "" }: AnimatedGreetingProps) {
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey(prev => prev + 1);
  }, [text]);

  const characters = text.split("");

  return (
    <motion.h1
      key={key}
      className={className}
      initial="hidden"
      animate="visible"
    >
      {characters.map((char, index) => (
        <motion.span
          key={`${index}-${char}`}
          className="inline-block"
          initial={{
            opacity: 0,
            y: 50,
            rotateX: 90,
          }}
          animate={{
            opacity: 1,
            y: 0,
            rotateX: 0,
          }}
          transition={{
            type: "spring" as const,
            damping: 15,
            stiffness: 150,
            delay: index * 0.04,
          }}
          style={{
            whiteSpace: char === " " ? "pre" : "normal",
            transformStyle: "preserve-3d",
            perspective: "1000px",
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.h1>
  );
}

/**
 * Alternative: Fade and slide animation (smooth and elegant)
 */
export function AnimatedGreetingFadeSlide({ text, className = "" }: AnimatedGreetingProps) {
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey(prev => prev + 1);
  }, [text]);

  const characters = text.split("");

  return (
    <motion.h1
      key={key}
      className={className}
      initial="hidden"
      animate="visible"
    >
      {characters.map((char, index) => (
        <motion.span
          key={`${index}-${char}`}
          className="inline-block"
          initial={{
            opacity: 0,
            x: -20,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.5,
            delay: index * 0.025,
            ease: [0.25, 0.1, 0.25, 1], // Cubic bezier for smooth easing
          }}
          style={{
            whiteSpace: char === " " ? "pre" : "normal",
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.h1>
  );
}
