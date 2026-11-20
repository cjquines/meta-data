import * as fs from "node:fs";
import * as path from "node:path";
import * as url from "node:url";
import * as YAML from "yaml";
import * as z from "zod";
import { HuntsFile, metasFile, type Meta } from "./schema.ts";

const root = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  "..",
);
const dataDir = path.join(root, "data");
const huntsPath = path.join(dataDir, "hunts.yml");
const outPath = path.join(root, "src/metadata.json");

const writeJson = (file: string, value: unknown) => {
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
};

const readYaml = (file: string): unknown =>
  YAML.parse(fs.readFileSync(file, "utf8"));

const fail = (file: string, error: z.ZodError) => {
  console.error(`${path.relative(root, file)}:\n${z.prettifyError(error)}\n`);
};

writeJson(
  path.join(dataDir, "hunts.schema.json"),
  z.toJSONSchema(HuntsFile, { io: "input" }),
);

const hunts = HuntsFile.safeParse(readYaml(huntsPath));
if (!hunts.success) {
  fail(huntsPath, hunts.error);
  process.exit(1);
}

const abbrs = Object.keys(hunts.data);
if (abbrs.length === 0) {
  console.error("data/hunts.yml: no hunts\n");
  process.exit(1);
}
const MetasFile = metasFile(abbrs as [string, ...string[]]);

writeJson(
  path.join(dataDir, "metas.schema.json"),
  z.toJSONSchema(MetasFile, { io: "input" }),
);

const files = fs
  .readdirSync(dataDir, { recursive: true, encoding: "utf8" })
  .filter((name) => name.endsWith(".yml"))
  .map((name) => path.join(dataDir, name))
  .filter((file) => file !== huntsPath)
  .sort();

const metas: Meta[] = [];
let failed = false;

for (const file of files) {
  const result = MetasFile.safeParse(readYaml(file));
  if (!result.success) {
    fail(file, result.error);
    failed = true;
    continue;
  }
  const { hunt, metas: fileMetas } = result.data;
  for (const { year, puzzle, solution, ...rest } of fileMetas) {
    metas.push({ ...rest, source: { hunt, year, puzzle, solution } });
  }
}

if (failed) process.exit(1);

writeJson(outPath, metas);
console.log(
  `wrote ${String(metas.length)} metas from ${String(files.length)} files`,
);
