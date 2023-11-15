import expressSession from "express-session";
import { RequestHandler } from "../server";

export function session(): RequestHandler {
  return expressSession({
    secret:
      process.env["COOKIE_SESSION_SECRET"] ||
      "The secret to sign the session id stored in cookie",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env["NODE_ENV"] === "production",
      maxAge: process.env["COOKIE_MAXAGE"]
        ? parseInt(process.env["COOKIE_MAXAGE"])
        : 1000 * 60 * 60 * 2,
    },
  });
}
