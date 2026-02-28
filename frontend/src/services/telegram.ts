class TelegramService {
  private webApp: any = null;
  private isInitialized = false;

  init() {
    if (this.isInitialized) return this.webApp;

    console.log('[Telegram] Init called, window.TelegramWebApp:', !!(window as any).TelegramWebApp);
    
    const tg = (window as any).TelegramWebApp;
    
    if (tg) {
      this.webApp = tg;
      
      // Ready signal
      try {
        this.webApp.ready();
        console.log('[Telegram] ready() called');
      } catch (e) {
        console.warn('[Telegram] ready() error:', e);
      }
      
      // Expand
      try {
        this.webApp.expand();
        console.log('[Telegram] expand() called');
      } catch (e) {
        console.warn('[Telegram] expand() error:', e);
      }
      
      console.log('[Telegram] Initialized');
      console.log('[Telegram] initData:', this.webApp.initData ? this.webApp.initData.length + ' chars' : 'Not present');
      console.log('[Telegram] initDataUnsafe:', this.webApp.initDataUnsafe);
      console.log('[Telegram] themeParams:', this.webApp.themeParams);
      console.log('[Telegram] version:', this.webApp.version);
      
      // Настраиваем цвета под тему Telegram
      this.applyThemeColors();
      
      this.isInitialized = true;
    } else {
      console.error('[Telegram] TelegramWebApp NOT FOUND!');
      console.error('[Telegram] Are you opening this app from Telegram?');
    }
    
    return this.webApp;
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

  getWebApp(): any {
    if (!this.webApp) {
      console.warn('[Telegram] getWebApp called before init()');
      return this.init();
    }
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
    if (!this.webApp) {
      console.warn('[Telegram] getInitData called before init()');
      this.init();
    }
    const data = this.webApp?.initData;
    console.log('[Telegram] getInitData:', data ? data.length + ' chars' : 'null');
    return data || null;
  }

  isDarkMode(): boolean {
    return this.webApp?.themeParams?.bg_color === '#000000' || 
           this.webApp?.themeParams?.bg_color === '#17212b';
  }

  // Haptic feedback
  haptic(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' | 'error' | 'success' | 'warning') {
    if (!this.webApp?.HapticFeedback) {
      console.warn('[Telegram] HapticFeedback not available');
      return;
    }

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
    if (!this.webApp?.MainButton) {
      console.warn('[Telegram] MainButton not available');
      return;
    }

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
