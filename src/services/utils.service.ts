export class Utils {
  public static getDateTimeForLogging(): string {
    const date = new Date();
    return Utils.getDateTimeStringFromDate(date);
  }

  public static getDateTimeStringFromDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  public static logMessage(message: string): void {
    const messageWithDateTime = `${Utils.getDateTimeForLogging()} | ${message}`;
    console.log(messageWithDateTime);
  }
}
