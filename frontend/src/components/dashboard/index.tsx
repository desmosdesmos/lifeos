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

  // Цвет в зависимости от scores
  const getColor = (score: number) => {
    if (score >= 80) return '#30D158'; // green
    if (score >= 60) return '#FFD60A'; // yellow
    if (score >= 40) return '#FF9500'; // orange
    return '#FF453A'; // red
  };

  const color = getColor(normalizedScore);

  return (
    <div className={clsx('flex flex-col items-center', className)}>
      <div
        className="relative"
        style={{ width: dimension, height: dimension }}
      >
        {/* Background ring */}
        <svg
          className="transform -rotate-90"
          width={dimension}
          height={dimension}
        >
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke="#2C2C2E"
            strokeWidth={stroke}
            fill="none"
          />
          {/* Progress ring */}
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
        
        {/* Score label */}
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="font-bold"
              style={{ fontSize, color }}
            >
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

interface SphereCardProps {
  name: string;
  icon: string;
  value: number;
  target: number;
  status: 'critical' | 'warning' | 'good' | 'excellent';
  onClick?: () => void;
  className?: string;
}

export function SphereCard({
  name,
  icon,
  value,
  target,
  status,
  onClick,
  className,
}: SphereCardProps) {
  const percentage = target > 0 ? Math.min(100, (value / target) * 100) : 0;
  
  const statusColors = {
    critical: 'border-ios-red',
    warning: 'border-ios-yellow',
    good: 'border-ios-green',
    excellent: 'border-ios-blue',
  };

  const statusBgColors = {
    critical: 'bg-ios-red/10',
    warning: 'bg-ios-yellow/10',
    good: 'bg-ios-green/10',
    excellent: 'bg-ios-blue/10',
  };

  return (
    <div
      className={clsx(
        'flex items-center gap-3 p-3 rounded-[12px] bg-ios-card',
        onClick && 'active:opacity-70 cursor-pointer',
        statusColors[status],
        'border-2',
        className
      )}
      onClick={onClick}
    >
      {/* Icon */}
      <div
        className={clsx(
          'w-12 h-12 rounded-full flex items-center justify-center text-[24px]',
          statusBgColors[status]
        )}
      >
        {icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="font-medium text-[15px] truncate">{name}</span>
          <span className="text-[13px] text-ios-gray">
            {Math.round(percentage)}%
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-ios-card-secondary rounded-full overflow-hidden">
          <div
            className={clsx(
              'h-full rounded-full transition-all',
              status === 'excellent' && 'bg-ios-blue',
              status === 'good' && 'bg-ios-green',
              status === 'warning' && 'bg-ios-yellow',
              status === 'critical' && 'bg-ios-red'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {/* Values */}
        <div className="flex justify-between mt-1">
          <span className="text-[12px] text-ios-gray">{value}</span>
          <span className="text-[12px] text-ios-gray">цель: {target}</span>
        </div>
      </div>
    </div>
  );
}

interface RecommendationCardProps {
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
  suggestion: string;
  className?: string;
}

export function RecommendationCard({
  severity,
  title,
  message,
  suggestion,
  className,
}: RecommendationCardProps) {
  const severityConfig = {
    INFO: {
      icon: '💡',
      bg: 'bg-ios-blue/10',
      border: 'border-ios-blue/30',
      text: 'text-ios-blue',
    },
    WARNING: {
      icon: '⚠️',
      bg: 'bg-ios-yellow/10',
      border: 'border-ios-yellow/30',
      text: 'text-ios-yellow',
    },
    CRITICAL: {
      icon: '🔴',
      bg: 'bg-ios-red/10',
      border: 'border-ios-red/30',
      text: 'text-ios-red',
    },
  };

  const config = severityConfig[severity];

  return (
    <div
      className={clsx(
        'p-4 rounded-[16px] border',
        config.bg,
        config.border,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-[24px]">{config.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={clsx('font-semibold', config.text)}>
              {title}
            </span>
            <span className={clsx(
              'text-[11px] px-2 py-0.5 rounded-full',
              config.bg,
              config.text
            )}>
              {severity}
            </span>
          </div>
          <p className="text-[15px] text-white/80 mb-2">{message}</p>
          <p className="text-[14px] text-ios-gray">
            <span className="font-medium">💡 Совет:</span> {suggestion}
          </p>
        </div>
      </div>
    </div>
  );
}

interface WheelChartProps {
  data: { name: string; percentage: number }[];
  size?: number;
  className?: string;
}

export function WheelChart({ data, size = 300, className }: WheelChartProps) {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.35;
  
  const colors = [
    '#667eea', // sleep
    '#00c6fb', // water
    '#f093fb', // nutrition
    '#4facfe', // fitness
    '#43e97b', // work
    '#fa709a', // finance
    '#a18cd1', // mood
    '#ff9a9e', // development
    '#ffecd2', // personal
  ];

  let currentAngle = -90; // Start from top

  const segments = data.map((item, index) => {
    const angle = (item.percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    const pathD = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return {
      path: pathD,
      color: colors[index % colors.length],
      name: item.name,
      percentage: item.percentage,
    };
  });

  return (
    <div className={clsx('flex flex-col items-center', className)}>
      <svg width={size} height={size} className="max-w-full">
        {/* Background circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="#1C1C1E"
        />
        
        {/* Segments */}
        {segments.map((segment, index) => (
          <path
            key={index}
            d={segment.path}
            fill={segment.color}
            opacity="0.8"
            className="transition-opacity hover:opacity-100"
          />
        ))}
        
        {/* Center circle (donut effect) */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius * 0.5}
          fill="#000000"
        />
        
        {/* Center text */}
        <text
          x={centerX}
          y={centerY - 5}
          textAnchor="middle"
          fill="white"
          fontSize="14"
          fontWeight="600"
        >
          Баланс
        </text>
        <text
          x={centerX}
          y={centerY + 15}
          textAnchor="middle"
          fill="#8E8E93"
          fontSize="12"
        >
          {Math.round(data.reduce((a, b) => a + b.percentage, 0) / data.length)}%
        </text>
      </svg>
      
      {/* Legend */}
      <div className="grid grid-cols-3 gap-2 mt-4 w-full">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="text-[11px] text-ios-gray">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
