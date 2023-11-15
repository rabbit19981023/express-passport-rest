import "dotenv/config";
import { Server } from "./server";

function bootstrap(): void {
  const server = new Server();

  const host = process.env["SERVER_HOST"] || "0.0.0.0";
  const port = process.env["SERVER_PORT"]
    ? parseInt(process.env["SERVER_PORT"])
    : 3000;

  server.listen(host, port);
}

bootstrap();
