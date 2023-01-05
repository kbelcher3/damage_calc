import * as React from "react";
import { ModalSelectCategory, ModalSelectCategorized } from "../Select";
import { Weapon, ItemCompatibility } from "../../lib/weapon";
import { ScaledMod } from "../../lib/build";
import { Mod, Mods, PlaceholderEmptyMod, PlaceholderRivenMod, ItemCompatibilityAny } from "../../lib/mod";
import { RivenMod } from "../../lib/rivenMod";

interface ModSelectCategory extends ModalSelectCategory<Mod> {
  compat: ItemCompatibility;
}

const modsByCompatibility: { [key: string]: Mod[] } = {};
Mods.forEach(mod => {
  let ary = modsByCompatibility[mod.compatibility];
  if (ary === undefined)
    ary = modsByCompatibility[mod.compatibility] = [];
  ary.push(mod);
});
const modOptionsBase: ModSelectCategory[] = [
  { name: "", compat: ItemCompatibilityAny, options: [
    { search: "", value: PlaceholderEmptyMod },
    { search: "Riven Mod", value: PlaceholderRivenMod } ] },
  ...Object.keys(modsByCompatibility).map(compat => ({
    name: compat,
    compat: compat,
    options: modsByCompatibility[compat].map(mod =>
      ({
        search: `${mod.name} (${mod.stats.filter(item => !item.isUnsupported())
            .map(item => item.toString()).join(", ")})`,
        value: mod
      }))
  }))
];

function modsForWeapon(weapon: Weapon, utility: boolean | undefined) {
  let gs = modOptionsBase.filter(g => weapon.isCompatible(g.compat));
  if (utility)
    gs = gs.map(g => ({ ...g, options: g.options.filter(o => o.value.isUtility) }));
  return gs;
}

interface Props {
  onChange: (selection: ScaledMod) => void;
  weapon: Weapon;
  value: ScaledMod;
  riven: RivenMod;
  slot: string;
  utility?: boolean;
}

interface State {
  pWeapon: any;
  optionsForWeapon: ModSelectCategory[];
}

export default class SelectMod extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      pWeapon: props.weapon,
      optionsForWeapon: modsForWeapon(props.weapon, props.utility),
    };
  }

  static getDerivedStateFromProps(props: Props, state: State) {
    if (props.weapon === state.pWeapon)
      return null;
    return {
      pWeapon: props.weapon,
      optionsForWeapon: modsForWeapon(props.weapon, props.utility),
    };
  }

  formatOptionLabel = (mod: Mod) => {
    const weapon = this.props.weapon;
    const riven = this.props.riven;
    const scaledModStats = mod.stats
      .filter(item => !item.isUnsupported())
      .map(s => s.scale(mod.maxRank));
    return (
      <div className="modlike-item modlike-item-center modlike-item-thick">
        <strong>{mod.name}</strong>
        {mod === PlaceholderRivenMod ?
            riven.set.map((item, xi) => item !== null &&
        <small className={xi === 3 ? "text-danger" : "text-muted"} key={xi}>
          {item.toString()}
        </small>)
        : scaledModStats.map((item, xi) =>
        <small className="text-muted" key={xi}>
          {!item.upgrade.compatibility || weapon.isCompatible(item.upgrade.compatibility) ?
          <span>{item.toString()}</span> :
          <del>{item.toString()}</del>}
        </small>)}
        {mod.maxRank > 0 &&
        <small className="modlike-item-rank">
          <div className="rank-indicator">
            {[...Array(mod.maxRank)].map((_, i) =>
            <span key={i}>●</span>)}
          </div>
        </small>}
      </div>
    );
  }

  handleModChange = (selection: Mod) => {
    if (this.props.value.mod !== selection)
      this.props.onChange(new ScaledMod(selection, selection.maxRank));
  }

  handleRankDecrement = (event: any) => {
    event.stopPropagation();
    if (this.props.value.rank > 0)
      this.props.onChange(new ScaledMod(this.props.value.mod, this.props.value.rank - 1));
  }

  handleRankIncrement = (event: any) => {
    event.stopPropagation();
    if (this.props.value.rank < this.props.value.mod.maxRank)
      this.props.onChange(new ScaledMod(this.props.value.mod, this.props.value.rank + 1));
  }

  render() {
    const weapon = this.props.weapon;
    const riven = this.props.riven;
    const smod = this.props.value;
    const mod = smod.mod;
    const rank = smod.rank;

    return (
      <ModalSelectCategorized
          value={this.props.value.mod}
          onChange={this.handleModChange}
          formatOptionLabel={this.formatOptionLabel}
          options={this.state.optionsForWeapon}>
        <div className="modlike-item modlike-item-center modlike-item-thick">
          <strong>{mod.name}</strong>
          <small className="modlike-item-hint">{this.props.slot}</small>
          {mod === PlaceholderRivenMod ?
              riven.set.map((item, xi) => item !== null &&
          <small className={xi === 3 ? "text-danger" : "text-muted"} key={xi}>
            {item.toString()}
          </small>)
          : smod.scaledModStats.filter(item => !item.isUnsupported()).map((item, xi) =>
          <small className="text-muted" key={xi}>
            {!item.upgrade.compatibility || weapon.isCompatible(item.upgrade.compatibility) ?
            <span>{item.toString()}</span> :
            <del>{item.toString()}</del>}
          </small>)}
          {mod.maxRank > 0 &&
          <small className="modlike-item-rank">
            <div className={"rank-adjust-button" + (rank <= 0 ? " disabled" : "")}
                onClick={this.handleRankDecrement}>◂</div>
            <div className="rank-indicator">
              {[...Array(mod.maxRank)].map((_, i) =>
              <span key={i}>{i + 1 <= rank ? "●" : "○"}</span>)}
            </div>
            <div className={"rank-adjust-button" + (rank >= mod.maxRank ? " disabled" : "")}
                onClick={this.handleRankIncrement}>▸</div>
          </small>}
        </div>
      </ModalSelectCategorized>
    );
  }
}
