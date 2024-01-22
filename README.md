# meta-data

Data on pure-meta-styled puzzles from publicly available puzzlehunts. The main file is [src/metadata.yaml](src/metadata.yaml), which is converted to [src/metadata.json](src/metadata.json).

Browse random metas from meta-data on [my website](https://cjquines.com/meta-data/).

A "pure-meta-styled puzzle" expects the solver to combine several words and phrases (the "feeders") to create a new answer. The puzzle should has no content other than the feeders, and possibly flavor text, the puzzle title, and other small bits of info. It's a subjective definition and I'm using my judgment to determine what goes in and what doesn't. Consider [Fortune Cookies](https://2018.galacticpuzzlehunt.com/puzzle/fortune-cookies.html) and [Spaceopolis](http://puzzles.mit.edu/2020/puzzle/spaceopolis/), one of which is in the list and one which is not.

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
- MITMH: MIT Mystery Hunt (2000 to 2023)
- GPH: Galactic Puzzle Hunt (2017 to 2023)
- teammate: teammate hunt (2020 to 2021)
- Halpin: Mark Halpin's Labor Day Extravaganza (2006 to 2023)
- REDDOT: REDDOThunt (2017 to 2022)
- Caltech: Caltech Puzzle Hunt (2018)
- Silph: Silph Puzzle Hunt (2021)
- Paradox: Paradox Puzzlehunt (2021)
- Rojak: Puzzle Rojak (2021)
- QOPH: Quantum Online Puzzle Hunt (2022)
- Huntinality: Huntinality (2021 to 2023)
- ECPH: EC Puzzle Hunt (2023)
- Shardhunt: Shardhunt (2023)

I'm open to adding more hunts as long as both puzzles and solutions are publicly available online, and the hunt has a stable URL (which excludes, say, the Mystery Hunt, until it is archived). Contributions welcome.
