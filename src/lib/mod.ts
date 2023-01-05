import { Decimal } from "decimal.js";
import { DamageType, getDamageTypeName } from "./healthDamageType";
import ModsJSON from "../extracted/mods.json";

export enum ModUpgradeType {
  damage = "damage",
  multishot = "multishot",
  crit_chance = "crit_chance",
  crit_damage = "crit_damage",
  crit_damage_buff_volt_odonata = "crit_damage_buff_volt_odonata",
  elemental = "elemental",
  damage_aimed = "damage_aimed",
  charged_chamber = "charged_chamber",
  headshot_bonus = "headshot_bonus",
  vigilante = "vigilante",

  fire_rate = "fire_rate",
  magazine_size = "magazine_size",
  reload_speed = "reload_speed",
  status_chance = "status_chance",
  status_duration = "status_duration",
  zoom = "zoom",
  recoil = "recoil",
  projectile_speed = "projectile_speed",
  faction_damage = "faction_damage",
  ammo_max = "ammo_max",
  punch_through = "punch_through",

  // Internal use only - not in saves
  sniper_combo = "sniper_combo",
  damage_multiply_roar = "damage_multiply_roar",
  damage_multiply_eclipse = "damage_multiply_eclipse",
  damage_multiply_void_strike = "damage_multiply_void_strike",
  buff_harrow = "buff_harrow",
  switch_headshot = "switch_headshot",
  elemental_nocombine = "elemental_nocombine",

  // Melee
  melee_combo_duration = "melee_combo_duration",
  melee_combo_extra = "melee_combo_extra",
  melee_combo_miss = "melee_combo_miss",
  melee_combo_initial_bonus = "melee_combo_initial_bonus",
  melee_combo_efficiency = "melee_combo_efficiency",
  melee_channeling_efficiency = "melee_channeling_efficiency",
  melee_channeling_damage = "melee_channeling_damage",
  melee_finisher_damage = "melee_finisher_damage",
  melee_range = "melee_range",
}

export const NonScalableModUpgradeTypes = new Set([
  ModUpgradeType.vigilante,
]);

const readableModEffects: {
  [k in ModUpgradeType]: string
} = {
  damage: "Damage",
  multishot: "Multishot",
  crit_chance: "Critical Chance",
  crit_damage: "Critical Damage",
  crit_damage_buff_volt_odonata: "Double Critical Damage (Non-stacking)",
  elemental: "Elemental Damage",
  damage_aimed: "Dead Aim",
  charged_chamber: "Charged Chamber",
  headshot_bonus: "Headshot Multiplier",
  vigilante: "Vigilante Set Mod Buff",

  fire_rate: "Fire Rate",
  magazine_size: "Magazine Capacity",
  reload_speed: "Reload Speed",
  status_chance: "Status Chance",
  status_duration: "Status Duration",
  zoom: "Zoom",
  recoil: "Recoil",
  projectile_speed: "Projectile Flight Speed",
  faction_damage: "Faction Damage",
  ammo_max: "Ammo Maximum",
  punch_through: "Punch Through",

  sniper_combo: "Combo Multiplier",
  damage_multiply_roar: "Damage Multiplier (Rhino Roar)",
  damage_multiply_eclipse: "Damage Multiplier (Mirage Eclipse)",
  damage_multiply_void_strike: "Damage Multiplier (Void Strike)",
  buff_harrow: "Harrow's Covenant",
  switch_headshot: "Headshot",
  elemental_nocombine: "Elemental Damage (Non-Combining)",

  // Melee
  melee_combo_duration: "Combo Duration",
  melee_combo_extra: "melee_combo_extra",
  melee_combo_miss: "melee_combo_miss",
  melee_combo_initial_bonus: "melee_combo_initial_bonus",
  melee_combo_efficiency: "melee_combo_efficiency",
  melee_channeling_efficiency: "Channeling Efficiency",
  melee_channeling_damage: "Channeling Damage",
  melee_finisher_damage: "Finisher Damage",
  melee_range: "Range",
};

export type ModOperationType = "ADD" | "MUL_ADD" | "MUL" | "SET";

const validUpgradeTypes = Object.keys(ModUpgradeType);
export class ModUpgrade {
  constructor(
    readonly upgradeType: ModUpgradeType,
    readonly operationType: ModOperationType,
    readonly argument?: string,
    readonly compatibility?: string,
  ) { }

  static parse(ary: any) {
    if (ary.length !== 4)
      throw new Error("invalid ModUpgrade structure. expected [utype, otype, arg, compat]");
    if (!ary[0].startsWith("xx_") && !validUpgradeTypes.includes(ary[0]))
      throw new Error(`unknown upgrade type: ${ary[0]}`);
    return new ModUpgrade(ary[0], ary[1], ary[2], ary[3]);
  }

  tag(): string {
    return `${this.upgradeType}/${this.operationType}/${this.argument}`;
  }

  toString(): string {
    let ret = "";
    if (this.compatibility)
      ret = `[${this.compatibility}] `;
    switch (this.upgradeType) {
      case ModUpgradeType.elemental:
        ret += getDamageTypeName(this.argument as DamageType);
        break;
      case ModUpgradeType.elemental_nocombine:
        ret += getDamageTypeName(this.argument as DamageType);
        ret += " (Non-Combining)"
        break;
      case ModUpgradeType.faction_damage:
        ret += `${readableModEffects[this.upgradeType]} (${this.argument})`;
        break;
      default:
        let a = readableModEffects[this.upgradeType];
        if (a === undefined)
          a = `'${this.upgradeType}'`;
        let b: string;
        switch (this.operationType) {
          case "MUL_ADD":
            b = "";
            break;
          case "SET":
            b = " :=";
            break;
          default:
            b = ` (${this.operationType})`;
        }
        ret += a + b;
    }
    return ret;
  }

  isPlaceholder() {
    return this.upgradeType.startsWith("xx_");
  }
}

export class ModStat {
  constructor(
    readonly upgrade: ModUpgrade,
    readonly value: Decimal
  ) { }

  static parse(ary: any) {
    if (ary.length !== 2)
      throw new Error("invalid ModStat structure. expected [upgrade, value]");
    return new ModStat(
      ModUpgrade.parse(ary[0]),
      new Decimal(ary[1]));
  }

  isUnsupported(): boolean {
    return this.upgrade.upgradeType.toString().startsWith("xx_");
  }

  toString(): string {
    const bval = this.value.toFixed(3);
    return `${this.upgrade}${this.value.gt(0) ? " +" : " "}${bval}`;
  }

  scale(rank: number): ModStat {
    if (NonScalableModUpgradeTypes.has(this.upgrade.upgradeType))
      return this;
    const obj = Object.create(this);
    obj.value = obj.value.mul(rank + 1);
    return obj;
  }
}

export class Mod {
  constructor(
    readonly name: string,
    readonly compatibility: string,
    readonly stats: ModStat[],
    readonly isUtility: boolean,
    readonly maxRank: number
  ) { }
}

// Import JSON data
export const Mods: Mod[] =
  ModsJSON.map(raw => {
    const upgrades = raw.upgrades.map(ModStat.parse);
    return new Mod(
      raw.name,
      raw.compatibility,
      upgrades,
      raw.is_utility,
      raw.max_rank);
  });
Mods.sort((a, b) => {
  if (a.name > b.name)
    return 1;
  if (a.name < b.name)
    return -1;
  return 0;
});

// Placeholder object
export const ItemCompatibilityAny = "xx_any";
export const PlaceholderEmptyMod = new Mod("+", ItemCompatibilityAny, [], true, 0);
export const PlaceholderRivenMod = new Mod("Riven Mod", ItemCompatibilityAny, [], false, 0);

const modsByName: { [key: string]: Mod } = {};
Mods.forEach(mod => modsByName[mod.name] = mod);
modsByName["+"] = PlaceholderEmptyMod;
modsByName["Riven Mod"] = PlaceholderRivenMod;

export function getMod(name: string): Mod {
  const ret = modsByName[name];
  if (ret === undefined)
    throw new Error("unknown mod: " + name);
  return ret;
}

// Mod Fixes (TODO: Should be configurable)
{
  // At 12x combo
  const bloodRush = modsByName["Blood Rush"];
  (bloodRush.stats[0] as any).value = new Decimal(4.4);
}
