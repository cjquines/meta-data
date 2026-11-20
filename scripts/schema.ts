import * as z from "zod";

export const TAGS = [
  "binary",
  "chain",
  "dna",
  "grid",
  "letter change",
  "letter pattern",
  "morse",
  "movies",
  "music",
  "overlapping",
  "periodic table",
  "phonetic",
  "phrases",
  "rhyme",
  "roman numerals",
  "semantic",
  "semaphore",
  "solfege",
  "substring",
  "syntactic",
] as const;

export const Tag = z.enum(TAGS);
export type Tag = z.infer<typeof Tag>;

export const Answerized = z
  .string()
  .regex(
    /^[A-Z0-9'(),.-]+( [A-Z0-9'(),.-]+)*$/,
    "should be answerized: A-Z, 0-9, '(),.- and single spaces",
  );

export const HuntsFile = z
  .record(
    z.string(),
    z.strictObject({
      name: z.string().describe("Full name of hunt."),
      from: z.int().describe("First indexed year."),
      to: z
        .int()
        .optional()
        .describe(
          "Last indexed years, inclusive. When omitted, equals `from`.",
        ),
    }),
  )
  .describe("Record from hunt abbreviation to data.");
export type HuntsFile = z.infer<typeof HuntsFile>;

export const RawMeta = z.strictObject({
  year: z
    .union([z.int(), z.string()])
    .describe('Year of hunt, like 2000 or "Spring 2000".'),
  feeders: z
    .array(Answerized)
    .min(1)
    .describe(
      "List of puzzle feeders, in given order if relevant, else alphabetical. Should be answerized.",
    ),
  answer: z
    .array(Answerized)
    .min(1)
    .describe("Answers to the meta. Should be answerized."),
  tags: z.array(Tag).describe("Tags describing the mechanism."),
  flavor: z
    .string()
    .optional()
    .describe("Any flavor text given (even if not necessary for solving)."),
  note: z
    .string()
    .optional()
    .describe("Additional info needed to solve the puzzle (like its title)."),
  puzzle: z.url().describe("URL to puzzle page."),
  solution: z.url().describe("URL to solution page."),
});
export type RawMeta = z.infer<typeof RawMeta>;

export const metasFile = (hunts: readonly [string, ...string[]]) =>
  z.strictObject({
    hunt: z.enum(hunts).describe("Hunt abbreviation."),
    metas: z.array(RawMeta).describe("List of metas belonging to this hunt."),
  });

export const Meta = RawMeta.omit({
  year: true,
  puzzle: true,
  solution: true,
}).extend({
  source: z.strictObject({
    hunt: z.string().describe("Hunt abbreviation."),
    year: RawMeta.shape.year,
    puzzle: RawMeta.shape.puzzle,
    solution: RawMeta.shape.solution,
  }),
});
export type Meta = z.infer<typeof Meta>;

export const MetadataFile = z.array(Meta);
