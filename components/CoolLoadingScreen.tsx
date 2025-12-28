"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";

interface CoolLoadingScreenProps {
  onComplete: () => void;
}

export default function CoolLoadingScreen({ onComplete }: CoolLoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [loadingText, setLoadingText] = useState("در حال بارگذاری");

  useEffect(() => {
    // Start progress from 0
    setProgress(0);
    
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        // Smooth increment to reach 100 in ~2.5 seconds
        const increment = Math.random() * 8 + 4;
        const newProgress = Math.min(prev + increment, 100);
        
        // Update loading text based on progress
        if (newProgress < 50) {
          setLoadingText("در حال بارگذاری");
        } else {
          setLoadingText("در حال آماده‌سازی");
        }
        
        return newProgress;
      });
    }, 80);

    // Complete after 2.5 seconds and ensure progress reaches 100
    const completeTimer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsComplete(true);
        setTimeout(() => {
          onComplete();
        }, 500);
      }, 200);
    }, 2500);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  // Logo letters
  const logoLetters = ["B", "a", "z", "a", "a", "r", " ", "C", "h", "i"];

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.5, ease: "easeInOut" }
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800"
          dir="ltr"
        >
          <div className="flex flex-col items-center space-y-6 px-4">
            {/* Logo Animation */}
            <motion.div 
              className="flex items-center justify-center" 
              dir="ltr"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {logoLetters.map((letter, index) => (
                <motion.span
                  key={index}
                  initial={{ 
                    opacity: 0, 
                    y: 20,
                    scale: 0.5,
                  }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    scale: 1,
                  }}
                  transition={{
                    delay: index * 0.08,
                    duration: 0.5,
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  }}
                  whileHover={{
                    scale: 1.1,
                    y: -5,
                  }}
                  className="text-3xl md:text-4xl font-bold tracking-tight cursor-default"
                  style={{
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Inter', 'Helvetica Neue', sans-serif",
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    textShadow: "0 0 30px rgba(59, 130, 246, 0.3)",
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </motion.div>

            {/* Shopping Cart Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center space-y-3"
            >
              <motion.div
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <ShoppingCart 
                  className="w-8 h-8 md:w-10 md:h-10 text-blue-600 dark:text-blue-400" 
                  strokeWidth={1.5}
                />
              </motion.div>
              
              {/* Loading Text */}
              <motion.div
                key={loadingText}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <span className="text-sm md:text-base text-slate-700 dark:text-slate-300 font-medium">
                  {loadingText}
                </span>
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="inline-block ml-1"
                >
                  ...
                </motion.span>
              </motion.div>
            </motion.div>

            {/* Progress Bar */}
            <div className="w-full max-w-xs space-y-2">
              <div className="relative h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                />
              </div>
              {/* Percentage */}
              <div className="text-center">
                <motion.span
                  key={Math.floor(progress)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs text-slate-600 dark:text-slate-400 font-medium"
                >
                  {Math.floor(progress)}%
                </motion.span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
