import * as React from "react";
import { Modifiers, Modifier, SwitchesValues } from "../../lib/modifiers";
import { Enemy } from "../../lib/enemy";
import EnemyGenerator from "./EnemyGenerator";
import ModifiersEditor from "./ModifiersEditor";

interface Props {
  modifiers: Modifiers;
  onChange: (modifiers: Modifiers) => void;
}

interface State {
}

export default class CalcOptions extends React.PureComponent<Props, State> {
  handleEnemyChange = (newEnemy: Enemy) => {
    this.props.onChange(new Modifiers({
      ...this.props.modifiers,
      enemy: newEnemy,
    }));
  }

  handleSwitchToggle = (event: any) => {
    const key = event.target.name;
    const switches = { ...this.props.modifiers.switches, [key]: event.target.checked };
    this.props.onChange(new Modifiers({
      ...this.props.modifiers,
      switches: switches,
    }));
  }

  handleGlobalModifiersChange = (ary: Array<Modifier<any>>) => {
    this.props.onChange(new Modifiers({
      ...this.props.modifiers,
      globalModifiers: ary,
    }));
  }

  render() {
    const { enemy, switches, globalModifiers } = this.props.modifiers;

    return (
      <div className="card-deck my-4">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Damage Model</h5>
            <EnemyGenerator
                enemy={enemy}
                onChange={this.handleEnemyChange} />
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Options</h5>
            <form>
              <fieldset className="form-group row">
                <div className="col">
                  <small className="form-text text-muted">Options</small>
                  {Object.entries(switches).map(([key, value], index) =>
                    <div className="form-check" key={key}>
                      <label className="form-check-label">
                        <input type="checkbox" className="form-check-input"
                            name={key}
                            checked={value}
                            onChange={this.handleSwitchToggle} />{" "}
                        {SwitchesValues[key][0]}
                      </label>
                    </div>
                  )}
                </div>
              </fieldset>
              <fieldset className="form-group row">
                <div className="col">
                  <small className="form-text text-muted">Global modifiers (applied to all builds below)</small>
                  <ModifiersEditor
                      modifiers={globalModifiers}
                      onChange={this.handleGlobalModifiersChange} />
                </div>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    );
  }
}
