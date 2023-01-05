import { Weapon, getWeapon, Weapons } from "./weapon";
import { Mod, getMod, PlaceholderEmptyMod, PlaceholderRivenMod, ModStat } from "./mod";
import { RivenMod } from "./rivenMod";
import { Modifier } from "./modifiers";

export class ScaledMod {
  constructor(
    readonly mod: Mod,
    readonly rank: number
  ) { }

  get scaledModStats(): ModStat[] {
    return this.mod.stats.map(s => s.scale(this.rank));
  }

  static deserialize(obj: any) {
    // 2021-08-02: Before variable rank; d is the mod's name
    if (typeof obj === "string") {
      const mod = getMod(obj);
      return new ScaledMod(mod, mod.maxRank);
    }
    return new ScaledMod(getMod(obj.name), obj.rank);
  }
}

// Should be renamed; confusing with "Set Mods"
export class ModSet {
  readonly ordinal: [
    ScaledMod, ScaledMod, ScaledMod, ScaledMod,
    ScaledMod, ScaledMod, ScaledMod, ScaledMod,
  ];
  readonly exilus: ScaledMod;

  constructor(ordinal: ScaledMod[], exilus: ScaledMod) {
    if (ordinal.length !== 8)
      throw new Error("invalid number of ordinal mods");
    this.ordinal = ordinal as any;
    this.exilus = exilus;
  }

  static empty() {
    const empty = new ScaledMod(PlaceholderEmptyMod, 0);
    return new ModSet(new Array(8).fill(empty), empty);
  }

  serialize(): any {
    return this.map(smod => {
      return {
        name: smod.mod.name,
        rank: smod.rank,
      };
    });
  }

  static deserialize(obj: any) {
    const ary = obj.map((d: any) => ScaledMod.deserialize(d));
    // 2020-10-11: Before Exilus
    if (ary.length === 8)
      return new ModSet(ary, new ScaledMod(PlaceholderEmptyMod, 0));
    if (ary.length !== 9)
      throw new Error("invalid number of serialized mods");
    return new ModSet(ary.slice(0, 8), ary[8]);
  }

  forEach(fun: (mod: ScaledMod, index: number) => void) {
    this.ordinal.forEach(fun);
    fun(this.exilus, 8);
  }

  map<T>(fun: (mod: ScaledMod, index: number) => T): T[] {
    return [...this.ordinal, this.exilus].map(fun);
  }
}

export class BuildOptions {
  readonly sniperZoomLevel?: number;
  readonly weaponInnateBuffs?: boolean;

  constructor(data: BuildOptions) {
    Object.assign(this, data);
  }
}

class BuildData {
  readonly description: string;
  readonly weapon: Weapon;
  readonly mods: ModSet;
  readonly riven: RivenMod;
  readonly options: BuildOptions;
  readonly localModifiers: Array<Modifier<any>>;

  constructor(data: BuildData) {
    this.description = data.description;
    this.weapon = data.weapon;
    this.mods = data.mods;
    this.riven = data.riven;
    this.options = data.options;
    this.localModifiers = data.localModifiers;
  }
}

export class Build extends BuildData {
  serialize(): any {
    return {
      description: this.description,
      weapon: this.weapon.name,
      mods: this.mods.serialize(),
      riven: this.riven.serialize(),
      localModifiers: this.localModifiers.map(i => i.serialize()),
    };
  }

  static deserialize(obj: any): Build {
    // 2020-10-11: Added description
    const description = obj.description || "";
    const modifiers = obj.localModifiers.map((i: any) => Modifier.deserialize(i));

    return new Build({
      description: description,
      weapon: getWeapon(obj.weapon),
      mods: ModSet.deserialize(obj.mods),
      riven: RivenMod.deserialize(obj.riven),
      localModifiers: modifiers,
      options: new BuildOptions({}),
    });
  }

  static createEmpty() {
    return new Build({
      description: "",
      weapon: Weapons[0],
      mods: ModSet.empty(),
      riven: new RivenMod(),
      localModifiers: [],
      options: new BuildOptions({}),
    });
  }

  get modifiersParameters() {
    return {
      weapon: this.weapon,
    };
  }

  get descriptionFormatted() {
    const userset = this.description;
    if (userset.length > 0)
      return userset;
    let s = `${this.weapon.name} Build`;
    if (this.mods.ordinal.some(sm => sm.mod === PlaceholderRivenMod))
      s += " w/ Riven";
    return s;
  }
}
