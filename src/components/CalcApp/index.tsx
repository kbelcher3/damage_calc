import * as React from "react";
import CalcOptions from "./CalcOptions";
import Chart from "./Chart";
import ShowcaseItem from "./ShowcaseItem";
import { Build } from "../../lib/build";
import { Modifiers } from "../../lib/modifiers";
import { Calculate, CalcResult } from "../../lib/calc";
import { encodeBase64, decodeBase64 } from "../../utils/base64";

class AnnotatedBuild {
  readonly tag: number;
  readonly build: Build;
  readonly stats: CalcResult;

  constructor(tag: number, build: Build, stats: CalcResult) {
    this.tag = tag;
    this.build = build;
    this.stats = stats;
  }
}

interface SavedData {
  builds: any[];
  modifiers: any;
}

interface Props {
}

interface State {
  tagNext: number;
  builds: AnnotatedBuild[];
  modifiers: Modifiers;
}

export default class CalcApp extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    const modifiers = Modifiers.createEmpty();
    const build = Build.createEmpty();
    const buildm = new AnnotatedBuild(0, build, Calculate(build, modifiers));

    this.state = {
      tagNext: 1,
      builds: [buildm],
      modifiers: modifiers,
    };
  }

  componentDidMount() {
    document.title = "Warframe Damage Calculator - poepoe.org";

    if (window.location.hash === "")
      return;
    const str = window.location.hash.substring(1);
    try {
      if (str.includes("&")) {
        const builds = str.split("&").map((pair, xi) => {
          const [, encoded] = pair.split("=", 2);
          const build = Build.deserialize(JSON.parse(decodeBase64(encoded)));
          return new AnnotatedBuild(xi, build, Calculate(build, this.state.modifiers));
        });
        this.setState({ builds: builds, tagNext: builds.length });
      } else {
        const savedData: SavedData = JSON.parse(decodeBase64(str));
        const modifiers = Modifiers.deserialize(savedData.modifiers);
        const builds = savedData.builds.map((obj, i) => {
          const build = Build.deserialize(obj);
          return new AnnotatedBuild(i, build, Calculate(build, modifiers));
        });
        this.setState({ builds: builds, modifiers: modifiers, tagNext: builds.length });
      }
    } catch (e) {
      console.log("unable to restore previous state: " + e);
      console.log(e.stack);
      console.log("previous state:");
      try {
        console.log(JSON.parse(decodeBase64(str)));
      } catch (e) {
        console.log(str);
      }
    }
  }

  componentDidUpdate(prevProps: Props, prevState: Props, snapshot: any) {
    const savedData: SavedData = {
      builds: this.state.builds.map(buildm => buildm.build.serialize()),
      modifiers: this.state.modifiers.serialize(),
    };
    const str = "#" + encodeBase64(JSON.stringify(savedData));
    if (window.location.hash !== str)
      window.location.hash = str;
  }

  handleModifiersChange = (modifiers: Modifiers) => {
    const builds = this.state.builds.map(buildm =>
      new AnnotatedBuild(buildm.tag, buildm.build, Calculate(buildm.build, modifiers)));
    this.setState({ modifiers: modifiers, builds: builds });
  }

  handleDeleteBuild = (tag: number) => {
    const builds = this.state.builds.filter(item => item.tag !== tag);
    this.setState({ builds: builds });
  }

  handleCopyBuild = (tag: number) => {
    const builds = [...this.state.builds];
    const orig = builds.find(item => item.tag === tag)!;
    builds.push(new AnnotatedBuild(
      this.state.tagNext,
      orig.build,
      orig.stats
    ));
    this.setState({ builds: builds, tagNext: this.state.tagNext + 1 });
  }

  handleUpdateBuild = (tag: number, build: Build) => {
    const builds = [...this.state.builds];
    const index = builds.findIndex(item => item.tag === tag)!;
    builds[index] = new AnnotatedBuild(
      builds[index].tag,
      build,
      Calculate(build, this.state.modifiers)
    );
    this.setState({ builds: builds });
  }

  handleCreateBuild = (event: any) => {
    event.preventDefault();
    const build = Build.createEmpty();
    const buildm = new AnnotatedBuild(
      this.state.tagNext,
      build,
      Calculate(build, this.state.modifiers)
    );
    const builds = [...this.state.builds, buildm];
    this.setState({ builds: builds, tagNext: this.state.tagNext + 1 });
  }

  render() {
    const modifiers = this.state.modifiers;
    const data = this.state.builds;

    return (
      <div className="container-fluid">
        <section>
          <CalcOptions
              modifiers={modifiers}
              onChange={this.handleModifiersChange} />
        </section>
        <section>
          <div className="card my-4">
            <div className="card-body">
              <h5 className="card-title">Builds</h5>
              <div className="my-4">
                <ul className="list-group list-group-flush showcase-builds">
                  {data.map(item =>
                    <ShowcaseItem
                        key={item.tag}
                        modifiers={modifiers}
                        annotatedBuild={item}
                        onDeleteBuild={this.handleDeleteBuild}
                        onCopyBuild={this.handleCopyBuild}
                        onUpdateBuild={this.handleUpdateBuild} />
                  )}
                </ul>
                <small>
                  <a href="#"
                      onClick={this.handleCreateBuild}>New</a>
                </small>
              </div>
              <Chart
                  modifiers={modifiers}
                  processedBuilds={data} />
            </div>
          </div>
        </section>
        <section>
          <div className="card my-4">
            <div className="card-body">
              <h5 className="card-title">News</h5>
              <div className="my-4">
                <p>
                  <b>This is currently being reworked. You WILL hit bugs.
                  Please tell me ANYTHING that you think I should change.
                  Email address and Discord username are at the bottom of the page.</b>
                </p>
                TODOs:
                <ul>
                  <li>Kuva Weapons' elemental damage bonus</li>
                  <li>Projectile weapons that deal damage both on contact and on explosion.</li>
                  <li>Drag & drop to exchange two mods</li>
                  <li>Melee support (Note the list already contains melee weapons, but it doesn't work properly.)</li>
                </ul>
                Recent important changes:
                <ul>
                  <li>
                    2020-03-08: Updated enemy scaling mechanism to (hopefully) match U27.2.0. More details at:&nbsp;
                    <a href="https://www.reddit.com/r/Warframe/comments/ff9jgk/s_curve_level_scaling_formula_for_enemy_health/">"S curve" level scaling formula for enemy Health and Shield</a>
                  </li>
                  <li>
                    2020-05-05: Updated status chance calculation to match the current in-game mechanism.
                    Updated enemies and weapons' stats to match U27.4.2.
                  </li>
                  <li>
                    2020-06-12: Updated enemies and weapons' stats to match U28.
                  </li>
                  <li>
                    2020-10-11: Added ability to add a small description for each build. Added Exilus mod slot.
                  </li>
                  <li>
                    2020-10-12: Added experimental support for "scaled damage controllers", only for Eidolons for now.
                    The damage reduction curve seems to vary between enemy units.{" "}
                    <strong>NEED MORE INFO: The calculation is sometimes off by around 1%, which suggests{" "}
                    that the actual mechanism is more complicated than it is currently implemented in this calculator.</strong>
                  </li>
                  <li>
                    2020-10-29: Updated Riven disposition data for U29.3.0.
                  </li>
                  <li>
                    2020-10-31: Added Burst DPS chart. TODO: Fire rate ramp-up (e.g., Gorgon) or damage ramp-up with beam weapons (Ignis) is not handled properly.
                  </li>
                  <li>
                    2021-04-30: Updated weapons and riven disposition data for U30.1.0.
                  </li>
                  <li>
                    2021-05-02: Fixed interaction of Rhino and Mirage buffs.{" "}
                    Updated headshot calculation.
                  </li>
                  <li>
                    2021-08-02: Mod rank is now variable.
                  </li>
                  <li>
                    <b>
                      2021-09-09: U30.7 has been released today, however{" "}
                      Riven disposition and weapon stats on this website are{" "}
                      as of U30.6.1. Unfortunately, I'm extremely busy right now.{" "}
                      It might take a while to bring them up to date.
                    </b>
                  </li>
                  <li>
                    <b>
                      2022-12-18: As you might imagine, this calc is no longer being actively{" "}
                      maintained and there are quite a few discrepancies from the actual game{" "}
                      data. I'm looking for someone interested in taking over and maintaining{" "}
                      it. The snapshot of the source code (React + TypeScript) is available on{" "}
                      request.
                    </b>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}
