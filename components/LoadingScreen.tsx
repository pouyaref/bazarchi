"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    // Complete after 2.5 seconds
    const completeTimer = setTimeout(() => {
      setIsComplete(true);
      setProgress(100);
      setTimeout(() => {
        onComplete();
      }, 500); // Wait for fade-out animation
    }, 2500);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                rotate: [90, 0, 90],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-white/10 to-transparent rounded-full blur-3xl"
            />
          </div>

          {/* Main content */}
          <div className="relative z-10 flex flex-col items-center justify-center space-y-8 px-4">
            {/* Logo/Text Animation */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="text-center"
            >
              <motion.h1
                className="text-6xl md:text-8xl font-bold text-white mb-4"
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  textShadow: "0 4px 20px rgba(0,0,0,0.3)",
                }}
              >
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  بازار
                </motion.span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-white/90 text-lg md:text-xl font-medium"
              >
                Bazaar
              </motion.p>
            </motion.div>

            {/* Progress Bar Container */}
            <div className="w-full max-w-md space-y-3">
              {/* Progress Bar */}
              <div className="relative h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-white via-white/90 to-white rounded-full shadow-lg"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </motion.div>
              </div>

              {/* Progress Percentage */}
              <motion.div
                key={Math.floor(progress)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <span className="text-white/80 text-sm font-medium">
                  {Math.floor(progress)}%
                </span>
              </motion.div>
            </div>

            {/* Loading Dots Animation */}
            <div className="flex space-x-2">
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className="w-3 h-3 bg-white rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: index * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


