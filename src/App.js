import React, { useState } from "react";
import "./App.scss";

import * as metadata from "./metadata.json";

const Feeders = ({ feeders }) => {
  return (
    <p className="feeders">
      {feeders.map((c) => (
        <React.Fragment>
          {c}
          <br />
        </React.Fragment>
      ))}
    </p>
  );
};

const Header = ({ answer, tags, next, source }) => {
  const [guess, setGuess] = useState("");

  return (
    <div className="header">
      <div className="source">
        <a href={source.link}>
          {source.hunt} {source.year}
        </a>
        <button onClick={(e) => next()}>New meta</button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          console.log(guess);
        }}
      >
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
        />
        <input type="submit" value="Guess" />
      </form>
      <div className="response"></div>
    </div>
  );
};

const Body = ({ flavor, feeders, note }) => {
  return (
    <div className="body">
      {note && <p className="note">Note: {note}</p>}
      {flavor && <p className="flavor">{flavor}</p>}
      <Feeders feeders={feeders} />
    </div>
  );
};

const App = () => {
  return (
    <div className="app">
      <Header next={() => {}} {...metadata[0]} />
      <Body {...metadata[0]} />
    </div>
  );
};

export default App;
