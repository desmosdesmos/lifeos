import React from 'react';
import clsx from 'clsx';

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
      <div className={clsx('w-12 h-12 rounded-full flex items-center justify-center text-[24px]', statusBgColors[status])}>
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="font-medium text-[15px] truncate">{name}</span>
          <span className="text-[13px] text-ios-gray">{Math.round(percentage)}%</span>
        </div>

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

        <div className="flex justify-between mt-1">
          <span className="text-[12px] text-ios-gray">{value}</span>
          <span className="text-[12px] text-ios-gray">цель: {target}</span>
        </div>
      </div>
    </div>
  );
}
