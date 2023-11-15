import { PrismaClient } from "@prisma/client";

export type { PrismaClient as Client, Role, User } from "@prisma/client";

export enum Model {
  Role = "Role",
  User = "User",
}

export const client = new PrismaClient();
