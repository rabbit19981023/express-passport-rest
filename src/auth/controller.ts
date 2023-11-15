import { logger } from "../logger";
import {
  NextFunction,
  Request,
  Response,
  StatusCode,
  StatusPhrase,
} from "../server";
import { Service, UserWithoutPassword, service } from "./service";
import {
  Authenticator,
  IVerifyOptions,
  LoginStrategy,
  SignupStrategy,
  authenticator,
} from "./authenticator";

export class Controller {
  private readonly service: Service;
  private readonly authenticator: Authenticator;

  constructor(service: Service, authenticator: Authenticator) {
    this.service = service;
    this.authenticator = authenticator;
  }

  public async createRole(req: Request, res: Response): Promise<void> {
    const { role } = req.body;
    const created = await this.service.createRole({ role });

    if (created) {
      res.status(StatusCode.Created).json({ status: StatusPhrase.Created });
      return;
    }

    res.status(StatusCode.BadRequest).json({ status: StatusPhrase.BadRequest });
  }

  public loginAdmin(req: Request, res: Response, next: NextFunction): void {
    this.authenticator.authenticate(
      LoginStrategy.Admin,
      (error, user, info) => {
        this.authCallback(req, res, error, user, info);
      },
    )(req, res, next);
  }

  public loginUser(req: Request, res: Response, next: NextFunction): void {
    this.authenticator.authenticate(LoginStrategy.User, (error, user, info) => {
      this.authCallback(req, res, error, user, info);
    })(req, res, next);
  }

  public signupAdmin(req: Request, res: Response, next: NextFunction): void {
    this.authenticator.authenticate(
      SignupStrategy.Admin,
      (error, user, info) => {
        this.authCallback(req, res, error, user, info);
      },
    )(req, res, next);
  }

  public signupUser(req: Request, res: Response, next: NextFunction): void {
    this.authenticator.authenticate(
      SignupStrategy.User,
      (error, user, info) => {
        this.authCallback(req, res, error, user, info);
      },
    )(req, res, next);
  }

  public logout(req: Request, res: Response): void {
    const user = req.user;

    req.logout((error) => {
      // a small hacking to make http-logging contains the logged-out user information
      req.user = user;

      if (error) {
        logger.error({ error });

        res
          .status(StatusCode.InternalServerError)
          .json({ status: StatusPhrase.InternalServerError });

        return;
      }

      res.status(StatusCode.Ok).json({ status: StatusPhrase.Ok });
    });
  }

  private authCallback(
    req: Request,
    res: Response,
    _error: Error, // this will always be `null` because we never pass any error value in `done()`
    user: UserWithoutPassword | false,
    info: IVerifyOptions,
  ): void {
    if (!user) {
      res
        .status(StatusCode.Unauthorized)
        .json({ status: StatusPhrase.Unauthorized, message: info.message });
      return;
    }

    req.login(user, (error) => {
      if (error) {
        logger.error({ error });

        res
          .status(StatusCode.InternalServerError)
          .json({ status: StatusPhrase.InternalServerError });

        return;
      }

      res.status(StatusCode.Ok).json({ status: StatusPhrase.Ok });
    });
  }
}

export const controller = new Controller(service, authenticator);
