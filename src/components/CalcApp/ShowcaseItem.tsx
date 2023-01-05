import * as React from "react";
import { CalcResult } from "../../lib/calc";
import { colorFromIndex } from "../../utils/colors";
import { DamageType, getDamageTypeName } from "../../lib/healthDamageType";
import { AttackType } from "../../lib/weapon";
import { Modifier, Modifiers, ModifierDefinitions } from "../../lib/modifiers";
import { Build, ModSet, ScaledMod } from "../../lib/build";
import { getModdingTemplates } from "../../lib/moddingTemplates";
import { Weapon } from "../../lib/weapon";
import { RivenMod } from "../../lib/rivenMod";
import SelectMod from "./SelectMod";
import SelectWeapon from "./SelectWeapon";
import RivenEditor from "./RivenEditor";
import ModifiersEditor from "./ModifiersEditor";

interface AnnotatedBuild {
  tag: number;
  build: Build;
  stats: CalcResult;
}

interface Props {
  modifiers: Modifiers; // For display only
  annotatedBuild: AnnotatedBuild;
  onDeleteBuild: (tag: number) => void;
  onCopyBuild: (tag: number) => void;
  onUpdateBuild: (tag: number, build: Build) => void;
}

interface State {
  expanded: boolean;
}

const StatItem = (props: { header: string, newVal: any, oldVal: any }) => (
  <React.Fragment>
    <dt>{props.header}</dt>
    <dd>
      {props.newVal}
      {props.newVal !== props.oldVal &&
        <small className="text-muted"> [{props.oldVal}]</small>}
    </dd>
  </React.Fragment>
);

export default class ShowcaseItem extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      expanded: false,
    };
  }

  componentDidUpdate() {
    if (this.descriptionRef !== undefined) {
      const fmt = this.props.annotatedBuild.build.description;
      if (this.descriptionRef.innerText !== fmt)
        this.descriptionRef.innerText = fmt;
    }
  }

  toggleExpandBuild = (event: any) => {
    event.preventDefault();
    this.setState({ expanded: !this.state.expanded });
  }

  handleDeleteBuild = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({ expanded: false });
    this.props.onDeleteBuild(this.props.annotatedBuild.tag);
  }

  handleCopyBuild = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    this.props.onCopyBuild(this.props.annotatedBuild.tag);
  }

  handleDescriptionChange = (event: any) => {
    event.preventDefault();
    const element = event.currentTarget;
    const desc = element.innerText;
    if (desc === this.props.annotatedBuild.build.description)
      return;

    const build = new Build({
      ...this.props.annotatedBuild.build,
      description: desc,
    });
    this.props.onUpdateBuild(this.props.annotatedBuild.tag, build);
  }

  handleDescriptionPaste = (event: any) => {
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain");
    document.execCommand("insertHTML", false, text);
  }

  handleWeaponChange = (selection: Weapon) => {
    const localModifiers = this.props.annotatedBuild.build.localModifiers;
    Object.entries(ModifierDefinitions).forEach(([_, mds]) => {
      mds.forEach(md => {
        // Global modifier
        if (!md.isApplicable)
          return;
        // Already exists
        if (localModifiers.find(lm => lm.definition === md))
          return;
        localModifiers.push(new Modifier(md, md.valueDefault));
      });
    });
    const build = new Build({
      ...this.props.annotatedBuild.build,
      weapon: selection,
    });
    this.props.onUpdateBuild(this.props.annotatedBuild.tag, build);
  }

  handleLocalModifiersChange = (ary: Array<Modifier<any>>) => {
    const build = new Build({
      ...this.props.annotatedBuild.build,
      localModifiers: ary,
    });
    this.props.onUpdateBuild(this.props.annotatedBuild.tag, build);
  }

  handleRivenChange = (selection: RivenMod) => {
    const build = new Build({
      ...this.props.annotatedBuild.build,
      riven: selection,
    });
    this.props.onUpdateBuild(this.props.annotatedBuild.tag, build);
  }

  loadModdingTemplateGen = (index: number) => ((event: any) => {
    event.preventDefault();
    const item = getModdingTemplates(this.props.annotatedBuild.build.weapon)[index];
    if (item === undefined)
      throw new Error("[BUG] inconsistent data-template-index");

    const build = new Build({
      ...this.props.annotatedBuild.build,
      mods: item[1],
    });
    this.props.onUpdateBuild(this.props.annotatedBuild.tag, build);
  })

  handleModChangeGen = (index: number) => ((selection: ScaledMod) => {
    const mods = [...this.props.annotatedBuild.build.mods.ordinal];
    mods[index] = selection;
    const modSet = new ModSet(
      mods,
      this.props.annotatedBuild.build.mods.exilus
    );
    const build = new Build({
      ...this.props.annotatedBuild.build,
      mods: modSet,
    });
    this.props.onUpdateBuild(this.props.annotatedBuild.tag, build);
  })

  handleModChangeExilus = ((selection: ScaledMod) => {
    const modSet = new ModSet(
      this.props.annotatedBuild.build.mods.ordinal,
      selection
    );
    const build = new Build({
      ...this.props.annotatedBuild.build,
      mods: modSet,
    });
    this.props.onUpdateBuild(this.props.annotatedBuild.tag, build);
  })

  private descriptionRef?: HTMLElement;
  private setDescriptionRef = (e: HTMLElement) => {
    if (e !== null)
      e.innerText = this.props.annotatedBuild.build.description;
    this.descriptionRef = e;
  }

  render() {
    const { tag, build, stats } = this.props.annotatedBuild;

    return (
      <li className="list-group-item build">
        <div>
          <small className="showcase-build-options">
            <ul className="list-inline wf-list-inline">
              <li className="list-inline-item"><a href="#"
                  onClick={this.toggleExpandBuild}
                  className="text-muted">Show Details</a></li>
              <li className="list-inline-item"><a href="#"
                  onClick={this.handleCopyBuild}
                  className="text-muted">Duplicate</a></li>
              <li className="list-inline-item"><a href="#"
                  onClick={this.handleDeleteBuild}
                  className="text-muted">Delete</a></li>
            </ul>
          </small>
          <div className="row no-gutters build-row">
            <div className="col-auto p-2 build-item-header"
                style={{ backgroundColor: colorFromIndex(tag) }}
                onClick={this.toggleExpandBuild}>
              <span className="badge badge-primary">{tag + 1}</span>
            </div>
            <div className="col">
              <div className="build-item-description p-2"
                  style={{ backgroundColor: colorFromIndex(tag) }}>
                <span className="text-light"
                    contentEditable={true}
                    data-placeholder={build.descriptionFormatted}
                    onBlur={this.handleDescriptionChange}
                    onInput={this.handleDescriptionChange}
                    onPaste={this.handleDescriptionPaste}
                    title="Click to edit"
                    ref={this.setDescriptionRef} />
              </div>
              <div className="row no-gutters p-2">
                <div className="col-2 p-2">
                  <SelectWeapon
                      value={build.weapon}
                      onChange={this.handleWeaponChange} />
                </div>
                <div className="col-2 p-2">
                  <ul>
                    {Object.entries(stats.damageDist)
                      .sort(([_1, value1], [_2, value2]) => value2!.sub(value1!).toNumber())
                      .map(([type, value], xi) =>
                    <li key={xi}>
                      {getDamageTypeName(type as DamageType)}: {value!.mul(100).toFixed(1)}%
                    </li>)}
                  </ul>
                </div>
                <div className="col-auto p-2">
                  {stats.critChance.gte(1) &&
                  <span className="badge badge-primary showcase-badge">
                    Critical Chance ≥ 100%</span>}
                  {this.props.modifiers.switches.enableInnateBuffs &&
                      build.weapon.defaultUpgrades.map((ary, mi) =>
                  <span className="badge badge-secondary showcase-badge" key={mi}>
                    Weapon Buffs:
                    <ul>{ary.map((item, xi) =>
                      <li key={xi}>{item.toString()}</li>)}</ul></span>)}
                  {build.weapon.attackType !== AttackType.Hitscan &&
                  <span className="badge badge-secondary showcase-badge">
                    {build.weapon.attackType.toString()}</span>}
                  {build.weapon.burst !== undefined &&
                  <span className="badge badge-secondary showcase-badge">
                    Burst Shot: {build.weapon.burst.count} rounds with {build.weapon.burst.delay} delay</span>}
                  {build.weapon.applyAbilityStrength !== undefined &&
                  <span className="badge badge-secondary showcase-badge">
                    Affected by Ability Strength</span>}
                </div>
              </div>
              <div className="row no-gutters p-2">
                <div className="col">
                  <div className="row no-gutters">
                    {build.mods.ordinal.map((e, mi) =>
                    <div className="col-3 p-2" key={mi}>
                      <SelectMod
                          value={e}
                          weapon={build.weapon}
                          riven={build.riven}
                          slot={(mi + 1).toString()}
                          onChange={this.handleModChangeGen(mi)} />
                    </div>)}
                  </div>
                </div>
                <div className="col-1d8">
                  <div className="p-2">
                    <SelectMod
                        value={build.mods.exilus}
                        weapon={build.weapon}
                        riven={build.riven}
                        slot="Exilus"
                        utility={true}
                        onChange={this.handleModChangeExilus} />
                  </div>
                </div>
                <div className="col-3 p-2">
                  <ModifiersEditor
                      modifiers={build.localModifiers}
                      modifiersParameters={build.modifiersParameters}
                      onChange={this.handleLocalModifiersChange} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={"collapse" + (this.state.expanded ? " show" : "")}>
          <div className="row no-gutters build-row">
            <div className="col-auto p-2 build-item-header"
              style={{ backgroundColor: colorFromIndex(tag) }}
              onClick={this.toggleExpandBuild} />
            <div className="col">
              <div className="row no-gutters p-2">
                <div className="col-2 p-2">
                  <dl>
                    <dt>Average Damage per Shot</dt>
                    <dd>{stats.damagePerShot.round().toNumber()}</dd>
                    <dt>Burst DPS</dt>
                    <dd>{stats.burstDps.round().toNumber()}</dd>
                    <dt>Sustained DPS</dt>
                    <dd>{stats.sustainedDps.round().toNumber()}</dd>
                    <StatItem header="Pellets per Shot"
                        newVal={stats.pellets.toFixed(2)}
                        oldVal={build.weapon.pellets.toFixed(2)} />
                    <StatItem header="Critical Chance / Multiplier"
                        newVal={`${stats.critChance.mul(100).toFixed(2)}% / ` +
                          `${stats.critDamage.toFixed(2)}x`}
                        oldVal={`${build.weapon.critChance.mul(100).toFixed(2)}% / ` +
                          `${build.weapon.critDamage.toFixed(2)}x`} />
                    <StatItem header="Status Chance per Pellet / per Shot"
                        newVal={`${stats.procChancePerPellet.mul(100).toFixed(2)}% / ` +
                          `${stats.procChance.mul(100).toFixed(2)}%`}
                        oldVal={`${build.weapon.procChance.div(build.weapon.pellets).mul(100).toFixed(2)}% / ` +
                          `${build.weapon.procChance.mul(100).toFixed(2)}%`} />
                    <StatItem header="Magazine Capacity"
                        newVal={stats.magazineSize.toNumber()}
                        oldVal={build.weapon.magazineSize.toNumber()} />
                    <StatItem header="Fire Rate"
                        newVal={stats.fireRate.toFixed(2)}
                        oldVal={build.weapon.fireRate.toFixed(2)} />
                    <StatItem header="Reload Time"
                        newVal={stats.reloadTime.toFixed(2)}
                        oldVal={build.weapon.reloadTime.toFixed(2)} />
                  </dl>
                  <div className="form-group">
                    <small className="form-text text-muted">Load modding template:</small>
                    <ul>
                      {getModdingTemplates(build.weapon).map((item, xi) =>
                        <li key={xi}>
                          <small>
                            <a href="#"
                                onClick={this.loadModdingTemplateGen(xi)}>{item[0]}</a>
                          </small>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
                <div className="col p-2">
                  <RivenEditor
                      weapon={build.weapon}
                      value={build.riven}
                      onChange={this.handleRivenChange} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </li>
    );
  }
}
