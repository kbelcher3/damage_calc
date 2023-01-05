import "react-app-polyfill/stable";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import "./index.scss";

const HomeApp = React.lazy(() => import("./components/HomeApp"));
const ClockApp = React.lazy(() => import("./components/ClockApp"));
const CalcApp = React.lazy(() => import("./components/CalcApp"));

const LoadingMessage = () => (
  <div className="container-fluid">
    <p>Loading...</p>
  </div>
);

const App = () => (
  <div>
    <nav className="navbar navbar-dark bg-dark">
      <span className="navbar-brand">∧,,,∧</span>
      <ul className="nav">
        <li className="nav-item">
          <Link className="nav-link" to="/calc/">Damage Calculator</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/clock/">Overlay Clock [App]</Link>
        </li>
      </ul>
    </nav>
    <React.Suspense fallback={<LoadingMessage />}>
      <Switch>
        <Route exact={true} path="/"><HomeApp /></Route>
        <Route path="/clock/"><ClockApp /></Route>
        <Route path="/calc/"><CalcApp /></Route>
      </Switch>
    </React.Suspense>
    <footer className="wf-footer">
      <div className="container-fluid">
        <span className="text-muted">
          This is a Warframe fansite mede by poe.{" "}
          Contact me via email (poe@poepoe.org) or Discord (rhe#0907).
        </span>
      </div>
    </footer>
  </div>
);

ReactDOM.render(
  <BrowserRouter basename={"warframe"}>
    <App />
  </BrowserRouter>,
  document.getElementById("root") as HTMLElement
);
