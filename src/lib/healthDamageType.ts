export enum HealthType {
  RK_NONE = "RK_NONE",
  RK_ARMOR = "RK_ARMOR",
  RK_CLONED_FLESH = "RK_CLONED_FLESH",
  RK_FLESH = "RK_FLESH",
  RK_FOSSILIZED = "RK_FOSSILIZED",
  RK_HEAVY_SHIELD = "RK_HEAVY_SHIELD",
  RK_HULKING_ARMOR = "RK_HULKING_ARMOR",
  RK_INFESTED = "RK_INFESTED",
  RK_INFESTED_ARMOUR = "RK_INFESTED_ARMOUR",
  RK_INFESTED_FLESH = "RK_INFESTED_FLESH",
  RK_MACHINERY = "RK_MACHINERY",
  RK_ROBOTIC = "RK_ROBOTIC",
  RK_SHIELD = "RK_SHIELD",
  RK_TENNO_ARMOR = "RK_TENNO_ARMOR",
  RK_TENNO_FLESH = "RK_TENNO_FLESH",
  RK_TENNO_SHIELD = "RK_TENNO_SHIELD",
}

export function getHealthTypeName(type: HealthType) {
  switch (type) {
    case HealthType.RK_NONE: return "Untyped";
    case HealthType.RK_ARMOR: return "Ferrite Armor";
    case HealthType.RK_CLONED_FLESH: return "Cloned Flesh";
    case HealthType.RK_FLESH: return "Flesh";
    case HealthType.RK_FOSSILIZED: return "Fossilized";
    case HealthType.RK_HEAVY_SHIELD: return "Proto Shield";
    case HealthType.RK_HULKING_ARMOR: return "Alloy Armor";
    case HealthType.RK_INFESTED: return "Infested";
    case HealthType.RK_INFESTED_ARMOUR: return "Infested Sinew";
    case HealthType.RK_INFESTED_FLESH: return "Infested Flesh";
    case HealthType.RK_MACHINERY: return "Machinery";
    case HealthType.RK_ROBOTIC: return "Robotic";
    case HealthType.RK_SHIELD: return "Shield";
    case HealthType.RK_TENNO_ARMOR: return "Tenno Armor";
    case HealthType.RK_TENNO_FLESH: return "Tenno Flesh";
    case HealthType.RK_TENNO_SHIELD: return "Tenno Shield";
  }
}

export enum DamageType {
  DT_CORROSIVE = "DT_CORROSIVE",
  DT_ELECTRICITY = "DT_ELECTRICITY",
  DT_EXPLOSION = "DT_EXPLOSION",
  DT_FIRE = "DT_FIRE",
  DT_FREEZE = "DT_FREEZE",
  DT_GAS = "DT_GAS",
  DT_IMPACT = "DT_IMPACT",
  DT_MAGNETIC = "DT_MAGNETIC",
  DT_POISON = "DT_POISON",
  DT_PUNCTURE = "DT_PUNCTURE",
  DT_RADIATION = "DT_RADIATION",
  DT_SENTIENT = "DT_SENTIENT",
  DT_SLASH = "DT_SLASH",
  DT_VIRAL = "DT_VIRAL",
  DT_RADIANT = "DT_RADIANT",
}

export function getDamageTypeName(type: DamageType) {
  switch (type) {
    case DamageType.DT_CORROSIVE: return "Corrosive";
    case DamageType.DT_ELECTRICITY: return "Electricity";
    case DamageType.DT_EXPLOSION: return "Blast";
    case DamageType.DT_FIRE: return "Heat";
    case DamageType.DT_FREEZE: return "Cold";
    case DamageType.DT_GAS: return "Gas";
    case DamageType.DT_IMPACT: return "Impact";
    case DamageType.DT_MAGNETIC: return "Magnetic";
    case DamageType.DT_POISON: return "Toxin";
    case DamageType.DT_PUNCTURE: return "Puncture";
    case DamageType.DT_RADIATION: return "Radiation";
    case DamageType.DT_SENTIENT: return "Sentient";
    case DamageType.DT_SLASH: return "Slash";
    case DamageType.DT_VIRAL: return "Viral";
    case DamageType.DT_RADIANT: return "Void";
  }
}

export const ResistanceTable: {
  [key in HealthType]: { [dt in DamageType]?: number }
} = {
  "RK_NONE": {
  },
  "RK_ARMOR": {
    "DT_CORROSIVE": -0.75,
    "DT_EXPLOSION": 0.25,
    "DT_PUNCTURE": -0.5,
    "DT_SLASH": 0.15
  },
  "RK_CLONED_FLESH": {
    "DT_FIRE": -0.25,
    "DT_GAS": 0.5,
    "DT_IMPACT": 0.25,
    "DT_SLASH": -0.25,
    "DT_VIRAL": -0.75
  },
  "RK_FLESH": {
    "DT_GAS": 0.25,
    "DT_IMPACT": 0.25,
    "DT_POISON": -0.5,
    "DT_SLASH": -0.25,
    "DT_VIRAL": -0.5
  },
  "RK_FOSSILIZED": {
    "DT_CORROSIVE": -0.75,
    "DT_EXPLOSION": -0.5,
    "DT_FREEZE": 0.25,
    "DT_POISON": 0.5,
    "DT_RADIATION": 0.75,
    "DT_SLASH": -0.15
  },
  "RK_HEAVY_SHIELD": {
    "DT_CORROSIVE": 0.5,
    "DT_FIRE": 0.5,
    "DT_IMPACT": -0.15,
    "DT_MAGNETIC": -0.75,
    "DT_POISON": -0.25,
    "DT_PUNCTURE": 0.5
  },
  "RK_HULKING_ARMOR": {
    "DT_ELECTRICITY": 0.5,
    "DT_FREEZE": -0.25,
    "DT_MAGNETIC": 0.5,
    "DT_PUNCTURE": -0.15,
    "DT_RADIATION": -0.75,
    "DT_SLASH": 0.5
  },
  "RK_INFESTED": {
    "DT_FIRE": -0.25,
    "DT_GAS": -0.75,
    "DT_RADIATION": 0.5,
    "DT_SLASH": -0.25,
    "DT_VIRAL": 0.5
  },
  "RK_INFESTED_ARMOUR": {
    "DT_EXPLOSION": 0.5,
    "DT_FREEZE": -0.25,
    "DT_PUNCTURE": -0.25,
    "DT_RADIATION": -0.5
  },
  "RK_INFESTED_FLESH": {
    "DT_FIRE": -0.5,
    "DT_FREEZE": 0.5,
    "DT_GAS": -0.5,
    "DT_SLASH": -0.5
  },
  "RK_MACHINERY": {
    "DT_ELECTRICITY": -0.5,
    "DT_EXPLOSION": -0.75,
    "DT_IMPACT": -0.25,
    "DT_POISON": 0.25,
    "DT_VIRAL": 0.25
  },
  "RK_ROBOTIC": {
    "DT_ELECTRICITY": -0.5,
    "DT_POISON": 0.25,
    "DT_PUNCTURE": -0.25,
    "DT_RADIATION": -0.25,
    "DT_SLASH": 0.25
  },
  "RK_SHIELD": {
    "DT_FREEZE": -0.5,
    "DT_IMPACT": -0.5,
    "DT_MAGNETIC": -0.75,
    "DT_PUNCTURE": 0.2,
    "DT_RADIATION": 0.25
  },
  "RK_TENNO_ARMOR": {
  },
  "RK_TENNO_FLESH": {
  },
  "RK_TENNO_SHIELD": {
    "DT_CORROSIVE": 0.25,
    "DT_ELECTRICITY": 0.25,
    "DT_EXPLOSION": 0.25,
    "DT_FIRE": 0.25,
    "DT_FREEZE": 0.25,
    "DT_GAS": 0.25,
    "DT_IMPACT": 0.25,
    "DT_MAGNETIC": 0.25,
    "DT_POISON": 0.25,
    "DT_PUNCTURE": 0.25,
    "DT_RADIANT": 0.25,
    "DT_RADIATION": 0.25,
    "DT_SENTIENT": 0.25,
    "DT_SLASH": 0.25,
    "DT_VIRAL": 0.25
  },
};

export function describeHealthType(type: HealthType) {
  const table = ResistanceTable[type];
  let text = getHealthTypeName(type);
  const resText = Object.keys(table).map(dType => {
    const modif = -table[dType]!;
    return `${getDamageTypeName(dType as DamageType)}: ${modif > 0 ? "+" : ""}${modif * 100}%`;
  }).join(", ");
  if (resText !== "")
    text = `${text} (${resText})`;
  return text;
}
