import React from 'react';
import clsx from 'clsx';

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
    <div className={clsx('p-4 rounded-[16px] border', config.bg, config.border, className)}>
      <div className="flex items-start gap-3">
        <span className="text-[24px]">{config.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={clsx('font-semibold', config.text)}>{title}</span>
            <span className={clsx('text-[11px] px-2 py-0.5 rounded-full', config.bg, config.text)}>
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
