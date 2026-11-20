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

export const HuntsFile = z.record(
  z.string(),
  z.strictObject({
    name: z.string(),
    from: z.int(),
    to: z.int().optional(),
  }),
);

export const RawMeta = z.strictObject({
  year: z.union([z.int(), z.string()]),
  feeders: z.array(z.string()).min(1),
  answer: z.array(z.string()).min(1),
  tags: z.array(Tag),
  flavor: z.string().optional(),
  note: z.string().optional(),
  puzzle: z.url(),
  solution: z.url(),
});

export const metasFile = (hunts: readonly [string, ...string[]]) =>
  z.strictObject({
    hunt: z.enum(hunts),
    metas: z.array(RawMeta),
  });

export type Tag = z.infer<typeof Tag>;
export type RawMeta = z.infer<typeof RawMeta>;
export type HuntsFile = z.infer<typeof HuntsFile>;

export type Meta = Omit<RawMeta, "year" | "puzzle" | "solution"> & {
  source: {
    hunt: string;
    year: RawMeta["year"];
    puzzle: string;
    solution: string;
  };
};
