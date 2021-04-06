import React, { Fragment, useEffect, useRef, useState } from "react";
import "./App.scss";

import * as metadata from "./metadata.json";

const Spoiler = (props) => {
  const [visible, setVisible] = useState(false);
  return (
    <span
      className={visible ? "" : "spoiler"}
      onClick={(e) => setVisible(!visible)}
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

const Info = ({ idx, next, tags, source }) => {
  return (
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
      <button onClick={(e) => next()}>New meta</button>
    </div>
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

const Body = ({ flavor, feeders, note, source }) => {
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

const App = () => {
  const metas = useRef(null);
  if (!metas.current) {
    metas.current = metadata.default;
    shuffle(metas.current);
  }

  const [idx, setIdx] = useState(0);
  const [meta, setMeta] = useState(metas.current[0]);

  const next = () => {
    const newIdx = (idx + 1) % metas.current.length;
    setMeta(metas.current[newIdx]);
    setIdx(newIdx);
  };

  return (
    <div className="app">
      <div className="top">
        <h1>meta-data</h1>
        compiled by <a href="https://cjquines.com">CJ Quines</a> · source on{" "}
        <a href="https://github.com/cjquines/meta-data">Github</a>
      </div>
      <div className="header">
        <Info idx={idx} next={next} {...meta} />
        <Submit idx={idx} {...meta} />
      </div>
      <Body {...meta} />
    </div>
  );
};

export default App;
