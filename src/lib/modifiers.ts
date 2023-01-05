import { Decimal } from "decimal.js";
import { Enemy } from "./enemy";
import { Weapon } from "./weapon";
import { ModStat, ModUpgrade, ModUpgradeType } from "./mod";

export interface ModifierDefinitionOptions {
  weapon?: Weapon;
}

export class ModifierDefinition<T> {
  static definitionsTable: { [key: string]: ModifierDefinition<any> } = {};

  constructor(
    readonly id: string,
    readonly name: string,
    readonly valueDescription: string | undefined,
    readonly valueDefault: T | undefined,
    readonly apply: (value: T, options?: ModifierDefinitionOptions) => ModStat[],
    readonly isApplicable?: (options?: ModifierDefinitionOptions) => boolean
  ) {
    ModifierDefinition.definitionsTable[id] = this;
  }

  serialize(): any {
    return this.id;
  }

  static deserialize(obj: any): ModifierDefinition<any> {
    const def = this.definitionsTable[obj];
    if (def === undefined)
      throw new Error(`Unknown ModifierDefinition: id=${obj}`);
    return def;
  }
}

// Buff definitions
export const ModifierDefinitions: { [key: string]: Array<ModifierDefinition<any>> } = {
  "Aura Mods": [
    new ModifierDefinition("aura-dead-eye", "Dead Eye", "Use Coaction Drift", false, cd => [
      new ModStat(
        new ModUpgrade(ModUpgradeType.damage, "MUL_ADD", undefined, "SNIPER"),
        new Decimal(0.525).mul(cd ? 1.15 : 1))
    ]),
    new ModifierDefinition("aura-rifle-amp", "Rifle Amp", "Use Coaction Drift", false, cd => [
      new ModStat(
        new ModUpgrade(ModUpgradeType.damage, "MUL_ADD", undefined, "RIFLE"),
        new Decimal(0.28).mul(cd ? 1.15 : 1))
    ]),
    new ModifierDefinition("aura-pistol-amp", "Pistol Amp", "Use Coaction Drift", false, cd => [
      new ModStat(
        new ModUpgrade(ModUpgradeType.damage, "MUL_ADD", undefined, "PISTOL"),
        new Decimal(0.27).mul(cd ? 1.15 : 1))
    ]),
    new ModifierDefinition("aura-shotgun-amp", "Shotgun Amp", "Use Coaction Drift", false, cd => [
      new ModStat(
        new ModUpgrade(ModUpgradeType.damage, "MUL_ADD", undefined, "SHOTGUN"),
        new Decimal(0.18).mul(cd ? 1.15 : 1))
    ]),
  ],
  "Warframe Arcanes": [
    new ModifierDefinition("arcane-acceleration", "Arcane Acceleration",
      undefined, undefined, () => [
      new ModStat(
        new ModUpgrade(ModUpgradeType.fire_rate, "MUL_ADD", undefined, "RIFLE"),
        new Decimal(0.9))
    ]),
    new ModifierDefinition("arcane-arachne", "Arcane Arachne",
      undefined, undefined, () => [
      new ModStat(
      new ModUpgrade(ModUpgradeType.damage, "MUL_ADD"),
      new Decimal(1.5))]
    ),
    new ModifierDefinition("arcane-avenger", "Arcane Avenger",
      undefined, undefined, () => [
      new ModStat(
      new ModUpgrade(ModUpgradeType.crit_chance, "ADD"),
      new Decimal(0.45))
    ]),
    new ModifierDefinition("arcane-awakening", "Arcane Awakening",
      undefined, undefined, () => [
      new ModStat(
      new ModUpgrade(ModUpgradeType.damage, "MUL_ADD", undefined, "PISTOL"),
      new Decimal(1.5))
    ]),
    new ModifierDefinition("arcane-momentum", "Arcane Momentum",
      undefined, undefined, () => [
      new ModStat(
      new ModUpgrade(ModUpgradeType.reload_speed, "MUL_ADD", undefined, "SNIPER"),
      new Decimal(1.5))
    ]),
    new ModifierDefinition("arcane-precisio", "Arcane Precision (Max)",
      undefined, undefined, () => [
      new ModStat(
      new ModUpgrade(ModUpgradeType.damage, "MUL_ADD", undefined, "PISTOL"),
      new Decimal(3))
    ]),
    new ModifierDefinition("arcane-precision-r4", "Arcane Precision (R4)",
      undefined, undefined, () => [
      new ModStat(
      new ModUpgrade(ModUpgradeType.damage, "MUL_ADD", undefined, "PISTOL"),
      new Decimal(2.5))
    ]),
    new ModifierDefinition("arcane-rage", "Arcane Rage",
      undefined, undefined, () => [
      new ModStat(
      new ModUpgrade(ModUpgradeType.damage, "MUL_ADD", undefined, "PRIMARY"),
      new Decimal(1.8))
    ]),
    new ModifierDefinition("arcane-tempo", "Arcane Tempo",
      undefined, undefined, () => [
      new ModStat(
      new ModUpgrade(ModUpgradeType.fire_rate, "MUL_ADD", undefined, "SHOTGUN"),
      new Decimal(0.9))
    ]),
    new ModifierDefinition("arcane-velocity", "Arcane Velocity",
      undefined, undefined, () => [
      new ModStat(
      new ModUpgrade(ModUpgradeType.fire_rate, "MUL_ADD", undefined, "PISTOL"),
      new Decimal(1.2))
    ]),
  ],
  "Warframe Abilities": [
    new ModifierDefinition("chroma-vex-armor", "Chroma [3] Vex Armor",
      "Ability Strength", 2.99, val => [
      new ModStat(
        new ModUpgrade(ModUpgradeType.damage, "MUL_ADD"),
        new Decimal(2.75).mul(val)),
    ]),
    new ModifierDefinition("rhino-roar", "Rhino [3] Roar",
      "Ability Strength", 2.99, val => [
      new ModStat(
        new ModUpgrade(ModUpgradeType.damage_multiply_roar, "SET"),
        new Decimal(0.5).mul(val)),
    ]),
    new ModifierDefinition("rhino-roar-subsumed", "Rhino [3] Roar (Subsumed)",
      "Ability Strength", 1, val => [
      new ModStat(
        new ModUpgrade(ModUpgradeType.damage_multiply_roar, "SET"),
        new Decimal(0.3).mul(val)),
    ]),
    new ModifierDefinition("mirage-eclipse-light", "Mirage [3] Eclipse (Max. lighting)",
      "Ability Strength", 2.99, val => [
      new ModStat(
        new ModUpgrade(ModUpgradeType.damage_multiply_eclipse, "SET"),
        new Decimal(2).mul(val)),
    ]),
    new ModifierDefinition("mirage-eclipse-light-subsumed", "Mirage [3] Eclipse (Subsumed, Max. lighting)",
      "Ability Strength", 2.99, val => [
      new ModStat(
        new ModUpgrade(ModUpgradeType.damage_multiply_eclipse, "SET"),
        new Decimal(1.5).mul(val)),
    ]),
    new ModifierDefinition("mesa-shooting-gallery", "Mesa [2] Shooting Gallery",
      "Ability Strength", 2.99, val => [
      new ModStat(
        new ModUpgrade(ModUpgradeType.damage, "MUL_ADD"),
        new Decimal(0.25).mul(val)),
    ]),
    new ModifierDefinition("oberon-smite-infusion", "Oberon [1] Smite + Smite Infusion",
      "Ability Strength", 1, val => [
      new ModStat(
        new ModUpgrade(ModUpgradeType.elemental, "ADD", "DT_RADIATION"),
        new Decimal(val)),
    ]),
    new ModifierDefinition("volt-shock-trooper", "Volt [1] Shock + Shock Trooper",
      "Ability Strength", 1, val => [
      new ModStat(
        new ModUpgrade(ModUpgradeType.elemental, "ADD", "DT_ELECTRICITY"),
        new Decimal(val)),
    ]),
    new ModifierDefinition("volt-electric-shield", "Volt [3] Electric Shield",
      undefined, undefined, val => [
      new ModStat(
        new ModUpgrade(ModUpgradeType.crit_damage_buff_volt_odonata, "ADD"),
        new Decimal(1)),
      new ModStat(
        new ModUpgrade(ModUpgradeType.elemental_nocombine, "ADD", "DT_ELECTRICITY"),
        new Decimal(0.5)),
    ]),
    new ModifierDefinition("odonata-energy-shell", "Odonata [1] Energy Shell",
      "Ability Strength", 1, val => [
      new ModStat(
        new ModUpgrade(ModUpgradeType.crit_damage_buff_volt_odonata, "ADD"),
        new Decimal(1)),
      new ModStat(
        new ModUpgrade(ModUpgradeType.elemental_nocombine, "ADD", "DT_FIRE"),
        new Decimal(0.5).mul(val)),
    ]),
    new ModifierDefinition("harrow-covenant", "Harrow [4] Covenant (4x for Headshot)",
      "Critical Chance (0.05-0.5)", 0.5, val => [
      new ModStat(
        new ModUpgrade(ModUpgradeType.buff_harrow, "SET"),
        new Decimal(val)),
    ]),
    new ModifierDefinition("wisp-haste", "Wisp [1] Haste Mote",
      "Ability Strength", 1, val => [
      new ModStat(
        new ModUpgrade(ModUpgradeType.fire_rate, "MUL_ADD"),
        new Decimal(0.3).mul(val))
    ]),
  ],
  "Uncategorized": [
    new ModifierDefinition("headshot", "Headshot (body part multiplier depending on the enemy unit, and 2x headshot critical multiplier)",
      undefined, undefined, val => [
      new ModStat(
        new ModUpgrade(ModUpgradeType.switch_headshot, "SET"),
        new Decimal(1)),
    ]),
    new ModifierDefinition("adarza-cats-eye", "Adarza Kavat Cat's Eye",
      undefined, undefined, val => [
      new ModStat(
        new ModUpgrade(ModUpgradeType.crit_chance, "ADD"),
        new Decimal(0.6)),
    ]),
    new ModifierDefinition("smeeta-charm-crit-chance", "Smeeta Kavat Charm (Critical Chance Buff)",
      undefined, undefined, val => [
      new ModStat(
        new ModUpgrade(ModUpgradeType.crit_chance, "SET"),
        new Decimal(2)),
    ]),
    new ModifierDefinition("vigorous-swap", "Vigorous Swap",
      undefined, undefined, val => [
      new ModStat(
        new ModUpgrade(ModUpgradeType.damage, "MUL_ADD"),
        new Decimal(1.65)),
    ]),
    new ModifierDefinition("void-strike", "Void Strike",
      "Multiplier", 1, val => [
      new ModStat(
        new ModUpgrade(ModUpgradeType.damage_multiply_void_strike, "SET"),
        new Decimal(val)),
    ]),
    new ModifierDefinition("vigilante-mods", "Additional Vigilante Mods",
      "Number", 1, val => [
      new ModStat(
        new ModUpgrade(ModUpgradeType.vigilante, "ADD", undefined, "PRIMARY"),
        new Decimal(0.05).mul(val)),
    ]),
    new ModifierDefinition("gladiator-mods", "Total number of Gladiator Mods",
      "Number", 1, val => [
      new ModStat(
        new ModUpgrade(ModUpgradeType.crit_chance, "MUL_ADD", undefined, "MELEE"),
        new Decimal(1.1).mul(val)),
    ]),
    new ModifierDefinition("set-magazine-to-1", "Set Magazine Size to 1 (Reload after the first shot)",
      undefined, undefined, val => [
      new ModStat(
        new ModUpgrade(ModUpgradeType.magazine_size, "SET"),
        new Decimal(1)),
    ]),
    new ModifierDefinition("sniper-combo", "Sniper Combo",
      "Multiplier", 3, val => [
      new ModStat(
        new ModUpgrade(ModUpgradeType.sniper_combo, "SET", undefined, "SNIPER"),
        new Decimal(val)),
    ], opts => !!(opts && opts.weapon && opts.weapon.isCompatible("SNIPER"))),
    new ModifierDefinition("sniper-zoom-level", "Sniper Zoom Level",
      "No ADS = 0, 1st level = 1, ...", 0, (val, opts) => {
      if (val <= 0 || !opts)
        return [];
      const zoomLevels = opts!.weapon!.zoomLevels;
      if (val > zoomLevels.length)
        val = zoomLevels.length;
      return zoomLevels[val - 1].upgrades;
    }, opts => !!(opts && opts.weapon && opts.weapon.zoomLevels.length > 0)),
    new ModifierDefinition("blessing-damage", "MR30 Damage Blessing",
      undefined, undefined, val => [
      new ModStat(
        new ModUpgrade(ModUpgradeType.damage, "MUL_ADD"),
        new Decimal(0.25)),
    ]),
  ],
};

export interface Switches {
  enableInnateBuffs: boolean;
  enableVigilanteBuffs: boolean;
}

export const SwitchesValues: { [k in keyof Switches]: [string, boolean] } = {
  enableInnateBuffs: ["Use Weapon's Innate Buffs (Max Level)", true],
  enableVigilanteBuffs: ["Use Vigilante Set Mod bonus (chance to increase Critical Hit tier; 5% per Mod)", true],
};

export class Modifier<T> {
  constructor(
    readonly definition: ModifierDefinition<T>,
    readonly value: T
  ) { }

  modStats(options?: ModifierDefinitionOptions): ModStat[] {
    if (this.definition.isApplicable !== undefined &&
      !this.definition.isApplicable(options))
      return [];
    return this.definition.apply(this.value, options);
  }

  serialize(): any {
    const vs = this.value === undefined ? null : this.value;
    return [this.definition.serialize(), vs];
  }

  static deserialize(obj: any): Modifier<any> {
    const [ds, vs] = obj;
    const value = vs === null ? undefined : vs;
    return new Modifier(ModifierDefinition.deserialize(ds), value);
  }
}

class ModifiersData {
  readonly enemy: Enemy;
  readonly switches: Switches;
  readonly abilityStrength: number;
  readonly globalModifiers: Array<Modifier<any>>;

  constructor(obj: ModifiersData) {
    this.enemy = obj.enemy;
    this.switches = obj.switches;
    this.abilityStrength = obj.abilityStrength;
    this.globalModifiers = obj.globalModifiers;
  }
}

export class Modifiers extends ModifiersData {
  static createEmpty(): Modifiers {
    const switches: Switches = {} as any;
    Object.entries(SwitchesValues).forEach(([key, value]) => switches[key] = value[1]);
    return new Modifiers({
      enemy: Enemy.createEmpty(),
      switches: switches,
      abilityStrength: 1,
      globalModifiers: [],
    });
  }

  serialize(): any {
    return {
      enemy: this.enemy.serialize(),
      switches: this.switches,
      modifiers: this.globalModifiers.map(i => i.serialize()),
    };
  }

  static deserialize(obj: any): Modifiers {
    const switches: Switches = {} as any;
    Object.entries(SwitchesValues).forEach(([key, value]) => switches[key] = value[1]);
    Object.entries(obj.switches).forEach(([key, value]: [any, any]) => {
      if (SwitchesValues[key] !== undefined)
        switches[key] = value;
      else
        console.log("Modifiers.deserialize(): unknown switch: " + key);
    });

    return new Modifiers({
      enemy: Enemy.deserialize(obj.enemy),
      switches: switches,
      abilityStrength: 1,
      globalModifiers: obj.modifiers.map((i: any) => Modifier.deserialize(i)),
    });
  }
}
