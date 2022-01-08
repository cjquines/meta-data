# meta-data

Data on pure-meta-styled puzzles from publicly available puzzlehunts. The main file is [src/metadata.yaml](src/metadata.yaml), which is converted to [src/metadata.json](src/metadata.json).

Browse random metas from meta-data on [my website](https://cjquines.com/meta-data/).

A "pure-meta-styled puzzle" expects the solver to combine several words and phrases (the "feeders") to create a new answer. The puzzle should has no content other than the feeders, and possibly flavor text, the puzzle title, and other small bits of info. It's a subjective definition and I'm using my judgment to determine what goes in and what doesn't. When in doubt, my rule is "would seeing it at random help someone feel like they're getting better at solving pure metas?"

The schema is:

```yaml
- feeders:
    - list of feeders
    - in alphabetical order,
    - or the order necessary to solve the meta,
    - if that information is not in the feeders alone
  answer:
    - list of answers
    - possibly multiple, most have one
  tags:
    - syntactic, semantic (or both)
    - kind of ad hoc which tags get added otherwise
    - but think of it as a "poor man's hint"
  flavor: flavor text
  note: |
    any additional info necessary to solve the meta using
    just the above information, e.g. puzzle title
  source:
    hunt: hunt abbreviation (see below)
    year: |
      year of hunt. for hunts that run multiple times
      a year, can be something like "Spring 20XX"
    puzzle: URL
    solution: URL
```

Indexed hunts:
- MITMH: MIT Mystery Hunt (2000 to 2021)
- GPH: Galactic Puzzle Hunt (2017 to 2020)
- teammate: teammate hunt (2020 to 2021)

I'm open to adding more hunts as long as both puzzles and solutions are publicly available online, and the hunt has a stable URL. Contributions welcome.
