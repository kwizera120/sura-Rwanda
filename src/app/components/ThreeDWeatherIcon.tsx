import React from 'react';
import { motion, Variants } from 'framer-motion';

interface ThreeDWeatherIconProps {
  iconCode: string;
  className?: string;
  animate?: boolean;
}

/**
 * A professional, smooth, and user-friendly 3D weather icon component.
 * Uses soft gradients and diffused glows for a premium "glassy" feel.
 */
export const ThreeDWeatherIcon: React.FC<ThreeDWeatherIconProps> = ({ iconCode, className = "w-10 h-10", animate = true }) => {
  const isNight = iconCode.endsWith('n');
  const code = iconCode.slice(0, 2);

  const containerVariants: Variants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const floatVariants: Variants = {
    animate: {
      y: [0, -3, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const renderIcon = () => {
    const defs = (
      <defs>
        {/* Soft Sun Glow */}
        <radialGradient id="gradSun" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFF9C4" />
          <stop offset="40%" stopColor="#FFD54F" />
          <stop offset="100%" stopColor="#F57C00" />
        </radialGradient>
        
        {/* Soft Glassy Cloud */}
        <linearGradient id="gradCloud" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E3F2FD" />
        </linearGradient>

        {/* Soft Professional Moon (Night) */}
        <linearGradient id="gradMoon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E0F7FA" />
          <stop offset="100%" stopColor="#4FC3F7" />
        </linearGradient>

        {/* Diffused Outer Glow Filter */}
        <filter id="filterGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Star Sparkle Gradient */}
        <radialGradient id="gradStar">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
    );

    // NIGHT LOGIC: Always return the professional smooth moon
    if (isNight) {
      return (
        <g>
          {defs}
          <g filter="url(#filterGlow)">
            {/* Smooth, high-fidelity crescent moon */}
            <path 
              d="M11 3C6.6 3 3 6.6 3 11C3 15.4 6.6 19 11 19C12.4 19 13.7 18.6 14.8 18C13.1 17.4 12 15.8 12 14C12 11.2 14.2 9 17 9C17.7 9 18.4 9.1 19 9.4C18.4 5.7 15 3 11 3Z" 
              fill="url(#gradMoon)"
              transform="translate(2, 2)"
            />
          </g>
          {/* Twinkling ambient stars */}
          <motion.circle cx="18" cy="6" r="1.2" fill="url(#gradStar)" animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 3, repeat: Infinity }} />
          <motion.circle cx="6" cy="16" r="0.8" fill="url(#gradStar)" animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 3, repeat: Infinity, delay: 1.5 }} />
        </g>
      );
    }

    // DAY LOGIC
    switch (code) {
      case '01': // Clear
        return (
          <g>
            {defs}
            <g filter="url(#filterGlow)">
              <motion.circle 
                cx="12" cy="12" r="8" 
                fill="url(#gradSun)"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
            </g>
          </g>
        );

      case '02': 
      case '03': 
      case '04': 
        return (
          <g>
            {defs}
            {code === '02' && (
              <circle cx="16" cy="8" r="5" fill="url(#gradSun)" filter="url(#filterGlow)" />
            )}
            <g filter="url(#filterGlow)">
              <path 
                d="M17.5 19c2.5 0 4.5-2 4.5-4.5S20 10 17.5 10c-.2 0-.4 0-.6.1C15.8 7.6 13.1 6 10 6 6.1 6 3 9.1 3 13c0 .1 0 .2 0 .3C1.2 14.1 0 15.9 0 18c0 2.2 1.8 4 4 4h13.5z" 
                fill="url(#gradCloud)"
              />
            </g>
          </g>
        );

      case '09': // Rain
      case '10': // Rain
        return (
          <g>
            {defs}
            <g filter="url(#filterGlow)">
              <path 
                d="M17.5 15c2.5 0 4.5-2 4.5-4.5S20 6 17.5 6c-.2 0-.4 0-.6.1C15.8 3.6 13.1 2 10 2 6.1 2 3 5.1 3 9c0 .1 0 .2 0 .3C1.2 10.1 0 11.9 0 14c0 2.2 1.8 4 4 4h13.5z" 
                fill="#B0BEC5"
              />
            </g>
            {[1, 2, 3].map((i) => (
              <motion.rect
                key={i}
                x={6 + i * 4}
                y="17"
                width="2"
                height="5"
                rx="1"
                fill="#4FC3F7"
                animate={{
                  y: [0, 5, 0],
                  opacity: [0.4, 1, 0.4]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeInOut"
                }}
              />
            ))}
          </g>
        );

      case '11': // Storm
        return (
          <g>
            {defs}
            <g filter="url(#filterGlow)">
              <path 
                d="M17.5 15c2.5 0 4.5-2 4.5-4.5S20 6 17.5 6c-.2 0-.4 0-.6.1C15.8 3.6 13.1 2 10 2 6.1 2 3 5.1 3 9c0 .1 0 .2 0 .3C1.2 10.1 0 11.9 0 14c0 2.2 1.8 4 4 4h13.5z" 
                fill="#546E7A"
              />
            </g>
            <motion.path
              d="M11 16l-1 3h2l-1 3"
              stroke="#FFD54F"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              animate={{ opacity: [0, 1, 0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </g>
        );

      case '13': // Snow
        return (
          <g>
            {defs}
            <g filter="url(#filterGlow)">
              <path 
                d="M17.5 15c2.5 0 4.5-2 4.5-4.5S20 6 17.5 6c-.2 0-.4 0-.6.1C15.8 3.6 13.1 2 10 2 6.1 2 3 5.1 3 9c0 .1 0 .2 0 .3C1.2 10.1 0 11.9 0 14c0 2.2 1.8 4 4 4h13.5z" 
                fill="url(#gradCloud)"
              />
            </g>
            {[1, 2, 3].map((i) => (
              <motion.circle
                key={i}
                cx={6 + i * 4}
                cy="19"
                r="1.5"
                fill="white"
                animate={{
                  y: [0, 4],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 0.8,
                  ease: "easeInOut"
                }}
              />
            ))}
          </g>
        );

      default:
        return (
          <g>
            {defs}
            <circle cx="12" cy="12" r="8" fill="url(#gradCloud)" filter="url(#filterGlow)" />
          </g>
        );
    }
  };

  return (
    <motion.svg
      viewBox="0 0 24 24"
      className={className}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <motion.g variants={animate ? floatVariants : undefined} animate={animate ? "animate" : undefined}>
        {renderIcon()}
      </motion.g>
    </motion.svg>
  );
};
