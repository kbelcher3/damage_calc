import { Decimal } from "decimal.js";
import { HealthType, getHealthTypeName } from "./healthDamageType";
import EnemiesJSON from "../extracted/enemies.json";

export enum FactionType {
  Corpus = "Corpus",
  Grineer = "Grineer",
  Infestation = "Infestation",
  Neutral = "Neutral",
  Predator = "Predator",
  Prey = "Prey",
  Orokin = "Orokin",
  Sentient = "Sentient",
  TENNO = "TENNO",
  RedVeil = "Red Veil",
  Stalker = "Stalker",
}

export interface BossDamageMitigaion {
  threshold: number;
  multiplier: number;
  useCriticalHeadshot: boolean;
}

class CustomEnemyPresetData {
  readonly armorType: HealthType;
  readonly armorBase: number;
  readonly healthType: HealthType;
  readonly healthBase: number;
  readonly shieldType: HealthType;
  readonly shieldBase: number;
  readonly faction: FactionType;
  readonly baseLevel: number;
  readonly defaultLevel: number;
  readonly damageMitigation: BossDamageMitigaion | undefined;
  readonly headshotMultiplier: number;

  constructor(data: CustomEnemyPresetData) {
    this.armorType = data.armorType;
    this.armorBase = data.armorBase;
    this.healthType = data.healthType;
    this.healthBase = data.healthBase;
    this.shieldType = data.shieldType;
    this.shieldBase = data.shieldBase;
    this.faction = data.faction;
    this.baseLevel = data.baseLevel;
    this.defaultLevel = data.defaultLevel;
    this.damageMitigation = data.damageMitigation;
    this.headshotMultiplier = data.headshotMultiplier;
  }
}

export class CustomEnemyPreset extends CustomEnemyPresetData {
  get name(): string {
    return "Custom";
  }

  serialize(): any {
    return this;
  }

  static deserialize(obj: any): CustomEnemyPreset {
    let obj2 = obj;
    if (obj.headshotMultiplier === undefined)
      obj2 = { ...obj, headshotMultiplier: 2, };
    if (obj.damageMitigation !== undefined && obj.damageMitigation.useCriticalHeadshot === undefined)
      obj2.damageMitigation = { ...obj.damageMitigation, useCriticalHeadshot: false };
    return new CustomEnemyPreset(obj2);
  }
}

abstract class EnemyPresetData extends CustomEnemyPresetData {
  readonly name: string;
  readonly uniqueName: string;

  constructor(data: EnemyPresetData) {
    super(data);
    this.name = data.name;
    this.uniqueName = data.uniqueName;
  }
}

export class EnemyPreset extends EnemyPresetData {
  static enemyPresetsTable: { [key: string]: EnemyPreset } = {};

  constructor(data: EnemyPresetData) {
    super(data);

    EnemyPreset.enemyPresetsTable[this.uniqueName] = this;
  }

  serialize(): any {
    return this.uniqueName;
  }

  static deserialize(obj: any): EnemyPreset | CustomEnemyPreset {
    if (typeof obj === "object")
      return CustomEnemyPreset.deserialize(obj);
    const preset = this.enemyPresetsTable[obj];
    if (preset === undefined)
      throw new Error(`unknown EnemyPreset: id=${obj}`);
    return preset;
  }
}

class EnemyData {
  readonly stats: EnemyPreset | CustomEnemyPreset;
  readonly level?: number;
  readonly armorMultiplier: number;
  readonly armorSubtraction: number;

  constructor(data: EnemyData) {
    this.stats = data.stats;
    this.level = data.level;
    this.armorMultiplier = data.armorMultiplier;
    this.armorSubtraction = data.armorSubtraction;
  }
}

export class Enemy extends EnemyData {
  levelScaling() {
    let levelDiff = (this.level || this.stats.defaultLevel) - this.stats.baseLevel;
    if (levelDiff < 0)
      levelDiff = 0;
    let armorBaseReduced = new Decimal(this.stats.armorBase)
      .sub(this.armorSubtraction)
      .mul(this.armorMultiplier);
    if (armorBaseReduced.lt(0))
      armorBaseReduced = new Decimal(0);
    const pp = (el: number, cl: number, eh: number, ch: number) => {
      const s0 = Decimal.min(1, Decimal.max(0, new Decimal(levelDiff).sub(70).div(10)));
      const s1 = s0.pow(2).mul(3).sub(s0.pow(3).mul(2));
      const ll = new Decimal(levelDiff).pow(el).mul(cl);
      const lh = new Decimal(levelDiff).pow(eh).mul(ch);
      const lm = new Decimal(1).sub(s1).mul(ll).add(s1.mul(lh));
      return lm.add(1);
    };
    return {
      armor: pp(1.75, 0.005, 0.75, 0.4).mul(armorBaseReduced),
      health: pp(2, 0.015, 0.5, 10.7331).mul(this.stats.healthBase),
      shield: pp(1.75, 0.02, 0.75, 1.6).mul(this.stats.healthBase),
    };
  }

  toString(): string {
    let s = getHealthTypeName(this.stats.healthType);
    const armorBase2 = this.stats.armorBase - this.armorSubtraction;
    if (armorBase2 > 0)
      s += " + " + getHealthTypeName(this.stats.armorType);
    if (this.stats instanceof EnemyPreset)
      s = `${this.stats.name} (${s})`;
    return s;
  }

  static createEmpty(): Enemy {
    return new Enemy({
      stats: new CustomEnemyPreset({
        healthType: HealthType.RK_NONE,
        healthBase: 1,
        armorType: HealthType.RK_ARMOR,
        armorBase: 0,
        shieldType: HealthType.RK_SHIELD,
        shieldBase: 0,
        faction: FactionType.Neutral,
        baseLevel: 1,
        defaultLevel: 100,
        damageMitigation: undefined,
        headshotMultiplier: 2,
      }),
      level: undefined,
      armorMultiplier: 1,
      armorSubtraction: 0,
    });
  }

  serialize(): any {
    return {
      stats: this.stats.serialize(),
      level: this.level,
      armorMultiplier: this.armorMultiplier,
      armorSubtraction: this.armorSubtraction,
    };
  }

  static deserialize(obj: any): Enemy {
    return new Enemy({
      stats: EnemyPreset.deserialize(obj.stats),
      level: obj.level === null ? undefined : obj.level,
      armorMultiplier: typeof obj.armorMultiplier !== "number" ? 1 : obj.armorMultiplier,
      armorSubtraction: typeof obj.armorSubtraction !== "number" ? 0 : obj.armorSubtraction,
    });
  }
}

// Import JSON data
export const EnemyPresets: { [key in FactionType]: EnemyPreset[] } = {} as any;
EnemiesJSON.forEach(item => {
  let defaultLevel = 100;
  let damageMitigation: BossDamageMitigaion | undefined = undefined;
  let headshotMultiplier = 2;
  switch (item.name) {
    case "EIDOLON TERALYST":
      defaultLevel = 50;
      damageMitigation = { threshold: 300, multiplier: 0.4, useCriticalHeadshot: false };
      headshotMultiplier = 1;
      break;
    case "EIDOLON GANTULYST":
      defaultLevel = 55;
      damageMitigation = { threshold: 300, multiplier: 0.4, useCriticalHeadshot: false };
      headshotMultiplier = 1;
      break;
    case "EIDOLON HYDROLYST":
      defaultLevel = 60;
      damageMitigation = { threshold: 300, multiplier: 0.4, useCriticalHeadshot: false };
      headshotMultiplier = 1;
      break;
  }
  if (!Object.values(FactionType).includes(item.faction as FactionType))
    throw new Error("unexpected faction: " + item.faction);
  const faction = item.faction as FactionType;
  if (EnemyPresets[faction] === undefined)
    EnemyPresets[faction] = [];
  EnemyPresets[faction].push(new EnemyPreset({
    name: item.name,
    uniqueName: item.unique_name,
    faction: faction,
    armorType: item.armor_type as HealthType,
    armorBase: item.armor_base,
    healthType: item.health_type as HealthType,
    healthBase: item.health_base,
    shieldType: item.shield_type as HealthType,
    shieldBase: item.shield_base,
    baseLevel: item.base_level,
    defaultLevel: defaultLevel,
    damageMitigation: damageMitigation,
    headshotMultiplier: headshotMultiplier,
  }));
});

// Add custom enemy presets
// 1. Eidolon Synovias
[
  "/Lotus/Types/Enemies/Sentients/Eidolon/SentientTeralystAvatar",
  "/Lotus/Types/Enemies/Sentients/Eidolon/SentientTeralystBigAvatar",
  "/Lotus/Types/Enemies/Sentients/Eidolon/SentientTeralystRainAvatar",
].forEach(uid => {
  const e = EnemyPresets[FactionType.Sentient].find(ei => ei.uniqueName === uid);
  if (e !== undefined) {
    const synovia = new EnemyPreset({
      ...e,
      name: `${e.name} SYNOVIA`,
      uniqueName: `${e.uniqueName}|Synovia`,
      healthBase: 2200,
    });
    EnemyPresets[synovia.faction].push(synovia);
  }
});
