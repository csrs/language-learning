import * as http from "http";

const port = Number(process.env.PORT ?? 3000);

const server = http.createServer((req, res) => {
  const path = req.url ?? "/";

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ status: "ok", path }));
});

server.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
