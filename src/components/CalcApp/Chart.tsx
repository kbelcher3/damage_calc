import * as React from "react";
import { Decimal } from "decimal.js";
import { CalcResult } from "../../lib/calc";
import { colorFromIndex } from "../../utils/colors";
import { Build } from "../../lib/build";
import { Modifiers } from "../../lib/modifiers";
import Plotly from "plotly.js-basic-dist";
import createPlotlyComponent from "react-plotly.js/factory";

const Plot = createPlotlyComponent(Plotly);

interface Props {
  modifiers: Modifiers;
  processedBuilds: Array<{ tag: number, build: Build, stats: CalcResult }>;
}

interface ChartMode {
  name: string;
  layout: any;
  derive: (p: Props) => any;
}

interface State {
  pBuilds: any;
  pModifiers: any;
  mode: ChartMode;
  data: any; layout: any; frames: any; config: any;
}

const perShotMode: ChartMode = {
  name: "Inflicted Damage per Shot",
  layout: {
    xaxis: {
      title: "Percentile",
      range: [0, 1],
      tickformat: ".2%",
    },
    yaxis: {
      title: "Total Inflicted Damage per Shot",
      rangemode: "tozero",
    },
    autosize: true,
    margin: { l: 60, r: 60, t: 20, b: 70 },
  },
  derive: (props: Props) => {
    const plotData = props.processedBuilds.map(item => {
      const calculated = item.stats;
      const steps = calculated.damageSteps;
      const trace: any = { x: [], y: [], hovertext: [] };
      [...steps, steps[steps.length - 1]].reduce((lastpos, step) => {
        trace.x.push(lastpos.toNumber());
        trace.y.push(calculated.damageAmount.mul(step[1]).toNumber());
        trace.hovertext.push(step[2]);
        return lastpos.add(step[0]);
      }, new Decimal(0));

      return {
        ...trace,
        type: "scatter",
        line: { shape: "hv", color: colorFromIndex(item.tag) },
        mode: "lines+points",
        name: `(${item.tag + 1}) ${item.build.descriptionFormatted}`,
      };
    });

    // Add guide
    const levelScaling = props.modifiers.enemy.levelScaling();
    const level = props.modifiers.enemy.level || props.modifiers.enemy.stats.defaultLevel;
    const hp = levelScaling.health.toNumber();
    plotData.push({
      type: "scatter",
      mode: "lines+text",
      line: {
        dash: "dot",
        color: "rgb(255, 0, 0)",
      },
      text: [
        `${props.modifiers.enemy.toString()}, Level=${level}, Health=${Math.round(hp)}`,
        "",
      ],
      x: [0, 1],
      y: [hp, hp],
      textposition: "bottom right",
      showlegend: false,
    });
    return plotData;
  },
};
const perSecondMode: ChartMode = {
  name: "Inflicted Damage per Second (Burst DPS)",
  layout: {
    xaxis2: {
      range: [0, 1],
      overlaying: "x",
      showgrid: false,
      showticklabels: false,
    },
    yaxis: {
      title: "Total Inflicted Damage per Second",
      rangemode: "tozero",
    },
    autosize: true,
    margin: { l: 60, r: 60, t: 20, b: 70 },
    showlegend: false,
  },
  derive: (props: Props) => {
    const x: string[] = [];
    const y: number[] = [];
    const color: string[] = [];
    props.processedBuilds.forEach(item => {
      const dps = item.stats.burstDps;

      x.push(`(${item.tag + 1}) ${item.build.descriptionFormatted}`);
      y.push(dps.toNumber());
      color.push(colorFromIndex(item.tag));
    });
    const plotData: any[] = [{
      x: x,
      y: y,
      type: "bar",
      marker: { color: color },
    }];

    // Add guide
    const levelScaling = props.modifiers.enemy.levelScaling();
    const level = props.modifiers.enemy.level || props.modifiers.enemy.stats.defaultLevel;
    const hp = levelScaling.health.toNumber();
    plotData.push({
      type: "scatter",
      mode: "lines+text",
      line: {
        dash: "dot",
        color: "rgb(255, 0, 0)",
      },
      text: [
        `${props.modifiers.enemy.toString()}, Level=${level}, Health=${Math.round(hp)}`,
        "",
      ],
      x: [0, 1],
      y: [hp, hp],
      xaxis: "x2",
      textposition: "bottom right",
      showlegend: false,
    });
    return plotData;
  },
};

export default class Chart extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      // Previous props
      pBuilds: null,
      pModifiers: null,

      // Chart Mode
      mode: perShotMode,

      // Plotly data
      data: [],
      layout: perShotMode.layout,
      frames: [],
      config: {},
    };
  }

  static getDerivedStateFromProps(props: Props, state: State) {
    if (state.pBuilds === props.processedBuilds && state.pModifiers === props.modifiers)
      return null;

    return {
      pBuilds: props.processedBuilds,
      pModifiers: props.modifiers,
      data: state.mode.derive(props),
      layout: state.mode.layout,
    };
  }

  modeChanged = (e: any) => {
    const inputId = e.target.id;
    const mode = inputId === "radio-mode-per-shot" ? perShotMode : perSecondMode;
    this.setState({
      mode: mode,
      layout: mode.layout,
      data: mode.derive(this.props),
    });
  }

  render() {
    return (
      <div>
        <div className="card">
          <div className="card-body">
            <div style={{width: "100%", paddingTop: "40%", position: "relative"}}>
              {(Plot !== undefined
                ? <Plot
                    data={this.state.data}
                    layout={this.state.layout}
                    frames={this.state.frames}
                    config={this.state.config}
                    useResizeHandler={true}
                    style={{position: "absolute", top: 0, left: 0, right: 0, bottom: 0}} />
                : <div className="spinner-border" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
              )}
            </div>
            <div className="form-row align-items-center">
              <div className="col-auto">
                <div className="custom-control custom-radio custom-control-inline">
                  <input type="radio" className="custom-control-input"
                      id="radio-mode-per-shot"
                      checked={this.state.mode === perShotMode}
                      onChange={this.modeChanged} />
                  <label className="custom-control-label" htmlFor="radio-mode-per-shot">
                    {perShotMode.name}
                  </label>
                </div>
                <div className="custom-control custom-radio custom-control-inline">
                  <input type="radio" className="custom-control-input"
                      id="radio-mode-per-second"
                      checked={this.state.mode === perSecondMode}
                      onChange={this.modeChanged} />
                  <label className="custom-control-label" htmlFor="radio-mode-per-second">
                    {perSecondMode.name}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
