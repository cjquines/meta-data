import { Fragment, useState, type ReactNode } from "react";
import type { Meta } from "../scripts/schema.ts";
import metadata from "./metadata.json";
import "./App.css";

type Year = Meta["source"]["year"];

type Filters = {
  hunt?: string;
  year?: Year;
  tags: string[];
  note?: "yes" | "no";
  flavor?: "yes" | "no";
  minFeeders?: number;
  maxFeeders?: number;
};

const emptyFilters: Filters = { tags: [] };

const shuffle = <T,>(arr: T[]): T[] => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const compareYears = (a: Year, b: Year) =>
  typeof a === "number" && typeof b === "number"
    ? a - b
    : String(a).localeCompare(String(b));

const metas: Meta[] = shuffle([...(metadata as Meta[])]);

const allOptions = {
  hunt: [...new Set(metas.map((meta) => meta.source.hunt))].sort(),
  year: [...new Set(metas.map((meta) => meta.source.year))].sort(compareYears),
  tags: [...new Set(metas.flatMap((meta) => meta.tags))].sort(),
};

const matches = (meta: Meta, filters: Filters) =>
  [
    filters.hunt === undefined || filters.hunt === meta.source.hunt,
    filters.year === undefined || filters.year === meta.source.year,
    filters.tags.every((tag) => (meta.tags as string[]).includes(tag)),
    filters.note !== "yes" || meta.note,
    filters.note !== "no" || !meta.note,
    filters.flavor !== "yes" || meta.flavor,
    filters.flavor !== "no" || !meta.flavor,
    filters.minFeeders === undefined ||
      meta.feeders.length >= filters.minFeeders,
    filters.maxFeeders === undefined ||
      meta.feeders.length <= filters.maxFeeders,
  ].every(Boolean);

/** Index of the next meta after `idx` matching `filters`, if any. */
const findNext = (idx: number, filters: Filters) => {
  for (let i = 1; i < metas.length; i++) {
    const newIdx = (idx + i) % metas.length;
    if (matches(metas[newIdx], filters)) return newIdx;
  }
  return undefined;
};

const FilterOptions = <T extends string | number>({
  label,
  options,
  isSelected,
  onToggle,
}: {
  label: string;
  options: readonly T[];
  isSelected: (option: T) => boolean;
  onToggle: (option: T, selected: boolean) => void;
}) => (
  <details>
    <summary>
      <span className={options.some(isSelected) ? "selected" : ""}>
        {label}
      </span>
    </summary>
    <div className="filter">
      {options.map((option) => {
        const selected = isSelected(option);
        return (
          <div
            className={selected ? "selected" : ""}
            key={option}
            onClick={() => {
              onToggle(option, selected);
            }}
          >
            {option}
          </div>
        );
      })}
    </div>
  </details>
);

const parseCount = (value: number) => (Number.isNaN(value) ? undefined : value);

const FeedersFilter = ({
  filters,
  setFilters,
}: {
  filters: Filters;
  setFilters: (filters: Filters) => void;
}) => {
  const { minFeeders, maxFeeders } = filters;
  const hasSelected = minFeeders !== undefined || maxFeeders !== undefined;

  return (
    <details>
      <summary>
        <span className={hasSelected ? "selected" : ""}>
          Has number of feeders:
        </span>
      </summary>
      <div className="filter">
        at least
        <input
          type="number"
          value={minFeeders ?? ""}
          onChange={(e) => {
            setFilters({
              ...filters,
              minFeeders: parseCount(e.target.valueAsNumber),
            });
          }}
        />
        and at most
        <input
          type="number"
          value={maxFeeders ?? ""}
          onChange={(e) => {
            setFilters({
              ...filters,
              maxFeeders: parseCount(e.target.valueAsNumber),
            });
          }}
        />
        <button
          className="secondary"
          onClick={() => {
            setFilters({
              ...filters,
              minFeeders: undefined,
              maxFeeders: undefined,
            });
          }}
        >
          Reset
        </button>
      </div>
    </details>
  );
};

const yesNo = ["yes", "no"] as const;

const FiltersPanel = ({
  filters,
  setFilters,
}: {
  filters: Filters;
  setFilters: (filters: Filters) => void;
}) => (
  <div className="filters">
    <FilterOptions
      label="From hunt:"
      options={allOptions.hunt}
      isSelected={(hunt) => filters.hunt === hunt}
      onToggle={(hunt, selected) => {
        setFilters({ ...filters, hunt: selected ? undefined : hunt });
      }}
    />
    <FilterOptions
      label="From year:"
      options={allOptions.year}
      isSelected={(year) => filters.year === year}
      onToggle={(year, selected) => {
        setFilters({ ...filters, year: selected ? undefined : year });
      }}
    />
    <FilterOptions
      label="Has all the tags:"
      options={allOptions.tags}
      isSelected={(tag) => filters.tags.includes(tag)}
      onToggle={(tag, selected) => {
        setFilters({
          ...filters,
          tags: selected
            ? filters.tags.filter((other) => other !== tag)
            : [...filters.tags, tag],
        });
      }}
    />
    <FilterOptions
      label="Has note:"
      options={yesNo}
      isSelected={(opt) => filters.note === opt}
      onToggle={(opt, selected) => {
        setFilters({ ...filters, note: selected ? undefined : opt });
      }}
    />
    <FilterOptions
      label="Has flavor:"
      options={yesNo}
      isSelected={(opt) => filters.flavor === opt}
      onToggle={(opt, selected) => {
        setFilters({ ...filters, flavor: selected ? undefined : opt });
      }}
    />
    <FeedersFilter filters={filters} setFilters={setFilters} />
  </div>
);

const Spoiler = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  return (
    <span
      className={visible ? "" : "spoiler"}
      onClick={() => {
        setVisible(!visible);
      }}
    >
      {children}
    </span>
  );
};

const Tags = ({ tags }: { tags: Meta["tags"] }) => (
  <details>
    <summary>Tags:</summary>
    <div className="tags">
      {tags.map((tag) => (
        <Spoiler key={tag}>{tag}</Spoiler>
      ))}
    </div>
  </details>
);

const normalize = (str: string) =>
  str
    .toUpperCase()
    .normalize("NFD")
    .replace(/[^A-Z]/g, "");

const isGood = (guess: string, answers: string[]) =>
  answers.map(normalize).includes(normalize(guess));

const Submit = ({ answer }: { answer: string[] }) => {
  const [guess, setGuess] = useState("");
  const [response, setResponse] = useState("");

  return (
    <div className="submit">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setResponse(
            isGood(guess, answer)
              ? `${guess} is correct!`
              : `${guess} is incorrect.`,
          );
        }}
      >
        <input
          type="text"
          value={guess}
          onChange={(e) => {
            setGuess(e.target.value);
          }}
        />
        <button type="submit">Guess</button>
      </form>
      <div className="response">{response}</div>
    </div>
  );
};

const Body = ({ flavor, feeders, note }: Meta) => (
  <div className="body">
    {note && (
      <p className="note">
        <i>Note:</i> {note}
      </p>
    )}
    {flavor && <p className="flavor">{flavor}</p>}
    <p className="feeders">
      {feeders.map((feeder, i) => (
        <Fragment key={i}>
          {feeder}
          <br />
        </Fragment>
      ))}
    </p>
  </div>
);

const App = () => {
  const [idx, setIdx] = useState(0);
  const [filters, setFilters] = useState(emptyFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const meta = metas[idx];
  const nextIdx = findNext(idx, filters);

  return (
    <div className="app">
      <div className="top">
        <h1>meta-data</h1>
        compiled by <a href="https://cjquines.com">CJ Quines</a> · source on{" "}
        <a href="https://github.com/cjquines/meta-data">Github</a>
      </div>
      <div className="header">
        <div className="info">
          <div>
            <div className="source">
              From{" "}
              <a href={meta.source.puzzle}>
                {meta.source.hunt} {meta.source.year}
              </a>
              . <a href={meta.source.solution}>Solution</a>.
            </div>
            <Tags key={idx} tags={meta.tags} />
          </div>
          <div className="buttons">
            <button
              className="secondary"
              onClick={() => {
                setFiltersOpen(!filtersOpen);
              }}
            >
              Filter
            </button>
            <button
              disabled={nextIdx === undefined}
              onClick={() => {
                if (nextIdx !== undefined) setIdx(nextIdx);
              }}
            >
              New meta
            </button>
          </div>
        </div>
        {filtersOpen && (
          <FiltersPanel filters={filters} setFilters={setFilters} />
        )}
      </div>
      <Submit key={idx} answer={meta.answer} />
      <Body {...meta} />
    </div>
  );
};

export default App;
