import { Env } from "../env";

export class TelegramService {
  private static telegramBotToken = Env.TELEGRAM_BOT_TOKEN;
  private static telegramAlertChannelId = Env.TELEGRAM_ALERT_CHANNEL_ID;
  private static telegramEndpoint = `https://api.telegram.org/bot${this.telegramBotToken}/sendMessage`;

  public static async pushAlertMessage(message: string) {
    const postData = {
      chat_id: this.telegramAlertChannelId,
      text: message,
      parse_mode: "HTML",
    };

    try {
      await fetch(this.telegramEndpoint, {
        method: "post",
        body: JSON.stringify(postData),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
    } catch (error) {
      console.log("failed to push data to telegram api", error);
    }
  }
}
