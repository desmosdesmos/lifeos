import React from 'react';
import clsx from 'clsx';

interface LifeScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  className?: string;
}

export function LifeScoreRing({
  score,
  size = 'lg',
  showLabel = true,
  className,
}: LifeScoreRingProps) {
  const normalizedScore = Math.min(100, Math.max(0, score));
  
  const sizeConfig = {
    sm: { dimension: 60, stroke: 4, fontSize: 16 },
    md: { dimension: 100, stroke: 6, fontSize: 24 },
    lg: { dimension: 160, stroke: 8, fontSize: 36 },
    xl: { dimension: 240, stroke: 12, fontSize: 56 },
  };

  const { dimension, stroke, fontSize } = sizeConfig[size];
  const radius = (dimension - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (normalizedScore / 100) * circumference;

  const getColor = (score: number) => {
    if (score >= 80) return '#30D158';
    if (score >= 60) return '#FFD60A';
    if (score >= 40) return '#FF9500';
    return '#FF453A';
  };

  const color = getColor(normalizedScore);

  return (
    <div className={clsx('flex flex-col items-center', className)}>
      <div className="relative" style={{ width: dimension, height: dimension }}>
        <svg className="transform -rotate-90" width={dimension} height={dimension}>
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke="#2C2C2E"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-bold" style={{ fontSize, color }}>
              {Math.round(normalizedScore)}
            </span>
          </div>
        )}
      </div>
      {showLabel && (
        <span className="text-ios-gray text-[15px] mt-2">LifeScore</span>
      )}
    </div>
  );
}
