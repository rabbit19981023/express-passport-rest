import express from "express";
import { logger } from "./logger";
import { httpLogging } from "./middlewares/http-logging";
import { session } from "./middlewares/express-session";
import { authenticator } from "./auth/authenticator";
import { routes as authRoutes } from "./auth/routes";

export class Server {
  private readonly app: express.Application;

  constructor() {
    this.app = express();
    this.registerMiddlewares().registerRoutes();
  }

  static createApp(): express.Application {
    return express();
  }

  public listen(host: string, port: number): void {
    this.app.listen(port, host, () => {
      logger.info({
        message: `The express server is listening on ${host}:${port}`,
      });
    });
  }

  private registerMiddlewares(): this {
    this.app.use(httpLogging());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(session());
    this.app.use(authenticator.session());

    return this;
  }

  private registerRoutes(): this {
    const apiRouter = express.Router();

    apiRouter.use("/auth", authRoutes.getRouter());

    this.app.use("/api/v1", apiRouter);

    return this;
  }
}

export type { NextFunction, Request, RequestHandler, Response } from "express";

export enum StatusCode {
  Ok = 200,
  Created = 201,
  BadRequest = 400,
  Unauthorized = 401,
  InternalServerError = 500,
}

export enum StatusPhrase {
  Ok = "Ok!",
  Created = "Created!",
  BadRequest = "BadRequest!",
  Unauthorized = "Unauthorized!",
  InternalServerError = "InternalServerError!",
}
