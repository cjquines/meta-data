import React, { Fragment, useEffect, useState } from "react";
import "./App.scss";

import * as metadata from "./metadata.json";

const Info = ({ next, tags, source }) => {
  return (
    <div className="source">
      <p>
        Source:{" "}
        <a href={source.link}>
          {source.hunt} {source.year}
        </a>
      </p>
      <p>Tags: {tags.join(", ")}</p>
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

const Body = ({ flavor, feeders, note }) => {
  return (
    <div className="body">
      {note && <p className="note">Note: {note}</p>}
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
  const metas = metadata.default;
  shuffle(metas);

  const [idx, setIdx] = useState(0);
  const [meta, setMeta] = useState(metas[0]);

  const next = () => {
    setMeta(metas[idx + 1]);
    setIdx(idx + 1);
  };

  return (
    <div className="app">
      <div className="header">
        <Info next={next} {...meta} />
        <Submit idx={idx} {...meta} />
      </div>
      <Body {...meta} />
    </div>
  );
};

export default App;
