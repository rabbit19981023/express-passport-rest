import passport from "passport";
import { IVerifyOptions, Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { logger } from "../logger";
import { RequestHandler } from "../server";
import { Role, Service, UserWithoutPassword, service } from "./service";

export class Authenticator {
  private readonly passport: passport.Authenticator;
  private readonly service: Service;

  constructor(passport: passport.Authenticator, service: Service) {
    this.passport = passport;
    this.service = service;

    this.initSerializer().registerStrategies();
  }

  public session(): RequestHandler {
    return this.passport.authenticate("session");
  }

  public authenticate(
    strategy: AuthStrategy,
    callback: (
      error: Error,
      user: UserWithoutPassword,
      info: IVerifyOptions,
    ) => void,
  ): RequestHandler {
    return this.passport.authenticate(strategy, callback);
  }

  private initSerializer(): this {
    // eslint-disable-next-line
    // @ts-ignore
    this.passport.serializeUser((user: UserWithoutPassword, done) => {
      logger.info({
        message: AuthMessage.NewSession,
        user,
      });

      done(null, user);
    });

    this.passport.deserializeUser((user: UserWithoutPassword, done) => {
      done(null, user);
    });

    return this;
  }

  private registerStrategies(): this {
    return this.registerLoginStrategy(LoginStrategy.Admin, Role.Admin)
      .registerLoginStrategy(LoginStrategy.User, Role.User)
      .registerSignupStrategy(SignupStrategy.Admin, Role.Admin)
      .registerSignupStrategy(SignupStrategy.User, Role.User);
  }

  private registerLoginStrategy(name: LoginStrategy, role: Role): this {
    this.passport.use(
      name,
      new LocalStrategy(async (username, password, done) => {
        const user = await this.service.findUserWithPassword({
          role,
          username,
        });

        if (user) {
          if (await bcrypt.compare(password, user.password)) {
            const { password: _, ...userWithoutPassword } = user;

            logger.info({
              message: AuthMessage.LoginSuccessed,
              user: userWithoutPassword,
            });

            return done(null, userWithoutPassword);
          }

          logger.warn({
            message: AuthMessage.LoginFailed,
            reason: AuthError.WrongPassword,
            user: { role, username },
          });

          return done(null, false, { message: AuthError.WrongPassword });
        }

        logger.warn({
          message: AuthMessage.LoginFailed,
          reason: AuthError.UserNotExists,
          user: { role, username },
        });

        done(null, false, { message: AuthError.UserNotExists });
      }),
    );

    return this;
  }

  private registerSignupStrategy(name: SignupStrategy, role: Role): this {
    this.passport.use(
      name,
      new LocalStrategy(async (username, password, done) => {
        if (!this.validateUsername(username)) {
          logger.warn({
            message: AuthMessage.SignupFailed,
            reason: AuthError.InvalidUsername,
            user: { role, username },
          });

          return done(null, false, {
            message: AuthError.InvalidUsername,
          });
        }

        if (!this.validatePassword(password)) {
          logger.warn({
            message: AuthMessage.SignupFailed,
            reason: AuthError.InvalidPassword,
            user: { role, username },
          });

          return done(null, false, {
            message: AuthError.InvalidPassword,
          });
        }

        if (await this.service.findUser({ role, username })) {
          logger.warn({
            message: AuthMessage.SignupFailed,
            reason: AuthError.UserAlreadyExists,
            user: { role, username },
          });

          return done(null, false, { message: AuthError.UserAlreadyExists });
        }

        const user = await this.service.createUser({
          role,
          username,
          password: await bcrypt.hash(password, await bcrypt.genSalt()),
        });

        if (!user) {
          logger.warn({
            message: AuthMessage.SignupFailed,
            reason: AuthError.RoleNotExists,
            user: { role, username },
          });

          return done(null, false, { message: AuthError.RoleNotExists });
        }

        logger.info({
          message: AuthMessage.SignupSuccessed,
          user,
        });

        done(null, user);
      }),
    );

    return this;
  }

  private validateUsername(username: string): boolean {
    return username.length >= 8;
  }

  private validatePassword(password: string): boolean {
    return password.length >= 8;
  }
}

export type { IVerifyOptions } from "passport-local";

export type AuthStrategy = LoginStrategy | SignupStrategy;

export enum LoginStrategy {
  Admin = "login-admin",
  User = "login-user",
}

export enum SignupStrategy {
  Admin = "signup-admin",
  User = "signup-user",
}

export enum AuthMessage {
  NewSession = "A new login session established!",

  LoginSuccessed = "Login successed!",
  SignupSuccessed = "Signup successed!",
  LogoutSuccessed = "Logout successed!",

  LoginFailed = "Login failed!",
  SignupFailed = "Signup failed!",
  LogoutFailed = "Logout faield!",
}

export enum AuthError {
  UserAlreadyExists = "User already exists!",
  RoleAlreadyExists = "Role already exists!",

  UserNotExists = "User not exists!",
  RoleNotExists = "Role not exists!",

  WrongPassword = "Wrong password!",

  InvalidUsername = "Username Must Be Greater Than Or Equal To 8 characters",
  InvalidPassword = "Password Must Be Greater Than Or Equal To 8 characters",
}

export const authenticator = new Authenticator(
  new passport.Passport(),
  service,
);
