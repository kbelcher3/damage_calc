import * as React from "react";
import { Decimal } from "decimal.js";
import { Weapon } from "../../lib/weapon";
import { RivenMod, RivenUpgrade, RivenModStat, averageRivenStats } from "../../lib/rivenMod";
import SelectRivenUpgrade from "./SelectRivenUpgrade";

interface EditingRivenStatItem {
  upgrade: RivenUpgrade | null;
  value: Decimal;
  expectedValue: Decimal;
}

interface Props {
  onChange: (riven: RivenMod) => void;
  weapon: Weapon;
  value: RivenMod;
}

interface State {
  pValue: any;
  pWeapon: any;
  stats: EditingRivenStatItem[];
}

function fixExpectedValues(props: Props, ary: Array<{ upgrade: RivenUpgrade | null, value: Decimal }>) {
  const average = averageRivenStats(props.weapon, ary.map(i => i.upgrade));
  return ary.map((item, i) => ({ ...item, expectedValue: average[i] }));
}

function propsToState(props: Props) {
  const ary = props.value.set.map(gstat => gstat || { upgrade: null, value: new Decimal(0) });

  return {
    pValue: props.value,
    pWeapon: props.weapon,
    stats: fixExpectedValues(props, ary),
  };
}

export default class RivenEditor extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      ...propsToState(props),
    };
  }

  static getDerivedStateFromProps(props: Props, state: State) {
    if (props.value === state.pValue && props.weapon === state.pWeapon)
      return null;
    return {
      ...propsToState(props),
    };
  }

  emitOnChange = () => {
    const stats = this.state.stats.map((i, xi) =>
      i.upgrade ? new RivenModStat(i.upgrade, i.value) : null);
    this.props.onChange(new RivenMod(stats));
  }

  handleRivenEffectChangeGen = (index: number) => ((selection: RivenUpgrade | null) => {
    const ary = [...this.state.stats];
    ary[index] = { ...ary[index], upgrade: selection };

    this.setState({ stats: fixExpectedValues(this.props, ary) }, this.emitOnChange);
  })

  handleRivenValueChange = (event: any) => {
    const index = parseInt(event.target.attributes["data-riven-stats-index"].value, 10);
    const value = parseFloat(event.target.value === "" ? "0" : event.target.value);

    const ary = [...this.state.stats];
    ary[index] = { ...ary[index], value: new Decimal(value) };

    this.setState({ stats: ary }, this.emitOnChange);
  }

  handleRivenValueChangeRange = (event: any) => {
    const index = parseInt(event.target.attributes["data-riven-stats-index"].value, 10);
    const ary = [...this.state.stats];

    let value = parseFloat(event.target.value === "" ? "0" : event.target.value);
    if (Math.abs(Math.sign(value)) === 1 &&
      Math.sign(value) !== Math.sign(ary[index].value.toNumber()))
      value = -value;

    ary[index] = { ...ary[index], value: new Decimal(value) };

    this.setState({ stats: ary }, this.emitOnChange);
  }

  fillRivenStats = (event: any) => {
    event.preventDefault();
    const ary = this.state.stats.map(item => ({
      ...item,
      value: item.expectedValue.mul(10000).round().div(10000),
    }));
    this.setState({ stats: ary }, this.emitOnChange);
  }

  fillRivenStatsMax = (event: any) => {
    event.preventDefault();
    const ary = this.state.stats.map(item => ({
      ...item,
      value: item.expectedValue.mul(1.1).mul(10000).trunc().div(10000),
    }));
    this.setState({ stats: ary }, this.emitOnChange);
  }

  render() {
    return (
      <div>
                <div>
                  <small className="form-text text-muted">Autofill numbers:</small>
                  <ul>
                    <li>
                      <small><a href="#" onClick={this.fillRivenStatsMax}>Max</a></small>
                    </li>
                    <li>
                      <small><a href="#" onClick={this.fillRivenStats}>Average</a></small>
                    </li>
                  </ul>
                </div>
        {this.state.stats.map((item, index) =>
        <div className="form-group" key={index}>
          <div className="form-row">
            <small className="col-2 d-block form-text text-muted">{index < 3 ? `Buff ${index+1}` : "Curse"}</small>
            {item.upgrade ?
            <div className={"col-2 d-block " + (
                item.expectedValue.abs().mul(0.9).gt(item.value.abs()) ||
                item.expectedValue.abs().mul(1.1).lt(item.value.abs())
                  ? "invalid-feedback" : "valid-feedback")}>
              Value range:{" "}
              [{item.expectedValue.mul(0.9).toFixed(3)},{" "}
              {item.expectedValue.mul(1.1).toFixed(3)}]{" "}
              ({item.expectedValue.abs().lt(item.value.abs()) && "+"}
              {item.value.abs().div(item.expectedValue.abs()).sub(1).mul(100).toFixed(2)}%)
            </div> : <div className="col-10 d-block valid-feedback">&nbsp;</div>
            }
          </div>
          <div className="form-row align-items-center">
            <div className="col-2">
              <SelectRivenUpgrade
                  value={item.upgrade}
                  onChange={this.handleRivenEffectChangeGen(index)} />
            </div>
            <input type="number" step="0.001" className={"col-2 form-control mt-1" +
              (!item.upgrade ? "" :
                  item.expectedValue.abs().mul(0.9).gt(item.value.abs()) ||
                  item.expectedValue.abs().mul(1.1).lt(item.value.abs())
                    ? " is-invalid" : " is-valid")}
                value={item.value.toNumber()}
                data-riven-stats-index={index}
                onChange={this.handleRivenValueChange} />
            <span className="col-auto">{item.expectedValue.mul(0.9).toFixed(3)}</span>
            <input type="range" className="col form-control-range custom-range"
                min={item.expectedValue.mul(0.9).abs().toNumber()}
                max={item.expectedValue.mul(1.1).abs().toNumber()}
                step="0.001"
                disabled={!item.upgrade}
                value={item.value.abs().toNumber()}
                data-riven-stats-index={index}
                onChange={this.handleRivenValueChangeRange} />
            <span className="col-auto">{item.expectedValue.mul(1.1).toFixed(3)}</span>
          </div>
        </div>
        )}
      </div>
    );
  }
}
