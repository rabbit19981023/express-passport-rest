export class Logger {
  public error(msg: Message): void {
    this.log(Level.Error, msg);
  }

  public warn(msg: Message): void {
    this.log(Level.Warn, msg);
  }

  public info(msg: Message): void {
    this.log(Level.Info, msg);
  }

  private log(level: Level, msg: Message): void {
    console.log({
      level,
      timestamp: this.currentTime(),
      ...msg,
    });
  }

  private currentTime(): string {
    return new Date()
      .toISOString()
      .replace(/-/g, "/")
      .replace("T", " ")
      .split(".")[0]!;
  }
}

export enum Level {
  Error = "ERROR",
  Warn = "WARN",
  Info = "INFO",
}

export type Message = {
  [key: string]: unknown;
};

export const logger = new Logger();
