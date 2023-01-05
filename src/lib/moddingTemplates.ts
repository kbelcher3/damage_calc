import { ScaledMod, ModSet } from "./build";
import { getMod, PlaceholderEmptyMod } from "./mod";
import { Weapon, ItemCompatibility } from "./weapon";

function ms(list: [string, string, string, string, string, string, string, string]) {
  return new ModSet(
    list.map(n => {
      const mod = getMod(n);
      return new ScaledMod(mod, mod.maxRank);
    }), new ScaledMod(PlaceholderEmptyMod, 0));
}

const moddingTemplates: { [name in ItemCompatibility]: Array<[string, ModSet]> } = {
  "RIFLE": [
    ["Critical, Radiation", ms([
      "Serration", "Split Chamber", "Hellfire", "Stormbringer",
      "Point Strike", "Vital Sense", "Vigilante Armaments", "Riven Mod"
    ])],
    ["Critical & Status, Corrosive", ms([
      "Serration", "Split Chamber", "Malignant Force", "High Voltage",
      "Point Strike", "Vital Sense", "Vigilante Armaments", "Riven Mod"
    ])],
  ],
  "SHOTGUN": [
    ["Critical, Radiation", ms([
      "Primed Point Blank", "Hell's Chamber", "Incendiary Coat", "Primed Charged Shell",
      "Blunderbuss", "Primed Ravage", "Blaze", "Riven Mod"
    ])],
    ["Status, Corrosive & Cold", ms([
      "Primed Point Blank", "Hell's Chamber", "Seeking Fury", "Vigilante Armaments",
      "Toxic Barrage", "Shell Shock", "Frigid Blast", "Riven Mod"
    ])],
  ],
  "PISTOL": [
    ["Critical, Radiation", ms([
      "Hornet Strike", "Barrel Diffusion", "Primed Heated Charge", "Convulsion",
      "Primed Pistol Gambit", "Primed Target Cracker", "Lethal Torrent", "Riven Mod"
    ])],
    ["Critical & Status, Corrosive", ms([
      "Hornet Strike", "Barrel Diffusion", "Pistol Pestilence", "Jolt",
      "Primed Pistol Gambit", "Primed Target Cracker", "Lethal Torrent", "Riven Mod"
    ])],
  ],
  "AMP": [
    ["Max Critical Chance", ms([
      "LOHRIN BRACE", "+", "+", "+",
      "+", "+", "+", "+"
    ])],
  ],
  "MELEE": [],
  "ARCHGUN": [],
};

export function getModdingTemplates(weapon: Weapon) {
  const list = [...weapon.compatibility].reverse();
  let ret: Array<[string, ModSet]> | undefined;
  list.forEach(item => {
    if (ret !== undefined)
      return;
    ret = moddingTemplates[item];
  });
  if (ret === undefined)
    throw new Error("[BUG] modding template not defined for this weapon");
  return ret;
}
