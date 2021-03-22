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

const Question = ({ flavor, feeders, note }) => {
  return (
    <div className="question">
      <div className="header">
        <form>
          <input type="text" />
          <input type="submit" value="Guess" />
        </form>
        <div className="response"></div>
      </div>
      <div className="body">
        {note && <p className="note">Note: {note}</p>}
        {flavor && <p className="flavor">{flavor}</p>}
        <Feeders feeders={feeders} />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <div className="app">
      <Question {...metadata[0]} />
    </div>
  );
};

export default App;
