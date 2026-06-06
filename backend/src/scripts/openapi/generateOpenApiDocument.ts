import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createOpenApiDocument } from "../../routes/docs.js";

const currentDir = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(currentDir, "../../../openapi.generated.json");

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(
  outputPath,
  `${JSON.stringify(createOpenApiDocument(), null, 2)}\n`,
);

console.log(`Wrote OpenAPI document to ${outputPath}`);
