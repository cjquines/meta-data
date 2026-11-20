import * as fs from "node:fs";
import * as path from "node:path";
import * as url from "node:url";
import * as YAML from "yaml";
import * as z from "zod";
import { HuntsFile, metasFile, type Meta, type RawMeta } from "./schema.ts";

const root = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  "..",
);
const dataDir = path.join(root, "data");
const huntsPath = path.join(dataDir, "hunts.yml");
const outPath = path.join(root, "src/metadata.json");
const readmePath = path.join(root, "README.md");

const rel = (file: string) => path.relative(root, file);

const writeJson = (file: string, value: unknown) => {
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
};

const readYaml = (file: string): unknown =>
  YAML.parse(fs.readFileSync(file, "utf8"));

const fail = (file: string, error: z.ZodError) => {
  console.error(`${rel(file)}:\n${z.prettifyError(error)}\n`);
};

const warn = (file: string, message: string) => {
  console.warn(`warning: ${rel(file)}: ${message}`);
};

// hunts.yml

writeJson(
  path.join(dataDir, "hunts.schema.json"),
  z.toJSONSchema(HuntsFile, { io: "input" }),
);

const huntsResult = HuntsFile.safeParse(readYaml(huntsPath));
if (!huntsResult.success) {
  fail(huntsPath, huntsResult.error);
  process.exit(1);
}
const hunts = huntsResult.data;

const abbrs = Object.keys(hunts);
if (abbrs.length === 0) {
  console.error("data/hunts.yml: no hunts\n");
  process.exit(1);
}
const MetasFile = metasFile(abbrs as [string, ...string[]]);

writeJson(
  path.join(dataDir, "metas.schema.json"),
  z.toJSONSchema(MetasFile, { io: "input" }),
);

// metas

/** Require `file` as `[hunt].yml` or `[hunt]/[year].yml`. */
const checkFilename = (file: string, hunt: string, metas: RawMeta[]) => {
  const parts = path.relative(dataDir, file).split(path.sep);
  const expectedDir = hunt.toLowerCase();
  if (parts.length === 1) {
    if (parts[0] !== `${expectedDir}.yml`) {
      warn(file, `expected filename ${expectedDir}.yml for hunt ${hunt}`);
    }
  } else if (parts.length === 2) {
    const [dir, name] = parts as [string, string];
    if (dir !== expectedDir) {
      warn(file, `expected folder ${expectedDir}/ for hunt ${hunt}`);
    }
    const year = path.basename(name, ".yml");
    for (const other of new Set(metas.map((meta) => String(meta.year)))) {
      if (other !== year) warn(file, `metas from ${other} in file for ${year}`);
    }
  } else {
    warn(file, "expected at most one folder level under data/");
  }
};

const checkYears = (file: string, hunt: string, metas: RawMeta[]) => {
  const { from, to = from } = hunts[hunt];
  for (const year of new Set(metas.map((meta) => meta.year))) {
    if (typeof year === "number" && (year < from || year > to)) {
      warn(
        file,
        `metas from ${String(year)} outside ${hunt}'s indexed years in data/hunts.yml`,
      );
    }
  }
};

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
  checkFilename(file, hunt, fileMetas);
  checkYears(file, hunt, fileMetas);
  for (const { year, puzzle, solution, ...rest } of fileMetas) {
    metas.push({ ...rest, source: { hunt, year, puzzle, solution } });
  }
}

if (failed) process.exit(1);

writeJson(outPath, metas);
console.log(
  `wrote ${String(metas.length)} metas from ${String(files.length)} files`,
);

// README

const readme = fs.readFileSync(readmePath, "utf8");
const section = /(<!-- hunts:start[^\n]*-->\n)[\s\S]*?(\n<!-- hunts:end -->)/;
if (!section.test(readme)) {
  console.error("README.md: missing hunts:start/hunts:end markers\n");
  process.exit(1);
}
const huntList = Object.entries(hunts)
  .map(([abbr, { name, from, to }]) => {
    const years =
      to === undefined || to === from
        ? String(from)
        : `${String(from)} to ${String(to)}`;
    return `- ${abbr}: ${name} (${years})`;
  })
  .join("\n");
fs.writeFileSync(
  readmePath,
  readme.replace(section, (_, start: string, end: string) =>
    [start, huntList, end].join("\n"),
  ),
);
console.log("updated README.md");
