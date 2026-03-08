import fs from "fs";

export const requestHandler = (req, res) => {
  const url = req.url;
  const method = req.method;
  if (url === "/") {
    res.setHeader("Content-Type", "text/html");
    res.write("<html>");
    res.write("<head><title>Enter message </title></head>");
    res.write(
      "<body><form action='/message' method='POST'><input type='text' name='message'/><button type='submit'>Submit</button></form></body>",
    );
    res.write("</html>");
    return res.end();
  }
  if (url === "/message" && method === "POST") {
    const body = [];
    req.on("data", (chunk) => {
      console.log(chunk);
      body.push(chunk);
    });
    return req.on("end", () => {
      const parsedBody = Buffer.concat(body).toString();
      console.log(parsedBody);
      const message = parsedBody.split("=")[1];
      fs.writeFile("./message.txt", message, (error) => {
        if (error) {
          console.error(error);
          res.statusCode = 500;
          return res.end("Failed to save message");
        } else {
          res.statusCode = 302; // redirect to "/"
          res.setHeader("Location", "/");
          return res.end();
        }
      });
    });
  }
};
