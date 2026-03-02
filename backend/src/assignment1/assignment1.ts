import http from "http";

const server = http.createServer((req, res) => {
  const url = req.url;
  const method = req.method;
  if (url === "/") {
    res.setHeader("Content-Type", "text/html");
    res.write("<html>");
    res.write("<head><title>First page</title></head>");
    res.write("<body><h1>First page</h1>");

    res.write("</body></html>");
    return res.end();
  } else if (url === "/users") {
    //
    res.setHeader("Content-Type", "text/html");
    res.write("<html>");
    res.write("<head><title>List of users</title></head>");
    res.write("<body><ul><li>User 1</li><li>User 2</li></ul>");
    res.write(
      '<form action="/create-user" method="POST"><input type="text" name="username"/><button type="submit">Submit</button></form>',
    );
    res.write("</body></html>");

    return res.end();
  } else if (url === "/create-user" && method === "POST") {
    const body = [];
    req.on("data", (chunk) => {
      console.log(chunk);
      body.push(chunk);
    });
    return req.on("end", () => {
      const parsedBody = Buffer.concat(body).toString();
      console.log(parsedBody);
      res.statusCode = 302; // redirect to "/"
      res.setHeader("Location", "/");
      return res.end();
    });
  }
});

server.listen(3000);
