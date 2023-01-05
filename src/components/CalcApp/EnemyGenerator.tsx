import * as React from "react";
import { Decimal } from "decimal.js";
import { ModalSelectCategory, ModalSelectCategorized } from "../Select";
import {
  ResistanceTable,
  HealthType, getHealthTypeName,
  DamageType, getDamageTypeName,
  describeHealthType,
} from "../../lib/healthDamageType";
import {
  Enemy,
  EnemyPreset, CustomEnemyPreset,
  FactionType,
  EnemyPresets,
  BossDamageMitigaion,
} from "../../lib/enemy";
import { applyEnemyResistance } from "../../lib/calc";

const enemyPresetOptions: Array<ModalSelectCategory<EnemyPreset | null>> =
  Object.keys(EnemyPresets).map(faction => ({
    name: faction,
    options: EnemyPresets[faction].map((ep: EnemyPreset, index: number) => ({
      search: `${ep.uniqueName} ${ep.name}`,
      value: ep,
    })),
  }));

const formatPresetOptionLabel = (ep: EnemyPreset | null) => {
  let hastr = "\u00a0"; // &nbsp;
  if (ep !== null) {
    hastr = getHealthTypeName(ep.healthType);
    if (ep.armorBase > 0)
      hastr += " + " + getHealthTypeName(ep.armorType);
  }

  return (
    <div className="modlike-item modlike-item-left">
      <strong>{ep ? ep.name : "-"}</strong>
      <small className="text-muted">{hastr}</small>
    </div>
  );
};

const healthTypeOptions: Array<ModalSelectCategory<HealthType>> = [
  {
    name: "",
    options: Object.keys(HealthType).map(type => ({
      search: describeHealthType(type as HealthType),
      value: type as HealthType,
    })),
  },
];

const formatHealthTypeOptionLabel = (type: HealthType) => {
  const table = ResistanceTable[type];
  const resText = Object.keys(table).map(dType => {
    const modif = -table[dType]!;
    return `${getDamageTypeName(dType as DamageType)}: ${modif > 0 ? "+" : ""}${modif * 100}%`;
  }).join(", ");

  return (
    <div className="modlike-item modlike-item-left">
      <strong>{getHealthTypeName(type)}</strong>
      {resText !== "" && <small className="text-muted">{resText}</small>}
    </div>
  );
};

const factionTypeOptions: Array<ModalSelectCategory<FactionType>> = [
  {
    name: "",
    options: Object.keys(FactionType).map(type => ({
      search: type,
      value: type as FactionType,
    })),
  },
];

const formatFactionTypeOptionLabel = (type: FactionType) => {
  return (
    <div className="modlike-item modlike-item-left">
      <strong>{type}</strong>
    </div>
  );
};

const armorMultipliers = [
  { label: "Not stripped", armorMultiplier: 1 },
  { label: "1x Corrosive Projection", armorMultiplier: 1 - 0.18 * 1 },
  { label: "2x Corrosive Projection", armorMultiplier: 1 - 0.18 * 2 },
  { label: "3x Corrosive Projection", armorMultiplier: 1 - 0.18 * 3 },
  { label: "3x Corrosive Projection + 1x Coaction Drift", armorMultiplier: 1 - 0.18 * 3 - 0.18 * 0.15 * 1 },
  { label: "3x Corrosive Projection + 2x Coaction Drift", armorMultiplier: 1 - 0.18 * 3 - 0.18 * 0.15 * 2 },
  { label: "3x Corrosive Projection + 3x Coaction Drift", armorMultiplier: 1 - 0.18 * 3 - 0.18 * 0.15 * 3 },
  { label: "4x Corrosive Projection", armorMultiplier: 1 - 0.18 * 4 },
  { label: "4x Corrosive Projection + 1x Coaction Drift", armorMultiplier: 1 - 0.18 * 4 - 0.18 * 0.15 * 1 },
  { label: "4x Corrosive Projection + 2x Coaction Drift", armorMultiplier: 1 - 0.18 * 4 - 0.18 * 0.15 * 2 },
  { label: "4x Corrosive Projection + 3x Coaction Drift", armorMultiplier: 1 - 0.18 * 4 - 0.18 * 0.15 * 3 },
  { label: "4x Corrosive Projection + 4x Coaction Drift", armorMultiplier: 1 - 0.18 * 4 - 0.18 * 0.15 * 4 },
  { label: "Completely stripped", armorMultiplier: 0 },
];
const armorMultiplierOptions = [
  {
    name: "",
    options: armorMultipliers.map(i => ({
      search: i.label,
      value: i.armorMultiplier,
    })),
  },
];

const formatArmorMultiplierOptionLabel = (armorMultiplier: number) => {
  const item = armorMultipliers.find(i => i.armorMultiplier === armorMultiplier)!;
  return (
    <div className="modlike-item modlike-item-left">
      <strong>{Math.round(item.armorMultiplier * 10000 - 10000) / 100}%</strong>
      <small>{item.label}</small>
    </div>
  );
};

interface Props {
  enemy: Enemy;
  onChange: (enemy: Enemy) => void;
}

interface State {
  pEnemy: Enemy;
  preset: EnemyPreset | null;
  faction: FactionType;
  armorType: HealthType;
  armorBase: number;
  healthType: HealthType;
  healthBase: number;
  baseLevel: number;
  useDamageMitigation: boolean;
  damageMitigation: BossDamageMitigaion;
  headshotMultiplier: number;
  level?: number;
  armorMultiplier: number;
  armorSubtraction: number;
}

function statsToState(stats: EnemyPreset | CustomEnemyPreset) {
  const dm = stats.damageMitigation || { threshold: 300, multiplier: 0.4, useCriticalHeadshot: true };
  return {
    faction: stats.faction,
    armorType: stats.armorType,
    armorBase: stats.armorBase,
    healthType: stats.healthType,
    healthBase: stats.healthBase,
    baseLevel: stats.baseLevel,
    useDamageMitigation: !!stats.damageMitigation,
    damageMitigation: dm,
    headshotMultiplier: stats.headshotMultiplier,
  };
}

function propsToState(props: Props) {
  const stats = props.enemy.stats;
  return {
    pEnemy: props.enemy,
    preset: stats instanceof EnemyPreset ? stats : null,
    level: props.enemy.level,
    armorMultiplier: props.enemy.armorMultiplier,
    armorSubtraction: props.enemy.armorSubtraction,
    ...statsToState(stats),
  };
}

export default class EnemyGenerator extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      ...propsToState(props),
    };
  }

  static getDerivedStateFromProps(props: Props, state: State) {
    const e = props.enemy;
    if (e === state.pEnemy)
      return null;
    return {
      ...propsToState(props),
    };
  }

  callOnChange() {
    this.props.onChange(this.createEnemy());
  }

  createEnemy(): Enemy {
    if (this.state.preset !== null)
      return new Enemy({
        stats: this.state.preset,
        level: this.state.level,
        armorMultiplier: this.state.armorMultiplier,
        armorSubtraction: this.state.armorSubtraction,
      });
    else {
      const stats = new CustomEnemyPreset({
        armorType: this.state.armorType,
        armorBase: this.state.armorBase,
        healthType: this.state.healthType,
        healthBase: this.state.healthBase,
        shieldType: HealthType.RK_SHIELD,
        shieldBase: 0,
        faction: this.state.faction,
        baseLevel: this.state.baseLevel,
        defaultLevel: this.state.level || 100,
        damageMitigation: this.state.useDamageMitigation ? this.state.damageMitigation : undefined,
        headshotMultiplier: this.state.headshotMultiplier,
      });
      return new Enemy({
        stats: stats,
        level: this.state.level,
        armorMultiplier: this.state.armorMultiplier,
        armorSubtraction: this.state.armorSubtraction,
      });
    }
  }

  handlePresetChange = (selection: EnemyPreset | null) => {
    if (selection !== null) {
      this.setState({
        preset: selection,
        ...statsToState(selection),
      }, this.callOnChange);
    } else
      this.setState({ preset: null }, this.callOnChange);
  }

  handlePresetClear = (event: any) => {
    event.preventDefault();
    if (!this.state.preset)
      return;
    let level = this.state.level;
    if (level === undefined && this.state.preset.defaultLevel !== 100)
      level = this.state.preset.defaultLevel;
    this.setState({ preset: null, level: level }, this.callOnChange);
  }

  handleFactionTypeChange = (selection: FactionType) => {
    this.setState({ faction: selection }, this.callOnChange);
  }

  handleLevelChange = (event: any) => {
    const level = parseInt(event.target.value, 10) || undefined;
    this.setState({ level: level }, this.callOnChange);
  }

  handleArmorTypeChange = (selection: HealthType) => {
    this.setState({ armorType: selection }, this.callOnChange);
  }

  handleHealthTypeChange = (selection: HealthType) => {
    this.setState({ healthType: selection }, this.callOnChange);
  }

  handleBaseArmorChange = (event: any) => {
    const value = parseInt(event.target.value, 10) || 0;
    this.setState({ armorBase: value }, this.callOnChange);
  }

  handleBaseHealthChange = (event: any) => {
    const value = parseInt(event.target.value, 10) || 0;
    this.setState({ healthBase: value }, this.callOnChange);
  }

  handleBaseLevelChange = (event: any) => {
    const value = parseInt(event.target.value, 10) || 0;
    this.setState({ baseLevel: value }, this.callOnChange);
  }

  handleArmorMultiplierChange = (selection: number) => {
    this.setState({ armorMultiplier: selection }, this.callOnChange);
  }

  handleArmorSubtractionChange = (event: any) => {
    const value = parseInt(event.target.value, 10) || 0;
    this.setState({ armorSubtraction: value }, this.callOnChange);
  }

  handleHeadshotMultiplierChange = (event: any) => {
    const value = parseFloat(event.target.value) || 0.0;
    this.setState({ headshotMultiplier: value }, this.callOnChange);
  }

  handleUseDMChange = (event: any) => {
    const value = event.target.checked;
    this.setState({ useDamageMitigation: value }, this.callOnChange);
  }

  handleDMThresholdChange = (event: any) => {
    const value = parseInt(event.target.value, 10) || 0;
    const dm = {
      ...this.state.damageMitigation,
      threshold: value,
    };
    this.setState({ damageMitigation: dm }, this.callOnChange);
  }

  handleDMMultiplierChange = (event: any) => {
    const value = parseFloat(event.target.value) || 0.0;
    const dm = {
      ...this.state.damageMitigation,
      multiplier: value,
    };
    this.setState({ damageMitigation: dm }, this.callOnChange);
  }

  handleDMHeadshotChange = (event: any) => {
    const value = event.target.checked;
    const dm = {
      ...this.state.damageMitigation,
      useCriticalHeadshot: value,
    };
    this.setState({ damageMitigation: dm }, this.callOnChange);
  }

  render() {
    const presetInUse = this.state.preset !== null;
    const enemy = this.createEnemy();
    const enemyScaling = enemy.levelScaling();

    const resistanceMap = Object.values(DamageType).map(t => {
      const map = { [t]: new Decimal(1) };
      return [t, applyEnemyResistance(map, enemy, {})] as [DamageType, Decimal];
    }).filter(([t, i]) => !i.equals(0))
      .sort((a, b) => b[1].toNumber() - a[1].toNumber());

    return (
      <div className="row">
        <div className="col-6">
          <div className="form-row">
            <div className="form-group col-12">
              <small className="form-text text-muted">Preset</small>
              <div className="form-row">
                <div className="col d-flex">
                  <ModalSelectCategorized
                      value={this.state.preset}
                      onChange={this.handlePresetChange}
                      formatOptionLabel={formatPresetOptionLabel}
                      options={enemyPresetOptions} />
                </div>
                {presetInUse &&
                <div className="col-auto d-flex">
                  <button className="btn btn-light" onClick={this.handlePresetClear}>
                    <div className="modlike-item modlike-item-left"><strong>Edit</strong></div>
                  </button>
                </div>}
              </div>
            </div>
          </div>
          <div className="card mx-0 my-1">
            <div className={"card-body" + (presetInUse ? " bg-light" : "")}>
              <div className="form-row">
                <div className="form-group col-6">
                  <small className="form-text text-muted">Faction</small>
                  <ModalSelectCategorized
                      disabled={presetInUse}
                      value={this.state.faction}
                      onChange={this.handleFactionTypeChange}
                      formatOptionLabel={formatFactionTypeOptionLabel}
                      options={factionTypeOptions} />
                </div>
                <div className="form-group col-6">
                  <small className="form-text text-muted">Base Level</small>
                  <input type="number" className="form-control"
                      disabled={presetInUse}
                      value={this.state.baseLevel}
                      onChange={this.handleBaseLevelChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="col-6 form-group">
                  <small className="form-text text-muted">Armor Type</small>
                  <ModalSelectCategorized
                      disabled={presetInUse}
                      value={this.state.armorType}
                      onChange={this.handleArmorTypeChange}
                      formatOptionLabel={formatHealthTypeOptionLabel}
                      options={healthTypeOptions} />
                </div>
                <div className="col-6 form-group">
                  <small className="form-text text-muted">Health Type</small>
                  <ModalSelectCategorized
                      disabled={presetInUse}
                      value={this.state.healthType}
                      onChange={this.handleHealthTypeChange}
                      formatOptionLabel={formatHealthTypeOptionLabel}
                      options={healthTypeOptions} />
                </div>
              </div>
              <div className="form-row">
                <div className="col-6 form-group">
                  <small className="form-text text-muted">Base Armor</small>
                  <input type="number" className="form-control"
                      disabled={presetInUse}
                      value={this.state.armorBase}
                      onChange={this.handleBaseArmorChange} />
                </div>
                <div className="col-6 form-group">
                  <small className="form-text text-muted">Base Health</small>
                  <input type="number" className="form-control"
                      disabled={presetInUse}
                      value={this.state.healthBase}
                      onChange={this.handleBaseHealthChange} />
                </div>
              </div>
              <hr />
              <div className="form-row">
                <div className="form-group col"
                    title="Headshot Multiplier bonus from Mods is added to this value. Headshot Critical Multiplier applies separately">
                  <small className="form-text text-muted">Headshot Multiplier (Body Part Multiplier)</small>
                  <input type="number" className="form-control"
                      disabled={presetInUse || !this.state.headshotMultiplier}
                      value={this.state.headshotMultiplier}
                      onChange={this.handleHeadshotMultiplierChange} />
                </div>
              </div>
              <hr />
              <small className="form-text text-muted">
                Boss DR is a special kind of damage reduction mechanism used{" "}
                by certain boss enemy types, such as Eidolons. Particularly,
              </small>
              <small className="form-text text-muted">
                - Critical Multiplier is doubled
              </small>
              <small className="form-text text-muted">
                - Total damage is multiplied by |MULTIPLIER|
              </small>
              <small className="form-text text-muted">
                 - Damage excessing |THRESHOLD|/|FIRE_RATE|/|PELLETS| is{" "}
                multiplied further by 0.1
              </small>
              <small className="form-text text-muted">
                 - Critical Headshot Multiplier may be ignored, which is otherwise{" "}
                almost universally 2x
              </small>
              <div className="form-row">
                <div className="form-group col-auto"
                    title="">
                  <small className="form-text text-muted">Enable</small>
                  <input type="checkbox" className="form-control"
                      disabled={presetInUse}
                      checked={this.state.useDamageMitigation}
                      onChange={this.handleUseDMChange} />
                </div>
                <div className="form-group col">
                  <small className="form-text text-muted">Threshold</small>
                  <input type="number" className="form-control"
                      disabled={presetInUse || !this.state.useDamageMitigation}
                      value={this.state.damageMitigation.threshold}
                      onChange={this.handleDMThresholdChange} />
                </div>
                <div className="form-group col">
                  <small className="form-text text-muted">Multiplier</small>
                  <input type="number" className="form-control"
                      disabled={presetInUse || !this.state.useDamageMitigation}
                      value={this.state.damageMitigation.multiplier}
                      onChange={this.handleDMMultiplierChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group col-auto"
                    title="Normally, a critical headshot hit deals |BaseDmg| x |CritMultiplier| x |BodyPartMultiplier| x |CriticalHeadshotMultiplier|. Certain bosses (i.e., Eidolons) ignore CriticalHeadshotMultiplier.">
                  <small className="form-text text-muted">Use Critical Headshot Multiplier (2x)</small>
                  <input type="checkbox" className="form-control"
                      disabled={presetInUse || !this.state.useDamageMitigation}
                      checked={this.state.damageMitigation.useCriticalHeadshot}
                      onChange={this.handleDMHeadshotChange} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6">
          <div className="card mx-0 mb-4">
            <div className="card-body">
              <div className="card-title">
                <small className="form-text text-muted">Level Scaling and Debuffs</small>
              </div>
              <div className="mb-2">
                <div className="form-group">
                  <small className="form-text text-muted">Current Level</small>
                  <input type="number" className="form-control"
                      value={this.state.level}
                      placeholder={enemy.stats.defaultLevel.toString()}
                      onChange={this.handleLevelChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group col">
                  <small className="form-text text-muted">Corrosive Projection Aura</small>
                  <ModalSelectCategorized
                      value={this.state.armorMultiplier}
                      onChange={this.handleArmorMultiplierChange}
                      formatOptionLabel={formatArmorMultiplierOptionLabel}
                      options={armorMultiplierOptions} />
                </div>
                <div className="form-group col" title="Example: '120' for 20x Shattering Impact hits">
                  <small className="form-text text-muted">Base Armor Reduction</small>
                  <input type="number" className="form-control"
                      value={this.state.armorSubtraction}
                      onChange={this.handleArmorSubtractionChange} />
                </div>
              </div>
            </div>
          </div>
          <div className="card mx-0 my-1 mb-2">
            <div className="card-body">
              <div className="mb-2">
                <small className="form-text text-muted">Enemy Level Scaling</small>
                <div className="form-row text-muted">
                  <dl className="my-0 mr-1 col">
                    <dt>Armor</dt>
                    <dd>{enemyScaling.armor.toFixed(3)}</dd>
                  </dl>
                  <dl className="my-0 mr-1 col">
                    <dt>Health</dt>
                    <dd>{enemyScaling.health.toFixed(3)}</dd>
                  </dl>
                </div>
              </div>
              <div className="mb-2">
                <small className="form-text text-muted">Effectiveness per Damage Type</small>
                <div className="form-row text-muted">
                  {resistanceMap.map(([type, value]) =>
                  <dl className="my-0 mr-1 col" key={type}>
                    <dt>{getDamageTypeName(type)}</dt>
                    <dd>{value.mul(100).toFixed(0)}%</dd>
                  </dl>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
