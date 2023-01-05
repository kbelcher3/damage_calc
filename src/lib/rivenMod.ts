import { Decimal } from "decimal.js";
import { ModUpgrade, ModUpgradeType, ModStat } from "./mod";
import { Weapon } from "./weapon";
import RivenUpgradesJSON from "../extracted/riven_upgrades.json";

export type RivenCategory =
  "RIFLE" | "SHOTGUN" | "PISTOL" | "AMP" | "MELEE" | "ARCHGUN";

export class RivenUpgrade {
  constructor(
    readonly upgrades: ModUpgrade[],
    readonly values: { [cat in RivenCategory]: Decimal }
  ) { }

  tag() {
    switch (this.upgrades[0].upgradeType) {
      case ModUpgradeType.elemental:
      case ModUpgradeType.faction_damage:
        return this.upgrades[0].argument;
      default:
        return this.upgrades[0].upgradeType;
    }
  }
}

export class RivenModStat {
  constructor(
    readonly upgrade: RivenUpgrade,
    readonly value: Decimal
  ) { }

  toString(): string {
    const bval = this.value.toFixed(3);
    return `${this.upgrade.upgrades[0]}${this.value.gt(0) ? " +" : " "}${bval}`;
  }
}

export type RivenModStatOrNull = RivenModStat | null;

export class RivenMod {
  readonly set: [
    RivenModStatOrNull, RivenModStatOrNull, RivenModStatOrNull, RivenModStatOrNull
  ];

  constructor(ary: RivenModStatOrNull[] = [null, null, null, null]) {
    // FIXME: CHECK
    this.set = ary as any;
  }

  get stats(): ModStat[] {
    const ret: ModStat[] = [];
    this.set.forEach(item => {
      if (item === null)
        return;
      item.upgrade.upgrades.forEach(upgrade => {
        ret.push(new ModStat(upgrade, item.value));
      });
    });
    return ret;
  }

  serialize(): any {
    return this.set.map(item => {
      if (item === null)
        return null;
      return [
        item.upgrade.tag(),
        item.value.toNumber()
      ];
    });
  }

  static deserialize(obj: any) {
    if (obj.length !== 4)
      throw new Error(`invalid riven mod stats length: ${obj.length}`);
    const set = obj.map((item: any) => {
      if (item === null)
        return null;
      const upgrade = RivenUpgrades[item[0]];
      const value = new Decimal(item[1]);
      if (upgrade === undefined)
        throw new Error(`unknown riven upgrade: ${item[0]}`);
      return new RivenModStat(upgrade, value);
    });
    return new RivenMod(set);
  }
}


export function averageRivenStats(weapon: Weapon, effects: Array<RivenUpgrade | null>) {
  const zero = new Decimal(0);
  if (!effects[0] || !effects[1])
    return [zero, zero, zero, zero];

  const dispo = weapon.rivenDisposition!;
  const f = (key: RivenUpgrade, mul: number) => {
    return new Decimal(key.values[weapon.rivenCategory])
      .mul(10) // ????
      .mul(9) // Mod rank 8/8
      .mul(1.5) // SpecificFitAttenuation
      .mul(dispo)
      .mul(mul);
  };

  if (!effects[2]) {
    if (effects[3]) { // +2-1
      const mul = 1.25 * 0.66;
      const cmul = -0.33;
      return [f(effects[0]!, mul), f(effects[1]!, mul),
        zero, f(effects[3]!, cmul)];
    } else { // +2-0
      const mul = 0.66;
      return [f(effects[0]!, mul), f(effects[1]!, mul),
        zero, zero];
    }
  } else {
    if (effects[3]) { // +3-1
      const mul = 1.25 * 0.5;
      const cmul = -0.5;
      return [f(effects[0]!, mul), f(effects[1]!, mul),
        f(effects[2]!, mul), f(effects[3]!, cmul)];
    } else { // +3-0
      const mul = 0.5;
      return [f(effects[0]!, mul), f(effects[1]!, mul),
        f(effects[2]!, mul), zero];
    }
  }
}


// Import JSON data
export const RivenUpgrades: { [key: string]: RivenUpgrade } = {};
export const RivenUpgradeByXTag: { [xtag: string]: RivenUpgrade } = {};
Object.keys(RivenUpgradesJSON).forEach(rivenCategory => {
  RivenUpgradesJSON[rivenCategory].upgrades.forEach((item: any) => {
    // The only exception would be Fire Rate (double for Bows)
    if (item.upgrades.length > 1)
      if (item.upgrades.length !== 2 ||
        item.upgrades[0][0] !== item.upgrades[1][0] ||
        (item.upgrades[0][0] !== ModUpgradeType.fire_rate &&
          item.upgrades[0][0] !== ModUpgradeType.crit_chance))
        throw new Error("unexpected riven upgrade");
    let tag: string;
    switch (item.upgrades[0][0]) {
      case ModUpgradeType.elemental:
      case ModUpgradeType.faction_damage:
        tag = item.upgrades[0][2]; // Argument
        break;
      default:
        tag = item.upgrades[0][0]; // type
    }
    let upgrade = RivenUpgrades[tag];
    if (upgrade === undefined) {
      const parsed = item.upgrades.map((u: any) => ModUpgrade.parse(u));
      upgrade = RivenUpgrades[tag] = new RivenUpgrade(parsed, {
        RIFLE: new Decimal(0),
        SHOTGUN: new Decimal(0),
        PISTOL: new Decimal(0),
        AMP: new Decimal(0),
        MELEE: new Decimal(0),
        ARCHGUN: new Decimal(0),
      });
    }
    upgrade.values[rivenCategory] = new Decimal(item.value);
    RivenUpgradeByXTag[item.tag] = upgrade;
  });
});
