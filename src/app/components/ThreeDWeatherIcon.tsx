import React from 'react';
import { motion, Variants } from 'framer-motion';

interface ThreeDWeatherIconProps {
  iconCode: string;
  className?: string;
  animate?: boolean;
}

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
      y: [0, -4, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const renderIcon = () => {
    // Shared definitions for the "smoothy & friendly" look
    const defs = (
      <defs>
        {/* Ultra-soft Sun Gradient */}
        <radialGradient id="sunFriendly" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fff1b8" />
          <stop offset="50%" stopColor="#ffca28" />
          <stop offset="100%" stopColor="#ff8f00" />
        </radialGradient>
        
        {/* Soft Glassy Cloud */}
        <linearGradient id="cloudFriendly" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f0f7ff" />
        </linearGradient>

        {/* Soft Moon Gradient */}
        <linearGradient id="moonFriendly" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="100%" stopColor="#7dd3fc" />
        </linearGradient>

        {/* Diffused Outer Glow */}
        <filter id="diffusedGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Subtle Inner Highlight */}
        <filter id="innerHighlight" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feOffset dx="1" dy="1" />
          <feComposite in="SourceGraphic" in2="blur" operator="out" />
        </filter>
      </defs>
    );

    switch (code) {
      case '01': // Clear
      case '02': // Few clouds (at night)
      case '03': // Scattered (at night)
      case '04': // Broken (at night)
        if (isNight) {
          return (
            <g>
              {defs}
              <g filter="url(#diffusedGlow)">
                {/* Smooth crescent moon shape */}
                <path 
                  d="M12 4a8 8 0 0 0 0 16 8 8 0 0 1 0-16z" 
                  fill="url(#moonFriendly)" 
                  transform="rotate(-15 12 12)"
                />
                <circle cx="12" cy="12" r="8" fill="none" stroke="white" strokeWidth="0.5" opacity="0.2" />
              </g>
              {/* Little twinkling stars */}
              <motion.circle cx="18" cy="6" r="0.5" fill="white" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 3, repeat: Infinity }} />
              <motion.circle cx="6" cy="18" r="0.5" fill="white" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 3, repeat: Infinity, delay: 1.5 }} />
            </g>
          );
        }
        if (code === '01') {
          return (
            <g>
              {defs}
              <g filter="url(#diffusedGlow)">
                <motion.circle 
                  cx="12" cy="12" r="8" 
                  fill="url(#sunFriendly)"
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <circle cx="12" cy="12" r="8" fill="none" stroke="white" strokeWidth="0.5" opacity="0.4" />
              </g>
            </g>
          );
        }
        // fall through to cloud cases for daytime 02, 03, 04

      case '02': 
      case '03': 
      case '04': 
        return (
          <g>
            {defs}
            {!isNight && code === '02' && (
              <circle cx="16" cy="8" r="5" fill="url(#sunFriendly)" filter="url(#diffusedGlow)" />
            )}
            <g filter="url(#diffusedGlow)">
              <path 
                d="M17.5 19c2.5 0 4.5-2 4.5-4.5S20 10 17.5 10c-.2 0-.4 0-.6.1C15.8 7.6 13.1 6 10 6 6.1 6 3 9.1 3 13c0 .1 0 .2 0 .3C1.2 14.1 0 15.9 0 18c0 2.2 1.8 4 4 4h13.5z" 
                fill="url(#cloudFriendly)"
              />
              <path 
                d="M17.5 19c2.5 0 4.5-2 4.5-4.5S20 10 17.5 10c-.2 0-.4 0-.6.1C15.8 7.6 13.1 6 10 6 6.1 6 3 9.1 3 13c0 .1 0 .2 0 .3C1.2 14.1 0 15.9 0 18c0 2.2 1.8 4 4 4h13.5z" 
                fill="none" stroke="white" strokeWidth="1" opacity="0.5"
              />
            </g>
          </g>
        );

      case '09': // Rain
      case '10': // Rain
        return (
          <g>
            {defs}
            <g filter="url(#diffusedGlow)">
              <path 
                d="M17.5 15c2.5 0 4.5-2 4.5-4.5S20 6 17.5 6c-.2 0-.4 0-.6.1C15.8 3.6 13.1 2 10 2 6.1 2 3 5.1 3 9c0 .1 0 .2 0 .3C1.2 10.1 0 11.9 0 14c0 2.2 1.8 4 4 4h13.5z" 
                fill="#cbd5e1"
              />
            </g>
            {[1, 2, 3].map((i) => (
              <motion.rect
                key={i}
                x={6 + i * 4}
                y="18"
                width="2"
                height="5"
                rx="1"
                fill="#38bdf8"
                animate={{
                  y: [0, 6, 0],
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
            <g filter="url(#diffusedGlow)">
              <path 
                d="M17.5 15c2.5 0 4.5-2 4.5-4.5S20 6 17.5 6c-.2 0-.4 0-.6.1C15.8 3.6 13.1 2 10 2 6.1 2 3 5.1 3 9c0 .1 0 .2 0 .3C1.2 10.1 0 11.9 0 14c0 2.2 1.8 4 4 4h13.5z" 
                fill="#475569"
              />
            </g>
            <motion.path
              d="M10 16l-1 3h2l-1 3"
              stroke="#ffca28"
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
            <g filter="url(#diffusedGlow)">
              <path 
                d="M17.5 15c2.5 0 4.5-2 4.5-4.5S20 6 17.5 6c-.2 0-.4 0-.6.1C15.8 3.6 13.1 2 10 2 6.1 2 3 5.1 3 9c0 .1 0 .2 0 .3C1.2 10.1 0 11.9 0 14c0 2.2 1.8 4 4 4h13.5z" 
                fill="url(#cloudFriendly)"
              />
            </g>
            {[1, 2, 3].map((i) => (
              <motion.circle
                key={i}
                cx={6 + i * 4}
                cy="20"
                r="1.5"
                fill="white"
                animate={{
                  y: [0, 5],
                  opacity: [0.2, 1, 0.2],
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
            <g filter="url(#diffusedGlow)">
              <circle cx="12" cy="12" r="8" fill="url(#cloudFriendly)" />
            </g>
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
