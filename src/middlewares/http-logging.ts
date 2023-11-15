import { logger } from "../logger";
import { NextFunction, Request, RequestHandler, Response } from "../server";

export function httpLogging(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const start = performance.now();

    res.on("close", () => {
      const { hostname: host, ip, user, method, originalUrl: path } = req;
      const { statusCode } = res;
      const duration = Math.floor(performance.now() - start);

      logger.info({ host, ip, user, method, path, statusCode, duration });
    });

    next();
  };
}
