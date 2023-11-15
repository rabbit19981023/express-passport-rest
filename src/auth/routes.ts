import { Router } from "express";
import { Controller, controller } from "./controller";

export class Routes {
  private readonly router: Router;
  private readonly controller: Controller;

  constructor(router: Router, controller: Controller) {
    this.router = router;
    this.controller = controller;

    this.register();
  }

  public getRouter(): Router {
    return this.router;
  }

  private register(): this {
    this.router.post("/roles", (req, res) => {
      this.controller.createRole(req, res);
    });

    this.router.post("/login/admin", (req, res, next) => {
      this.controller.loginAdmin(req, res, next);
    });

    this.router.post("/login/user", (req, res, next) => {
      this.controller.loginUser(req, res, next);
    });

    this.router.post("/signup/admin", (req, res, next) => {
      this.controller.signupAdmin(req, res, next);
    });

    this.router.post("/signup/user", (req, res, next) => {
      this.controller.signupUser(req, res, next);
    });

    this.router.post("/logout", (req, res) => {
      this.controller.logout(req, res);
    });

    return this;
  }
}

export const routes = new Routes(Router(), controller);
