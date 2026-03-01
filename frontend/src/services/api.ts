  async authDev(telegramId: string, username?: string, firstName?: string) {
    const response = await this.client.post('/auth-simple', {
      telegramId,
      username,
      firstName,
    });
    return response.data;
  }
