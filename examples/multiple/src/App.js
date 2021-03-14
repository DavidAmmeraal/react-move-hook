import React from "react";
import Movable from "./Movable";

import "./App.css";

function App() {
  return (
    <div className="container">
      <Movable style={{ top: 0, left: 0 }} />
      <Movable style={{ bottom: 0, right: 0 }} />
    </div>
  );
}

export default App;
