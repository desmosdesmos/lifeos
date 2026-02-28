import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  large?: boolean;
}

export function Card({ children, className, onClick, large }: CardProps) {
  return (
    <div
      className={clsx(
        large ? 'rounded-[20px] p-5' : 'rounded-[12px] p-4',
        'bg-ios-card',
        onClick && 'active:opacity-70 cursor-pointer transition-opacity',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className,
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-[12px] transition-all active:scale-[0.98]';
  
  const variantStyles = {
    primary: 'bg-ios-primary text-white',
    secondary: 'bg-ios-card-secondary text-white',
    danger: 'bg-ios-red text-white',
    ghost: 'bg-transparent text-ios-primary',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-[15px]',
    md: 'px-5 py-3 text-[17px]',
    lg: 'px-6 py-4 text-[18px]',
  };

  return (
    <button
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        disabled && 'opacity-50 active:scale-100 cursor-not-allowed',
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

interface InputProps {
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  label?: string;
  className?: string;
}

export function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  label,
  className,
}: InputProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-ios-gray text-[13px] mb-1.5 ml-1">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-ios-card-secondary rounded-[10px] px-4 py-3 text-[17px] text-white placeholder-ios-gray focus:outline-none focus:bg-[#3C3C3E] transition-colors"
      />
    </div>
  );
}

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
}

export function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  showValue = true,
  className,
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-2">
        {label && <label className="text-[17px] font-medium">{label}</label>}
        {showValue && (
          <span className="text-ios-primary font-semibold text-[17px]">
            {value}
          </span>
        )}
      </div>
      <div className="relative h-7 touch-none">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-[7px] bg-ios-card-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-ios-primary rounded-full transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute w-[28px] h-[28px] bg-white rounded-full shadow-lg pointer-events-none transition-all"
          style={{
            left: `calc(${percentage}% - 14px)`,
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        />
      </div>
    </div>
  );
}

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
  className?: string;
}

export function Toggle({ enabled, onChange, label, className }: ToggleProps) {
  return (
    <div className={clsx('flex items-center justify-between', className)}>
      {label && <span className="text-[17px]">{label}</span>}
      <div
        className={clsx(
          'w-[51px] h-[31px] rounded-[31px] cursor-pointer transition-colors relative',
          enabled ? 'bg-ios-green' : 'bg-ios-gray'
        )}
        onClick={() => onChange(!enabled)}
      >
        <div
          className={clsx(
            'absolute top-[2px] w-[27px] h-[27px] bg-white rounded-full shadow transition-transform',
            enabled ? 'translate-x-[20px]' : 'translate-x-[2px]'
          )}
        />
      </div>
    </div>
  );
}

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'primary';
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  color = 'primary',
  showLabel = true,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const colorStyles = {
    green: 'bg-ios-green',
    yellow: 'bg-ios-yellow',
    red: 'bg-ios-red',
    blue: 'bg-ios-blue',
    primary: 'bg-ios-primary',
  };

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between text-[13px] text-ios-gray mb-1">
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="w-full h-[8px] bg-ios-card-secondary rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all', colorStyles[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface SphereIconProps {
  sphere: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SphereIcon({ sphere, size = 'md', className }: SphereIconProps) {
  const icons: Record<string, string> = {
    sleep: '😴',
    water: '💧',
    nutrition: '🍎',
    fitness: '💪',
    work: '💼',
    finance: '💰',
    mood: '😊',
    selfDevelopment: '📚',
    personalLife: '❤️',
  };

  const sizeStyles = {
    sm: 'text-[20px]',
    md: 'text-[28px]',
    lg: 'text-[36px]',
  };

  return (
    <span className={clsx(sizeStyles[size], className)}>
      {icons[sphere] || '📊'}
    </span>
  );
}

interface StatusBadgeProps {
  status: 'critical' | 'warning' | 'good' | 'excellent';
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  const colorStyles = {
    critical: 'bg-ios-red/20 text-ios-red',
    warning: 'bg-ios-yellow/20 text-ios-yellow',
    good: 'bg-ios-green/20 text-ios-green',
    excellent: 'bg-ios-blue/20 text-ios-blue',
  };

  return (
    <span
      className={clsx(
        'px-2.5 py-1 rounded-full text-[13px] font-medium',
        colorStyles[status],
        className
      )}
    >
      {children}
    </span>
  );
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={clsx('flex justify-center items-center', className)}>
      <div
        className={clsx(
          'border-2 border-ios-card-secondary border-t-ios-primary rounded-full animate-spin',
          sizeStyles[size]
        )}
      />
    </div>
  );
}

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={clsx('flex flex-col items-center justify-center py-12 px-6 text-center', className)}>
      <span className="text-[64px] mb-4">{icon}</span>
      <h3 className="text-[20px] font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-ios-gray text-[15px] mb-4 max-w-[280px]">{description}</p>
      )}
      {action}
    </div>
  );
}
