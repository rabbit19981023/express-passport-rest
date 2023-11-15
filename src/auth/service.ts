import { logger } from "../logger";

// use namespace import to prevent naming conflicts
import * as prisma from "../prisma";

export class Service {
  private readonly prisma: prisma.Client;

  constructor(prisma: prisma.Client) {
    this.prisma = prisma;
  }

  public async createRole(dto: CreateRoleDto): Promise<prisma.Role | null> {
    try {
      const created = await this.prisma.role.create({
        data: {
          name: dto.role,
        },
      });

      logger.info({
        model: prisma.Model.Role,
        created,
      });

      return created;
    } catch (error) {
      logger.error({ model: prisma.Model.Role, error });
      return null;
    }
  }

  public async findUserWithPassword(
    dto: FindUserDto,
  ): Promise<prisma.User | null> {
    const { role, username } = dto;
    return await this.prisma.user.findFirst({
      where: {
        role: {
          name: role,
        },
        username,
      },
    });
  }

  public async findUser(dto: FindUserDto): Promise<UserWithoutPassword | null> {
    const user = await this.findUserWithPassword(dto);

    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }

    return null;
  }

  public async createUser(
    dto: CreateUserDto,
  ): Promise<UserWithoutPassword | null> {
    const { role, username, password } = dto;
    try {
      const { password: _, ...userWithoutPassword } =
        await this.prisma.user.create({
          data: {
            role: {
              connect: {
                name: role,
              },
            },
            username,
            password,
          },
        });

      logger.info({
        model: prisma.Model.User,
        created: userWithoutPassword,
      });

      return userWithoutPassword;
    } catch (error) {
      logger.error({ model: prisma.Model.User, error });
      return null;
    }
  }
}

export type UserWithoutPassword = Omit<prisma.User, "password">;

export enum Role {
  Admin = "admin",
  User = "user",
}

export type CreateRoleDto = {
  role: Role;
};

export type FindUserDto = {
  role: Role;
  username: string;
};

export type CreateUserDto = {
  role: Role;
  username: string;
  password: string;
};

export const service = new Service(prisma.client);
