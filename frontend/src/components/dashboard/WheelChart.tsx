import React from 'react';
import clsx from 'clsx';

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
    '#667eea', '#00c6fb', '#f093fb', '#4facfe', '#43e97b',
    '#fa709a', '#a18cd1', '#ff9a9e', '#ffecd2',
  ];

  let currentAngle = -90;

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
        <circle cx={centerX} cy={centerY} r={radius} fill="#1C1C1E" />

        {segments.map((segment, index) => (
          <path
            key={index}
            d={segment.path}
            fill={segment.color}
            opacity="0.8"
            className="transition-opacity hover:opacity-100"
          />
        ))}

        <circle cx={centerX} cy={centerY} r={radius * 0.5} fill="#000000" />

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
