import app from "./app.ts";

const port = Number(process.env.BACKEND_PORT ?? 3000);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
