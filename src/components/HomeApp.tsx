import * as React from "react";
import { Link } from "react-router-dom";

interface Props {
}

interface State {
}

export default class HomeApp extends React.PureComponent<Props, State> {
  componentDidMount() {
    document.title = "poepoe.org";
  }

  render() {
    return (
      <div className="container-fluid">
        <section>
          <div className="card-deck my-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Damage Calculator</h5>
                <p>Unya unya poe poe</p>
                <Link to="/calc/">Go</Link>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Overlay PoE Clock</h5>
                <p>A simple overlay Plains of Eidolon clock.</p>
                <Link to="/clock/">Go</Link>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Official Drop Rates / Riven Prices Data</h5>
                <p>The historical raw data files since 2019-03-26 UTC.</p>
                <a href="/warframe/wf-official-data/">Go</a>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}
