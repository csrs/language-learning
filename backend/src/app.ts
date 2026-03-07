import express from "express";
import bodyParser from "body-parser";
import { routerGet, routerPost } from "./routes/admin.ts";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));

app.use(routerGet);

app.use(routerPost);

// 404 page
app.use((req, res) => {
  res.status(404);
  res.send("<h1>Page not found</h1>");
});

app.listen(port, () => {});
