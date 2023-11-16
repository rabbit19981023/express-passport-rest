import { createClient } from "redis";
import { logger } from "./logger";

export const client = createClient({
  socket: {
    port: 6379,
    host: "redis",
  },
});

client
  .on("error", (error) => logger.error(error))
  .on("connect", () => logger.info({ message: "Redis connected!" }))
  .on("ready", () => logger.info({ message: "Redis client is ready!" }))
  .connect();
