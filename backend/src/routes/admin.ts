import express from "express";

export const routerGet = express.Router();
export const routerPost = express.Router();

routerGet.get("/add-product", (req, res, next) => {
  res.send(
    "<form action='/product' method='POST'><input type='text' name='title'/><button type='submit'>Submit</button></form>",
  );
});

routerPost.post("/product", (req, res, next) => {
  console.log(req.body);
  res.redirect("/");
});
