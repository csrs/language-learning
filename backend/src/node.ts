import http from "http";
import { requestHandler } from "./routes.ts";

const server = http.createServer((req, res) => {
  requestHandler(req, res);
});

server.listen(3000);
