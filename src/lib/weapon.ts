import { Decimal } from "decimal.js";
import { RivenCategory } from "./rivenMod";
import { ModStat, ModUpgrade, ModUpgradeType, ItemCompatibilityAny } from "./mod";
import { DamageType } from "./healthDamageType";
import WeaponsJSON from "../extracted/weapons.json";

const attackTypeRegistry: { [id: string]: AttackType } = {};
export class AttackType {
  static readonly Hitscan =
    new AttackType("hitscan", "Hitscan");
  static readonly Beam =
    new AttackType("beam", "Beam");
  static readonly Projectile =
    new AttackType("projectile", "Projectile");
  static readonly ChargedProjectile =
    new AttackType("charged_projectile", "Projectile (Charged)");
  static readonly ProjectileExplosive =
    new AttackType("projectile_explosive", "Projectile (Explosive)");

  private constructor(readonly id: string, readonly name: string) {
    attackTypeRegistry[id] = this;
  }

  static parse(id: any) {
    const ret = attackTypeRegistry[id];
    if (ret === undefined)
      throw new Error(`unknown attack type: ${id}`);
    return ret;
  }

  toString() {
    return this.name;
  }
}

export type DamageMap = Partial<Record<DamageType, Decimal>>;
export type ItemCompatibility = string;

export interface ZoomLevel {
  zoom: number;
  upgrades: ModStat[];
}

export interface Burst {
  count: number;
  delay: number;
}

class WeaponData {
  readonly name: string;
  readonly basename: string;
  readonly compatibility: ItemCompatibility[];
  readonly rivenCategory: RivenCategory;
  readonly attackType: AttackType;
  readonly critChance: Decimal;
  readonly critDamage: Decimal;
  readonly damage: DamageMap;
  readonly damageAmount: Decimal;
  readonly pellets: Decimal;
  readonly procChance: Decimal;
  readonly fireRate: Decimal;
  readonly chargeTime?: Decimal;
  readonly magazineSize: Decimal;
  readonly reloadTime: Decimal;
  readonly burst: Burst | undefined;
  readonly zoomLevels: ZoomLevel[];
  readonly defaultUpgrades: ModStat[][];
  readonly rivenDisposition: Decimal;
  readonly derivatives: Weapon[];

  constructor(data: WeaponData) {
    this.name = data.name;
    this.basename = data.basename;
    this.compatibility = data.compatibility;
    this.rivenCategory = data.rivenCategory;
    this.attackType = data.attackType;
    this.critChance = data.critChance;
    this.critDamage = data.critDamage;
    this.damage = data.damage;
    this.damageAmount = data.damageAmount;
    this.pellets = data.pellets;
    this.procChance = data.procChance;
    this.fireRate = data.fireRate;
    this.chargeTime = data.chargeTime;
    this.magazineSize = data.magazineSize;
    this.reloadTime = data.reloadTime;
    this.burst = data.burst;
    this.zoomLevels = data.zoomLevels;
    this.defaultUpgrades = data.defaultUpgrades;
    this.rivenDisposition = data.rivenDisposition;
    this.derivatives = data.derivatives;
  }
}

export class Weapon extends WeaponData {
  private compatMap: { [c: string]: boolean } = {};
  // For Exalted Weapons
  applyAbilityStrength?: (abilityStrength: number) => ModStat[];

  constructor(data: WeaponData) {
    super(data);
    this.compatibility.forEach(c => this.compatMap[c] = true);
  }

  isCompatible(compat: ItemCompatibility) {
    return compat === ItemCompatibilityAny || !!this.compatMap[compat];
  }
}


// Import JSON data
export const Weapons: Weapon[] = [];
WeaponsJSON.forEach((item: any) => // FIXME: type error on item.modes.forEach()
  item.modes.forEach((mode: any) => {
    const damageMap = {};
    Object.keys(mode.damage).forEach(type => {
      damageMap[type] = new Decimal(mode.damage[type]);
    });
    let burst: Burst | undefined;
    if (mode.burst_num_shots !== null)
      burst = { count: mode.burst_num_shots, delay: mode.burst_delay };
    Weapons.push(new Weapon({
      name: mode.name !== null ? `${item.name} (${mode.name})` : item.name,
      basename: item.name,
      compatibility: item.compatibility,
      rivenCategory: item.riven_category,
      attackType: AttackType.parse(mode.attack_type),
      zoomLevels: item.zoom_levels.map((zitem: any) =>
        ({ zoom: zitem.zoom, upgrades: zitem.upgrades.map((zb: any) => ModStat.parse(zb)) })),
      defaultUpgrades: item.default_upgrades.map((ary: any) =>
        ary.map((du: any) => ModStat.parse(du))),
      magazineSize: new Decimal(item.magazine_size),
      rivenDisposition: new Decimal(item.riven_disposition),
      derivatives: [],

      critChance: new Decimal(mode.critical_chance),
      critDamage: new Decimal(mode.critical_multiplier),
      damage: damageMap,
      damageAmount: new Decimal(mode.damage_amount),
      pellets: new Decimal(mode.fire_iterations),
      procChance: new Decimal(mode.proc_chance),
      fireRate: new Decimal(mode.fire_rate).div(60),
      chargeTime: mode.charge_time ? new Decimal(mode.charge_time) : undefined,
      reloadTime: new Decimal(mode.reload_time),
      burst: burst,
    }));
  }));
// Custom weapons
Weapons.push(new Weapon({
  name: "Khora Whipclaw",
  basename: "Khora Whipclaw",
  compatibility: ["MELEE"],
  rivenCategory: "MELEE",
  attackType: AttackType.Hitscan,
  zoomLevels: [],
  defaultUpgrades: [],
  magazineSize: new Decimal(0),
  rivenDisposition: new Decimal(1.5),
  derivatives: [],

  critChance: new Decimal(0.25),
  critDamage: new Decimal(2.0),
  damage: {
    "DT_IMPACT": new Decimal(1).div(3),
    "DT_PUNCTURE": new Decimal(1).div(3),
    "DT_SLASH": new Decimal(1).div(3),
  },
  damageAmount: new Decimal(300),
  pellets: new Decimal(1),
  procChance: new Decimal(0.2),
  fireRate: new Decimal(60),
  chargeTime: undefined,
  reloadTime: new Decimal(1),
  burst: undefined,
}));
Weapons.push(new Weapon({
  name: "Gara Shattered Lash (Puncture)",
  basename: "Gara Shattered Lash",
  compatibility: ["MELEE"],
  rivenCategory: "MELEE",
  attackType: AttackType.Hitscan,
  zoomLevels: [],
  defaultUpgrades: [],
  magazineSize: new Decimal(0),
  rivenDisposition: new Decimal(1.5),
  derivatives: [],

  critChance: new Decimal(0),
  critDamage: new Decimal(1),
  damage: {
    "DT_PUNCTURE": new Decimal(1),
  },
  damageAmount: new Decimal(800),
  pellets: new Decimal(1),
  procChance: new Decimal(0),
  fireRate: new Decimal(60),
  chargeTime: undefined,
  reloadTime: new Decimal(1),
  burst: undefined,
}));

Weapons.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);

const weaponsByName: { [key: string]: Weapon } = {};
Weapons.forEach(weapon => {
  weaponsByName[weapon.name] = weapon;
  if (weaponsByName[weapon.basename] === undefined)
    weaponsByName[weapon.basename] = weapon;
});

// Complete derivatives field
Weapons.forEach(w => {
  w.compatibility.forEach(c => {
    const orig = weaponsByName[c];
    // orig === undefined is for categories such as "PRIMARY"
    if (orig !== undefined && !orig.derivatives.includes(w))
      orig.derivatives.push(w);
  });
});

// Patching
// FIXME: 2020-03-06: With U27.2.0, this is currently broken
if (false) {
  // Add Ability Strength handler for Exalted Weapons
  weaponsByName["Artemis Bow"].applyAbilityStrength = strength => [
    new ModStat(
      new ModUpgrade(ModUpgradeType.damage, "MUL"),
      new Decimal(-1).add(strength)
    ),
  ];
  weaponsByName["REGULATORS"].applyAbilityStrength = strength => [
    new ModStat(
      new ModUpgrade(ModUpgradeType.damage, "MUL_ADD"),
      new Decimal(1.5).mul(strength)
    ),
  ];
  weaponsByName["DEX PIXIA"].applyAbilityStrength = strength => [
    new ModStat(
      new ModUpgrade(
        ModUpgradeType.damage, "MUL"),
      new Decimal(-1).add(strength)
    ),
  ];
}

export function getWeapon(name: string, canfail: boolean = false) {
  const ret = weaponsByName[name];
  if (ret === undefined && !canfail)
    throw new Error("unknown weapon: " + name);
  return ret;
}
