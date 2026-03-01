  async authDev(telegramId: string, username?: string, firstName?: string) {
    const response = await this.client.post('/auth-dev', {
      telegramId,
      username,
      firstName,
    });
    return response.data;
  }
