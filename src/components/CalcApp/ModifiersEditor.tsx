import * as React from "react";
import {
  ModifierDefinition,
  ModifierDefinitionOptions,
  Modifier,
  ModifierDefinitions,
} from "../../lib/modifiers";
import { ModalSelectCategory, ModalSelectCategorized } from "../Select";

const modifierOptions: Array<ModalSelectCategory<ModifierDefinition<any>>> =
  Object.entries(ModifierDefinitions).map(([category, defs]) => ({
    name: category,
    options: defs.map(def => ({
      search: `${def.name} ${def.valueDescription}`,
      value: def,
    })),
  }));

const formatOptionLabel = (def: ModifierDefinition<any>) => {
  return (
    <div className="modlike-item modlike-item-left">
      <strong>{def.name}</strong>
      {def.valueDescription &&
          <small className="text-muted">{" "}({def.valueDescription})</small>}
      {def.apply(def.valueDefault, undefined).map((item, i) =>
        <small className="text-muted" key={i}>{item.upgrade.toString()}</small>)}
    </div>
  );
};

interface Props {
  modifiers: Array<Modifier<any>>;
  modifiersParameters?: ModifierDefinitionOptions;
  onChange: (modifiers: Array<Modifier<any>>) => void;
}

interface State {
}

export default class ModifiersEditor extends React.PureComponent<Props, State> {
  handleBuffRemove = (event: any) => {
    event.preventDefault();
    const index = parseInt(event.target.attributes["data-buff-index"].value, 10);
    const ary = [...this.props.modifiers];
    ary.splice(index, 1);
    this.props.onChange(ary);
  }

  handleBuffParameterChange = (event: any) => {
    const index = parseInt(event.target.attributes["data-buff-index"].value, 10);
    const ary = [...this.props.modifiers];
    const old = ary[index];
    if (old.definition.valueDefault === true || old.definition.valueDefault === false) {
      ary[index] = new Modifier(old.definition, event.target.checked);
    } else if (typeof old.definition.valueDefault === "number") {
      ary[index] = new Modifier(old.definition, parseFloat(event.target.value));
    }
    this.props.onChange(ary);
  }

  handleBuffNewChange = (selection: ModifierDefinition<any>) => {
    const ary = [
      ...this.props.modifiers,
      new Modifier(selection, selection.valueDefault)
    ];
    this.props.onChange(ary);
  }

  optionsFilter = (item: ModifierDefinition<any>) => {
    if (!item.isApplicable)
      return true;
    return item.isApplicable(this.props.modifiersParameters);
  }

  render() {
    return (
      <div>
        {this.props.modifiers.map((pbuff, index) =>
          !pbuff.definition.isApplicable ||
              pbuff.definition.isApplicable(this.props.modifiersParameters) ?
        <div className="form-group form-row form-inline" key={index}>
          <div className="col">
            <span>
              {pbuff.definition.name}
              {pbuff.definition.valueDescription &&
                  <small className="text-muted">{" "}({pbuff.definition.valueDescription})</small>}
            </span>
            {pbuff.definition.valueDefault === true || pbuff.definition.valueDefault === false ?
            <input type="checkbox" className="form-control w-100 form-check-input"
                data-buff-index={index}
                checked={pbuff.value}
                onChange={this.handleBuffParameterChange} /> : pbuff.definition.valueDefault !== undefined ?
            <input type="number" className="form-control w-100"
                data-buff-index={index}
                value={pbuff.value}
                onChange={this.handleBuffParameterChange} /> :
            <div />
            }
          </div>
          <span className="col-auto">→</span>
          <div className="col modlike-item modlike-item-left">
            {pbuff.modStats(this.props.modifiersParameters).map((item, xi) =>
            <small className="text-muted" key={xi}>{item.toString()}</small>
            )}
          </div>
          <div className="col-auto">
            {!pbuff.definition.isApplicable &&
            <a href="#"
                data-buff-index={index}
                onClick={this.handleBuffRemove}>×</a>}
          </div>
        </div> : <div key={index} />)}
        <ModalSelectCategorized
            value={"kak" as any}
            onChange={this.handleBuffNewChange}
            formatOptionLabel={formatOptionLabel}
            optionsFilter={this.optionsFilter}
            options={modifierOptions}>
          <div className="modlike-item modlike-item-left">+</div>
        </ModalSelectCategorized>
      </div>
    );
  }
}
