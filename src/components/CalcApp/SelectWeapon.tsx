import * as React from "react";
import { ModalSelectCategory, ModalSelectCategorized } from "../Select";
import { Weapon, Weapons } from "../../lib/weapon";
import { RivenCategory } from "../../lib/rivenMod";

const weaponsByRivenCategory: { [cat in RivenCategory]: Weapon[] } =
  { "RIFLE": [], "SHOTGUN": [], "PISTOL": [], "AMP": [], "MELEE": [], "ARCHGUN": [] };
Weapons.forEach(weapon => weaponsByRivenCategory[weapon.rivenCategory].push(weapon));
const options: Array<ModalSelectCategory<Weapon>> =
  Object.keys(weaponsByRivenCategory).map(category => ({
    name: category,
    options: weaponsByRivenCategory[category].map((weapon: Weapon) => {
      const search = [
        weapon.name,
        ...weapon.compatibility,
        weapon.attackType.name,
        weapon.burst !== undefined ? "burst" : "",
      ].join(" ");

      return {
        search: search,
        value: weapon
      };
    }),
  }));

const formatOptionLabel = (weapon: Weapon) => {
  const compatAry = [...weapon.compatibility].reverse();
  compatAry.shift(); // Remove itself
  const compatString = compatAry.join(" < ");
  return (
    <div className="modlike-item modlike-item-left modlike-item-thick weapon-item">
      <strong>{weapon.name}</strong>
      <small className="text-muted" title="Mod Compatibility">
        {compatString}
      </small>
      <span className="weapon-dispo" title="Riven Disposition">
        {weapon.rivenDisposition.toFixed(3)}
      </span>
    </div>
  );
};

interface Props {
  onChange: (selection: Weapon) => void;
  value: Weapon;
}

interface State {
}

export default class SelectWeapon extends React.PureComponent<Props, State> {
  handleChange = (selection: Weapon) => {
    this.props.onChange(selection);
  }

  render() {
    return (
      <ModalSelectCategorized
          value={this.props.value}
          onChange={this.handleChange}
          formatOptionLabel={formatOptionLabel}
          options={options} />
    );
  }
}
