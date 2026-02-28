/// <reference types="telegram-web-app-types" />

import { WebApp } from '@telegram-apps/sdk';

class TelegramService {
  private webApp: WebApp | null = null;
  private isInitialized = false;

  init() {
    if (this.isInitialized) return;

    const tg = (window as any).TelegramWebApp;
    
    if (tg) {
      this.webApp = tg;
      this.webApp.ready();
      this.webApp.expand();
      
      // Настраиваем цвета под тему Telegram
      this.applyThemeColors();
      
      this.isInitialized = true;
    }
  }

  private applyThemeColors() {
    if (!this.webApp) return;

    const root = document.documentElement;
    const params = this.webApp.themeParams;

    root.style.setProperty('--tg-theme-bg-color', params.bg_color || '#000000');
    root.style.setProperty('--tg-theme-text-color', params.text_color || '#FFFFFF');
    root.style.setProperty('--tg-theme-hint-color', params.hint_color || '#8E8E93');
    root.style.setProperty('--tg-theme-link-color', params.link_color || '#0A84FF');
    root.style.setProperty('--tg-theme-button-color', params.button_color || '#0A84FF');
    root.style.setProperty('--tg-theme-button-text-color', params.button_text_color || '#FFFFFF');
    root.style.setProperty('--tg-theme-secondary-bg-color', params.secondary_bg_color || '#1C1C1E');
  }

  getWebApp(): WebApp | null {
    return this.webApp;
  }

  getUser() {
    return this.webApp?.initDataUnsafe?.user || null;
  }

  getUserId(): string | null {
    const user = this.getUser();
    return user?.id?.toString() || null;
  }

  getInitData(): string | null {
    return this.webApp?.initData || null;
  }

  isDarkMode(): boolean {
    return this.webApp?.themeParams.bg_color === '#000000' || 
           this.webApp?.themeParams.bg_color === '#17212b';
  }

  // Haptic feedback
  haptic(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' | 'error' | 'success' | 'warning') {
    if (!this.webApp?.HapticFeedback) return;

    switch (style) {
      case 'light':
        this.webApp.HapticFeedback.impactOccurred('light');
        break;
      case 'medium':
        this.webApp.HapticFeedback.impactOccurred('medium');
        break;
      case 'heavy':
        this.webApp.HapticFeedback.impactOccurred('heavy');
        break;
      case 'rigid':
        this.webApp.HapticFeedback.impactOccurred('rigid');
        break;
      case 'soft':
        this.webApp.HapticFeedback.selectionChanged();
        break;
      case 'error':
        this.webApp.HapticFeedback.notificationOccurred('error');
        break;
      case 'success':
        this.webApp.HapticFeedback.notificationOccurred('success');
        break;
      case 'warning':
        this.webApp.HapticFeedback.notificationOccurred('warning');
        break;
    }
  }

  // Показывать/скрывать главную кнопку
  showMainButton(text: string, onClick: () => void) {
    if (!this.webApp?.MainButton) return;

    this.webApp.MainButton.setText(text);
    this.webApp.MainButton.onClick(onClick);
    this.webApp.MainButton.show();
  }

  hideMainButton() {
    if (!this.webApp?.MainButton) return;
    this.webApp.MainButton.hide();
  }

  // Показывать/скрывать кнопку назад
  showBackButton(onClick: () => void) {
    if (!this.webApp?.BackButton) return;

    this.webApp.BackButton.onClick(onClick);
    this.webApp.BackButton.show();
  }

  hideBackButton() {
    if (!this.webApp?.BackButton) return;
    this.webApp.BackButton.hide();
  }

  // Закрыть Web App
  close() {
    this.webApp?.close();
  }

  // Показать попап
  showAlert(message: string, callback?: () => void) {
    this.webApp?.showAlert(message, callback);
  }

  // Показать подтверждение
  showConfirm(message: string, callback: (confirmed: boolean) => void) {
    this.webApp?.showConfirm(message, callback);
  }
}

export const telegramService = new TelegramService();
export default telegramService;
