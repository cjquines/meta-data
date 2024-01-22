import React, { Fragment, useEffect, useRef, useState } from "react";
import "./App.scss";

import * as metadata from "./metadata.json";

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

const Filters = ({ filter }) => {
  const { allFilters, filters, setFilters } = filter;
  const all = allFilters.current;

  const tagsDom = all.tags.map((tag, i) => {
    const selected = filters.tags.includes(tag);
    return (
      <div
        className={selected ? "selected" : ""}
        key={i}
        onClick={() =>
          setFilters(() => ({
            ...filters,
            tags: selected
              ? filters.tags.filter((other) => other !== tag)
              : [...filters.tags, tag],
          }))
        }
      >
        {tag}
      </div>
    );
  });

  const huntDom = all.source.hunt.map((hunt, i) => {
    const selected = filters.source.hunt === hunt;
    return (
      <div
        className={selected ? "selected" : ""}
        key={i}
        onClick={() =>
          setFilters(() => ({
            ...filters,
            source: {
              ...filters.source,
              hunt: selected ? undefined : hunt,
            },
          }))
        }
      >
        {hunt}
      </div>
    );
  });

  const yearDom = all.source.year.map((year, i) => {
    const selected = filters.source.year === year;
    return (
      <div
        className={selected ? "selected" : ""}
        key={i}
        onClick={() =>
          setFilters(() => ({
            ...filters,
            source: {
              ...filters.source,
              year: selected ? undefined : year,
            },
          }))
        }
      >
        {year}
      </div>
    );
  });

  return (
    <div className="filters">
      <details>
        <summary>
          <span className={filters.tags.length > 0 ? "selected" : ""}>
            Has all these tags:
          </span>
        </summary>
        <div className="filter">{tagsDom}</div>
      </details>
      <details>
        <summary>
          <span className={filters.source.hunt ? "selected" : ""}>
            From hunt:
          </span>
        </summary>
        <div className="filter">{huntDom}</div>
      </details>
      <details>
        <summary>
          <span className={filters.source.year ? "selected" : ""}>
            From year:
          </span>
        </summary>
        <div className="filter">{yearDom}</div>
      </details>
    </div>
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
          <button onClick={() => next()}>New meta</button>
          <button onClick={() => setOpen(!open)}>Filter</button>
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
    tags: new Set(),
    source: {
      hunt: new Set(),
      year: new Set(),
    },
  };

  for (const meta of metas) {
    for (const tag of meta.tags) {
      res.tags.add(tag);
    }
    res.source.hunt.add(meta.source.hunt);
    res.source.year.add(meta.source.year);
  }

  return {
    tags: Array.from(res.tags).sort(),
    source: {
      hunt: Array.from(res.source.hunt).sort(),
      year: Array.from(res.source.year).sort((a, b) => a - b),
    },
  };
};

const matches = (meta, filters) => {
  return [
    !filters.feeders.min || meta.feeders.length >= filters.feeders.min,
    !filters.feeders.max || meta.feeders.length <= filters.feeders.max,
    filters.flavor !== "yes" || meta.flavor,
    filters.flavor !== "no" || !meta.flavor,
    filters.note !== "yes" || meta.note,
    filters.note !== "no" || !meta.note,
    filters.tags.every((tag) => meta.tags.includes(tag)),
    !filters.source.hunt || filters.source.hunt === meta.source.hunt,
    !filters.source.year || filters.source.year === meta.source.year,
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
  const [filters, setFilters] = useState({ feeders: {}, source: {}, tags: [] });
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
