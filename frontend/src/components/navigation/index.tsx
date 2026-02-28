import React from 'react';
import clsx from 'clsx';

interface TabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

export function TabBar({ activeTab, onTabChange, className }: TabBarProps) {
  const tabs = [
    { id: 'dashboard', icon: '🏠', label: 'Главная' },
    { id: 'tracking', icon: '📊', label: 'Трекинг' },
    { id: 'goals', icon: '🎯', label: 'Цели' },
    { id: 'tasks', icon: '✅', label: 'Задачи' },
    { id: 'analytics', icon: '📈', label: 'Аналитика' },
  ];

  return (
    <nav
      className={clsx(
        'fixed bottom-0 left-0 right-0 safe-bottom',
        'bg-ios-card/95 backdrop-blur-lg border-t border-ios-separator',
        'z-50',
        className
      )}
    >
      <div className="flex justify-around items-center py-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={clsx(
              'flex flex-col items-center py-2 px-3 min-w-[64px]',
              'active:opacity-70 transition-opacity'
            )}
          >
            <span className="text-[24px] mb-0.5">{tab.icon}</span>
            <span
              className={clsx(
                'text-[11px] font-medium',
                activeTab === tab.id ? 'text-ios-primary' : 'text-ios-gray'
              )}
            >
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <div className="w-1 h-1 bg-ios-primary rounded-full mt-1" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  className?: string;
}

export function Header({
  title,
  subtitle,
  onBack,
  rightAction,
  className,
}: HeaderProps) {
  return (
    <header
      className={clsx(
        'sticky top-0 z-40',
        'bg-ios-bg/95 backdrop-blur-lg border-b border-ios-separator',
        'safe-top',
        className
      )}
    >
      <div className="flex items-center justify-between h-[56px] px-4">
        {/* Back button */}
        <div className="w-10">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center text-ios-primary active:opacity-70"
            >
              <span className="text-[28px]">‹</span>
            </button>
          )}
        </div>

        {/* Title */}
        <div className="flex-1 text-center">
          <h1 className="text-[17px] font-semibold">{title}</h1>
          {subtitle && (
            <p className="text-[12px] text-ios-gray -mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Right action */}
        <div className="w-10 flex justify-end">
          {rightAction}
        </div>
      </div>
    </header>
  );
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div
        className={clsx(
          'relative w-full sm:max-w-md sm:mx-4',
          'bg-ios-card rounded-t-[20px] sm:rounded-[20px]',
          'max-h-[90vh] overflow-y-auto',
          'animate-slide-up',
          className
        )}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-ios-separator bg-ios-card">
          <h2 className="text-[18px] font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-ios-card-secondary active:opacity-70"
          >
            <span className="text-[20px]">×</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="sticky bottom-0 p-4 border-t border-ios-separator bg-ios-card">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  actions: {
    label: string;
    onClick: () => void;
    style?: 'default' | 'destructive' | 'cancel';
  }[];
}

export function ActionSheet({ isOpen, onClose, title, actions }: ActionSheetProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Actions */}
      <div className="relative w-full max-w-md mx-4 mb-4 animate-slide-up">
        {/* Title */}
        <div className="bg-ios-card rounded-t-[12px] p-4 text-center border-b border-ios-separator">
          <span className="text-[13px] text-ios-gray font-medium">{title}</span>
        </div>

        {/* Action buttons */}
        <div className="bg-ios-card rounded-b-[12px] overflow-hidden">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick();
                onClose();
              }}
              className={`w-full py-3.5 text-[17px] font-medium border-b border-ios-separator last:border-0 active:bg-ios-card-secondary transition-colors ${
                action.style === 'destructive' ? 'text-ios-red' : 'text-ios-primary'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
