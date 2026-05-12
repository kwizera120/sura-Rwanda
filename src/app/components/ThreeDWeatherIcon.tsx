import React from 'react';
import { motion } from 'framer-motion';

interface ThreeDWeatherIconProps {
  iconCode: string;
  className?: string;
  animate?: boolean;
}

export const ThreeDWeatherIcon: React.FC<ThreeDWeatherIconProps> = ({ iconCode, className = "w-10 h-10", animate = true }) => {
  const isNight = iconCode.endsWith('n');
  const code = iconCode.slice(0, 2);

  const containerVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const floatVariants = animate ? {
    animate: {
      y: [0, -4, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  } : {};

  const renderIcon = () => {
    switch (code) {
      case '01': // Clear sky
        return isNight ? (
          <g>
            <defs>
              <linearGradient id="moonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
              <filter id="moonGlow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <circle cx="12" cy="12" r="8" fill="url(#moonGradient)" filter="url(#moonGlow)" />
            <path d="M12 4a8 8 0 0 0 0 16 8 8 0 0 1 0-16z" fill="#cbd5e1" opacity="0.5" />
          </g>
        ) : (
          <g>
            <defs>
              <radialGradient id="sunGradient">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </radialGradient>
              <filter id="sunGlow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <circle cx="12" cy="12" r="8" fill="url(#sunGradient)" filter="url(#sunGlow)" />
            {animate && (
              <motion.circle
                cx="12" cy="12" r="10"
                stroke="#fbbf24"
                strokeWidth="0.5"
                strokeDasharray="2 4"
                fill="none"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
            )}
          </g>
        );

      case '02': // Few clouds
      case '03': // Scattered
      case '04': // Broken
        return (
          <g>
            {defs}
            {code === '02' && (
              isNight ? (
                <g filter="url(#softGlow)">
                  <circle cx="16" cy="8" r="5" fill="url(#moonSmooth)" />
                  <circle cx="18" cy="6" r="5" fill="currentColor" className="text-slate-900" />
                </g>
              ) : (
                <circle cx="16" cy="8" r="5" fill="url(#sunSmooth)" filter="url(#softGlow)" />
              )
            )}
            <path 
              d="M17.5 19c2.5 0 4.5-2 4.5-4.5S20 10 17.5 10c-.2 0-.4 0-.6.1C15.8 7.6 13.1 6 10 6 6.1 6 3 9.1 3 13c0 .1 0 .2 0 .3C1.2 14.1 0 15.9 0 18c0 2.2 1.8 4 4 4h13.5z" 
              fill="url(#cloudSmooth)"
              filter="url(#softGlow)"
            />
            <path 
              d="M17.5 19c2.5 0 4.5-2 4.5-4.5S20 10 17.5 10c-.2 0-.4 0-.6.1C15.8 7.6 13.1 6 10 6 6.1 6 3 9.1 3 13c0 .1 0 .2 0 .3C1.2 14.1 0 15.9 0 18c0 2.2 1.8 4 4 4h13.5z" 
              fill="none" stroke="white" strokeWidth="0.5" opacity="0.4"
            />
          </g>
        );

      case '09': // Shower rain
      case '10': // Rain
        return (
          <g>
            <defs>
              <linearGradient id="rainCloudGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
            </defs>
            <path 
              d="M17.5 15c2.5 0 4.5-2 4.5-4.5S20 6 17.5 6c-.2 0-.4 0-.6.1C15.8 3.6 13.1 2 10 2 6.1 2 3 5.1 3 9c0 .1 0 .2 0 .3C1.2 10.1 0 11.9 0 14c0 2.2 1.8 4 4 4h13.5z" 
              fill="url(#rainCloudGradient)" 
            />
            {[1, 2, 3].map((i) => (
              <motion.path
                key={i}
                d={`M${6 + i * 4} 19 v3`}
                stroke="#60a5fa"
                strokeWidth="2"
                strokeLinecap="round"
                animate={animate ? {
                  y: [0, 5, 0],
                  opacity: [0, 1, 0]
                } : {}}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "linear"
                }}
              />
            ))}
          </g>
        );

      case '11': // Thunderstorm
        return (
          <g>
            <path 
              d="M17.5 15c2.5 0 4.5-2 4.5-4.5S20 6 17.5 6c-.2 0-.4 0-.6.1C15.8 3.6 13.1 2 10 2 6.1 2 3 5.1 3 9c0 .1 0 .2 0 .3C1.2 10.1 0 11.9 0 14c0 2.2 1.8 4 4 4h13.5z" 
              fill="#334155" 
            />
            <motion.path
              d="M10 17l-2 4h3l-2 4"
              stroke="#fbbf24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              animate={animate ? {
                opacity: [0, 1, 0, 1, 0]
              } : {}}
              transition={{
                duration: 2,
                repeat: Infinity,
                times: [0, 0.1, 0.2, 0.3, 1]
              }}
            />
          </g>
        );

      case '13': // Snow
        return (
          <g>
            <path 
              d="M17.5 15c2.5 0 4.5-2 4.5-4.5S20 6 17.5 6c-.2 0-.4 0-.6.1C15.8 3.6 13.1 2 10 2 6.1 2 3 5.1 3 9c0 .1 0 .2 0 .3C1.2 10.1 0 11.9 0 14c0 2.2 1.8 4 4 4h13.5z" 
              fill="url(#cloudGradient)" 
            />
            {[1, 2, 3].map((i) => (
              <motion.circle
                key={i}
                cx={6 + i * 4}
                cy="20"
                r="1.5"
                fill="white"
                animate={animate ? {
                  y: [0, 5],
                  opacity: [0, 1, 0],
                  x: [0, (i % 2 === 0 ? 2 : -2)]
                } : {}}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "linear"
                }}
              />
            ))}
          </g>
        );

      case '50': // Mist
        return (
          <g>
            {[1, 2, 3].map((i) => (
              <motion.path
                key={i}
                d={`M${4} ${8 + i * 4} h16`}
                stroke="#e2e8f0"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.6"
                animate={animate ? {
                  x: [-2, 2, -2]
                } : {}}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut"
                }}
              />
            ))}
          </g>
        );

      default:
        return (
          <circle cx="12" cy="12" r="8" fill="#e2e8f0" />
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
      <motion.g variants={floatVariants} animate="animate">
        {renderIcon()}
      </motion.g>
    </motion.svg>
  );
};
