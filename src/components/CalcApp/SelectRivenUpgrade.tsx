import * as React from "react";
import { ModalSelectCategory, ModalSelectCategorized } from "../Select";
import { RivenUpgrade, RivenUpgrades } from "../../lib/rivenMod";

interface Props {
  onChange: (selection: RivenUpgrade | null) => void;
  value: RivenUpgrade | null;
}

interface State { }

const rivenBuffNone = { search: "-", value: null };
const rivenBuffOptions: Array<ModalSelectCategory<RivenUpgrade | null>> = [
  {
    name: "",
    options: [
      rivenBuffNone,
      ...Object.values(RivenUpgrades).map(item => ({
        search: item.upgrades.map(u => u.toString()).join(", "),
        value: item
      })),
    ],
  },
];

const formatRivenUpgradeOptionLabel = (item: RivenUpgrade | null) => {
  return (
    <div className="modlike-item modlike-item-left">
      <strong>{item ? item.upgrades.map(u => u.toString()).join(", ") : "-"}</strong>
    </div>
  );
};

export default class SelectRivenUpgrade extends React.PureComponent<Props, State> {
  render() {
    return (
      <ModalSelectCategorized
          value={this.props.value}
          onChange={this.props.onChange}
          formatOptionLabel={formatRivenUpgradeOptionLabel}
          options={rivenBuffOptions} />
    );
  }
}
