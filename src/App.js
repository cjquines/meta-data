import React from "react";
import "./App.scss";

import * as metadata from "./metadata.json";

const Feeders = ({ feeders }) => {
  return (
    <ul>
      {feeders.map((c) => (
        <li>{c}</li>
      ))}
    </ul>
  );
};

const Header = ({ answer, tags, next, source }) => {
  return (
    <div className="header">
      <div className="source">
        <a href={source.link}>
          {source.hunt} {source.year}
        </a>
        <button onclick={next()}>New meta</button>
      </div>
      <form>
        <input type="text" />
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
