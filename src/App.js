import React, { Fragment, useEffect, useRef, useState } from "react";
import "./App.scss";

import * as metadata from "./metadata.json";

const FilterOptions = ({ label, options, isSelected, onToggle }) => {
  let hasSelected = false;

  const detailsDom = options.map((option, i) => {
    const selected = isSelected(option);
    hasSelected |= selected;
    return (
      <div
        className={selected ? "selected" : ""}
        key={i}
        onClick={() => onToggle(option, selected)}
      >
        {option}
      </div>
    );
  });

  return (
    <details>
      <summary>
        <span className={hasSelected ? "selected" : ""}>{label}</span>
      </summary>
      <div className="filter">{detailsDom}</div>
    </details>
  );
};

const FeedersFilter = ({ filter }) => {
  const { filters, setFilters } = filter;
  const hasSelected = filters.feeders.min || filters.feeders.max;
  const minInput = useRef();
  const maxInput = useRef();

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
          ref={minInput}
          type="number"
          value={filters.feeders.min}
          onChange={(e) =>
            setFilters({
              ...filters,
              feeders: { ...filters.feeders, min: e.target.valueAsNumber },
            })
          }
        />
        and at most
        <input
          ref={maxInput}
          type="number"
          value={filters.feeders.max}
          onChange={(e) =>
            setFilters({
              ...filters,
              feeders: { ...filters.feeders, max: e.target.valueAsNumber },
            })
          }
        />
        <button
          className="secondary"
          onClick={() => {
            setFilters({ ...filters, feeders: {} });
            minInput.current.value = undefined;
            maxInput.current.value = undefined;
          }}
        >
          Reset
        </button>
      </div>
    </details>
  );
};

const Filters = ({ filter }) => {
  const { allFilters, filters, setFilters } = filter;
  const all = allFilters.current;

  return (
    <div className="filters">
      <FilterOptions
        label="From hunt:"
        options={all.source.hunt}
        isSelected={(hunt) => filters.source.hunt === hunt}
        onToggle={(hunt, selected) =>
          setFilters({
            ...filters,
            source: { ...filters.source, hunt: selected ? undefined : hunt },
          })
        }
      />
      <FilterOptions
        label="From year:"
        options={all.source.year}
        isSelected={(year) => filters.source.year === year}
        onToggle={(year, selected) =>
          setFilters({
            ...filters,
            source: { ...filters.source, year: selected ? undefined : year },
          })
        }
      />
      <FilterOptions
        label="Has all the tags:"
        options={all.tags}
        isSelected={(tag) => filters.tags.includes(tag)}
        onToggle={(tag, selected) =>
          setFilters({
            ...filters,
            tags: selected
              ? filters.tags.filter((other) => other !== tag)
              : [...filters.tags, tag],
          })
        }
      />
      <FilterOptions
        label="Has note:"
        options={["yes", "no"]}
        isSelected={(opt) => filters.note === opt}
        onToggle={(opt, selected) =>
          setFilters({ ...filters, note: selected ? undefined : opt })
        }
      />
      <FilterOptions
        label="Has flavor:"
        options={["yes", "no"]}
        isSelected={(opt) => filters.flavor === opt}
        onToggle={(opt, selected) =>
          setFilters({ ...filters, flavor: selected ? undefined : opt })
        }
      />
      <FeedersFilter filter={filter} />
    </div>
  );
};

const Spoiler = (props) => {
  const [visible, setVisible] = useState(false);
  return (
    <span
      className={visible ? "" : "spoiler"}
      onClick={() => setVisible(!visible)}
    >
      {props.children}
    </span>
  );
};

const Tags = ({ idx, tags }) => {
  const details = useRef();

  useEffect(() => {
    details.current.open = false;
  }, [idx]);

  return (
    tags && (
      <details ref={details}>
        <summary>Tags:</summary>
        <div className="tags">
          {tags.map((tag, i) => (
            <Spoiler key={i}>{tag}</Spoiler>
          ))}
        </div>
      </details>
    )
  );
};

const Info = ({ filter, idx, next, tags, source }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="info">
        <div>
          {source && (
            <div className="source">
              From{" "}
              <a href={source.puzzle}>
                {source.hunt} {source.year}
              </a>
              . <a href={source.solution}>Solution</a>.
            </div>
          )}
          <Tags idx={idx} tags={tags} />
        </div>
        <div className="buttons">
          <button className="secondary" onClick={() => setOpen(!open)}>
            Filter
          </button>
          <button onClick={() => next()}>New meta</button>
        </div>
      </div>
      {open ? <Filters filter={filter} /> : null}
    </>
  );
};

const isGood = (guess, answers) => {
  const normalize = (str) =>
    str
      .toUpperCase()
      .normalize("NFD")
      .replace(/[^A-Z]/g, "");
  return answers.map(normalize).includes(normalize(guess));
};

const Submit = ({ idx, answer }) => {
  const [guess, setGuess] = useState("");
  const [response, setResponse] = useState("");

  useEffect(() => {
    setGuess("");
    setResponse("");
  }, [idx]);

  const submit = (e) => {
    e.preventDefault();
    setResponse(
      isGood(guess, answer) ? `${guess} is correct!` : `${guess} is incorrect.`
    );
  };

  return (
    <div className="submit">
      <form onSubmit={submit}>
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
        />
        <button type="submit">Guess</button>
      </form>
      <div className="response">{response}</div>
    </div>
  );
};

const Body = ({ flavor, feeders, note }) => {
  return (
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
};

const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
};

const getFilters = (metas) => {
  const res = {
    source: {
      hunt: new Set(),
      year: new Set(),
    },
    tags: new Set(),
  };

  for (const meta of metas) {
    res.source.hunt.add(meta.source.hunt);
    res.source.year.add(meta.source.year);
    for (const tag of meta.tags) {
      res.tags.add(tag);
    }
  }

  return {
    source: {
      hunt: Array.from(res.source.hunt).sort(),
      year: Array.from(res.source.year).sort((a, b) => a - b),
    },
    tags: Array.from(res.tags).sort(),
  };
};

const matches = (meta, filters) => {
  return [
    !filters.source.hunt || filters.source.hunt === meta.source.hunt,
    !filters.source.year || filters.source.year === meta.source.year,
    filters.tags.every((tag) => meta.tags.includes(tag)),
    filters.note !== "yes" || meta.note,
    filters.note !== "no" || !meta.note,
    filters.flavor !== "yes" || meta.flavor,
    filters.flavor !== "no" || !meta.flavor,
    !filters.feeders.min || meta.feeders.length >= filters.feeders.min,
    !filters.feeders.max || meta.feeders.length <= filters.feeders.max,
  ].every(Boolean);
};

const App = () => {
  const metas = useRef(null);
  const allFilters = useRef(null);

  if (!metas.current) {
    metas.current = metadata.default;
    shuffle(metas.current);
    allFilters.current = getFilters(metas.current);
  }

  const [idx, setIdx] = useState(0);
  const [meta, setMeta] = useState(metas.current[0]);
  const [filters, setFilters] = useState({ source: {}, tags: [], feeders: {} });
  const filter = { allFilters, filters, setFilters };

  const next = () => {
    let newIdx = idx;
    let newMeta = meta;
    do {
      newIdx = (newIdx + 1) % metas.current.length;
      newMeta = metas.current[newIdx];
      if (newIdx === idx) break;
    } while (!matches(newMeta, filters));
    setIdx(newIdx);
    setMeta(newMeta);
  };

  return (
    <div className="app">
      <div className="top">
        <h1>meta-data</h1>
        compiled by <a href="https://cjquines.com">CJ Quines</a> · source on{" "}
        <a href="https://github.com/cjquines/meta-data">Github</a>
      </div>
      <div className="header">
        <Info idx={idx} next={next} filter={filter} {...meta} />
      </div>
      <Submit idx={idx} {...meta} />
      <Body {...meta} />
    </div>
  );
};

export default App;
