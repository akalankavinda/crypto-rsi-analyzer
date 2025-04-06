import fetch from "node-fetch";
import { Env } from "../env";
import axios from "axios";

export class TelegramService {
  private static telegramBotToken = Env.TELEGRAM_BOT_TOKEN;
  private static telegramChannelId = Env.TELEGRAM_CHANNEL_ID;
  private static telegramChannelHandle = Env.TELEGRAM_CHANNEL_HANDLE;
  private static telegramEndpoint = `https://api.telegram.org/bot${this.telegramBotToken}/sendMessage`;
  private static telegramPhotoEndpoint = `https://api.telegram.org/bot${this.telegramBotToken}/sendPhoto?chat_id=@${this.telegramChannelHandle}`;

  public static async pushAlertMessage(message: string) {
    const postData = {
      chat_id: this.telegramChannelId,
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

  public static async pushAlertWithChart(
    message: string,
    imageData: Uint8Array<ArrayBufferLike>
  ) {
    const imageBlob = new Blob([imageData], { type: "image/jpeg" });

    // Create form data with buffer
    const form = new FormData();
    form.append("chat_id", this.telegramChannelId);
    form.append("caption", message);
    form.append("photo", imageBlob);

    try {
      // const response = await fetch(this.telegramPhotoEndpoint, {
      //   method: "POST",
      //   body: form,
      //   headers: {
      //     "Content-Type": "multipart/form-data",
      //   },
      // });

      const response = await axios.post(this.telegramPhotoEndpoint, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (error) {
      console.log("failed to push data to telegram api", error);
    }
  }
}
