import express from "express";

export const routerPlain = express.Router();

routerPlain.use("/", (req, res, next) => {
  res.send("<h1>Hello from Express</h1>");
});
