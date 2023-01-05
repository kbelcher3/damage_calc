import { Decimal } from "decimal.js";
import { Modifiers } from "./modifiers";
import { Enemy, FactionType } from "./enemy";
import { DamageMap } from "./weapon";
import { ModStat, ModUpgradeType, ModOperationType, PlaceholderRivenMod } from "./mod";
import { Build } from "../lib/build";
import { ResistanceTable, DamageType } from "./healthDamageType";

export function applyEnemyResistance(map: DamageMap, enemy: Enemy,
                              factionModifier: { [key in FactionType]?: Decimal }) {
  const armorAmount = enemy.levelScaling().armor;
  const ret = Object.keys(map).reduce((sum, key) => {
    const amount = map[key];
    const hm = ResistanceTable[enemy.stats.healthType][key] || 0;
    const amount_a = amount.mul(new Decimal(1).sub(hm));

    if (armorAmount.gt(0)) {
      const am = new Decimal(ResistanceTable[enemy.stats.armorType][key] || 0);
      return sum.add(amount_a.mul(new Decimal(1).sub(am)).div(
        armorAmount.mul(new Decimal(1).add(am)).div(300).add(1)));
    } else
      return sum.add(amount_a);
  }, new Decimal(0));
  let modifier = factionModifier[enemy.stats.faction];
  if (modifier !== undefined) {
    if (modifier.lte(-1))
      modifier = new Decimal(0);
    return ret.mul(modifier.add(1));
  }
  return ret;
}

const compoundDamageTypes: {
  [k in DamageType]?: [DamageType, DamageType]
} = {
  "DT_EXPLOSION": [DamageType.DT_FIRE, DamageType.DT_FREEZE],
  "DT_GAS": [DamageType.DT_FIRE, DamageType.DT_POISON],
  "DT_RADIATION": [DamageType.DT_FIRE, DamageType.DT_ELECTRICITY],
  "DT_VIRAL": [DamageType.DT_FREEZE, DamageType.DT_POISON],
  "DT_MAGNETIC": [DamageType.DT_FREEZE, DamageType.DT_ELECTRICITY],
  "DT_CORROSIVE": [DamageType.DT_POISON, DamageType.DT_ELECTRICITY],
};

function addPhysicalDamage(dist: DamageMap, key: string, inc: Decimal, base: Decimal) {
  if (dist[key] === undefined)
    dist[key] = new Decimal(0);
  dist[key] = dist[key].add(new Decimal(base).mul(inc));
}

function addElementalDamage(dist: DamageMap, key: string, inc: Decimal) {
  const maybe = Object.keys(compoundDamageTypes)
    .filter(c => compoundDamageTypes[c].includes(key));
  const combined = maybe.find(c => dist[c] !== undefined);
  if (combined !== undefined)
    dist[combined] = dist[combined].add(inc);
  else {
    const found = maybe.find(c => {
      const other = compoundDamageTypes[c].find((d: string) => d !== key);
      if (dist[other] !== undefined) {
        dist[c] = dist[other].add(inc);
        delete dist[other];
        return true;
      }
      return false;
    });
    if (!found) {
      if (dist[key] === undefined)
        dist[key] = new Decimal(0);
      dist[key] = dist[key].add(inc);
    }
  }
}

function applyModifier(
  value: Decimal | number,
  modifier: { [k2 in ModOperationType]: Decimal | null } | undefined,
  minValue: Decimal | number,
  maxValue?: Decimal | number
) {
  if (modifier === undefined)
    return new Decimal(value);
  const ret = modifier.SET ||
    modifier.MUL!.mul(value).mul(modifier.MUL_ADD!.add(1)).add(modifier.ADD!);
  if (minValue !== undefined && ret.lt(minValue))
    return new Decimal(minValue);
  if (maxValue !== undefined && ret.gt(maxValue))
    return new Decimal(maxValue);
  return ret;
}

export interface CalcResult {
  magazineSize: Decimal;
  fireRate: Decimal;
  reloadTime: Decimal;
  critChance: Decimal;
  critDamage: Decimal;
  damageDist: DamageMap;
  damageAmount: Decimal;
  pellets: Decimal;
  procChance: Decimal;
  procChancePerPellet: Decimal;

  damageSteps: Array<[Decimal, Decimal, string]>;
  damagePerShot: Decimal;
  burstDps: Decimal;
  sustainedDps: Decimal;
}

export function Calculate(
  build: Build,
  modifiers: Modifiers
): CalcResult {
  const weapon = build.weapon;
  const activeModStats: ModStat[][] = [];
  build.mods.forEach(smod => {
    // XXX
    if (smod.mod === PlaceholderRivenMod)
      activeModStats.push(build.riven.stats);
    else
      activeModStats.push(smod.scaledModStats);
  });
  build.localModifiers.forEach(modifier =>
    activeModStats.push(modifier.modStats(build.modifiersParameters)));
  modifiers.globalModifiers.forEach(modifier =>
    activeModStats.push(modifier.modStats(build.modifiersParameters)));
  if (modifiers.switches.enableInnateBuffs)
    activeModStats.push(...weapon.defaultUpgrades);
  if (weapon.applyAbilityStrength !== undefined)
    activeModStats.push(weapon.applyAbilityStrength(modifiers.abilityStrength));

  const moddedDistStacked: DamageMap = {};
  const moddedDistStacked2: DamageMap = {};
  const factionModifier: { [key in FactionType]?: Decimal } = {};
  const mdata: {
    [key in ModUpgradeType]?: {
      ADD: Decimal, MUL_ADD: Decimal, MUL: Decimal, SET: Decimal | null
    }
  } = {};

  activeModStats.forEach(mod => {
    mod.slice().reverse().forEach(item => {
      if (item.upgrade.isPlaceholder())
        return;
      if (item.upgrade.compatibility &&
          !weapon.isCompatible(item.upgrade.compatibility))
        return;
      switch (item.upgrade.upgradeType) {
        case ModUpgradeType.elemental:
          if (item.upgrade.operationType === "MUL_ADD") // Physical
            addPhysicalDamage(moddedDistStacked, item.upgrade.argument!, item.value,
                              weapon.damage[item.upgrade.argument!] || new Decimal(0));
          else if (item.upgrade.operationType === "ADD") // Elemental
            addElementalDamage(moddedDistStacked, item.upgrade.argument!, item.value);
          else
            throw new Error("unexpected operation type on elemental mod");
          break;
        case ModUpgradeType.elemental_nocombine:
          if (item.upgrade.operationType === "ADD") // Elemental (Non-Combining)
            addElementalDamage(moddedDistStacked2, item.upgrade.argument!, item.value);
          else
            throw new Error("unexpected operation type on elemental_nocombine mod");
          break;
        case ModUpgradeType.faction_damage:
          if (item.upgrade.operationType !== "MUL_ADD")
            throw new Error("unexpected operation type on faction damage mod");
          factionModifier[item.upgrade.argument!] =
            (factionModifier[item.upgrade.argument!] || new Decimal(0)).add(item.value);
          break;
        default:
          if (mdata[item.upgrade.upgradeType] === undefined)
            // [ADD, MUL_ADD, MUL, SET]
            mdata[item.upgrade.upgradeType] =
              { ADD: new Decimal(0), MUL_ADD: new Decimal(0), MUL: new Decimal(1), SET: null };
          if (item.upgrade.operationType === "SET")
            mdata[item.upgrade.upgradeType]![item.upgrade.operationType] = item.value;
          else
            mdata[item.upgrade.upgradeType]![item.upgrade.operationType] =
              mdata[item.upgrade.upgradeType]![item.upgrade.operationType]!.add(item.value);
          break;
      }
    });
  });

  // Add weapon's damage map (applied after mods)
  Object.keys(weapon.damage).forEach(key => {
    const dist = moddedDistStacked;
    switch (key) {
      case "DT_FREEZE": case "DT_ELECTRICITY": case "DT_FIRE": case "DT_POISON":
        addElementalDamage(dist, key, weapon.damage[key]!);
        break;
      case "DT_IMPACT": case "DT_PUNCTURE": case "DT_SLASH":
      default: // Compound damage types
        if (dist[key] === undefined)
          dist[key] = weapon.damage[key];
        else
          dist[key] = dist[key].add(weapon.damage[key]);
        break;
    }
  });

  // Fix damage map (remove negative damages) and merge with non-combining map
  Object.keys(moddedDistStacked).forEach(key => {
    if (moddedDistStacked[key].lte(0))
      delete moddedDistStacked[key];
  });
  Object.entries(moddedDistStacked2).forEach(([key, value]) => {
    if (moddedDistStacked[key])
      moddedDistStacked[key] = moddedDistStacked[key].add(value);
    else
      moddedDistStacked[key] = value;
  });

  // Headshot or not - used later
  const isHeadshot = applyModifier(0, mdata.switch_headshot, 0).gt(0);

  // Calculate base stats
  let damageBeforeScaling = applyEnemyResistance(
    moddedDistStacked, modifiers.enemy, factionModifier);
  // Apply body part multiplier and sniper headshot multiplier
  if (isHeadshot)
    damageBeforeScaling = damageBeforeScaling.mul(
      applyModifier(modifiers.enemy.stats.headshotMultiplier, mdata.headshot_bonus, 0));
  // Apply sniper combo multiplier
  damageBeforeScaling = damageBeforeScaling.mul(applyModifier(1, mdata.sniper_combo, 1));
  // Apply Damage Multiplier (Roar)
  damageBeforeScaling = damageBeforeScaling.mul(
    new Decimal(1).add(applyModifier(0, mdata.damage_multiply_roar, 0)));
  // Apply Damage Multiplier (Eclipse)
  damageBeforeScaling = damageBeforeScaling.mul(
    new Decimal(1).add(applyModifier(0, mdata.damage_multiply_eclipse, 0)));
  // Apply Damage Multiplier (Void Strike)
  damageBeforeScaling = damageBeforeScaling.mul(
    applyModifier(1, mdata.damage_multiply_void_strike, 1));
  const expectedBaseDamage =
    applyModifier(
      applyModifier(
        damageBeforeScaling.mul(weapon.damageAmount),
        mdata.damage, 0),
      mdata.damage_aimed, 0);
  // Apply BossDamageMitigaion (multiplier part only)
  let mitigatedBaseDamage = expectedBaseDamage;
  let dm = modifiers.enemy.stats.damageMitigation;
  if (dm)
    mitigatedBaseDamage = mitigatedBaseDamage.mul(dm.multiplier);

  let moddedCriticalChance = applyModifier(weapon.critChance, mdata.crit_chance, 0);
  // Apply Harrow's Covenant
  if (mdata.buff_harrow) {
    let val = applyModifier(0, mdata.buff_harrow, 0);
    if (isHeadshot)
      val = val.mul(4);
    moddedCriticalChance = moddedCriticalChance.add(val);
  }
  let moddedCriticalMultiplier = applyModifier(weapon.critDamage, mdata.crit_damage, 0);
  if (mdata.crit_damage_buff_volt_odonata !== undefined)
    moddedCriticalMultiplier = moddedCriticalMultiplier.mul(2);
  // Apply headshot critical multiplier
  if (isHeadshot && (dm === undefined || dm.useCriticalHeadshot))
    moddedCriticalMultiplier = moddedCriticalMultiplier.mul(2);
  const moddedPellets = applyModifier(weapon.pellets, mdata.multishot, 0);
  const magazineSize = applyModifier(weapon.magazineSize, mdata.magazine_size, 1).round();
  const rawFireRate = applyModifier(weapon.fireRate, mdata.fire_rate, 0);

  // Normalize damage distribution
  const moddedDistStackedSum = Object.keys(moddedDistStacked)
    .reduce((s, m) => s.add(moddedDistStacked[m]), new Decimal(0));
  const moddedDistNormalized: DamageMap = {};
  Object.keys(moddedDistStacked).map(type =>
    moddedDistNormalized[type] = moddedDistStacked[type]!.div(moddedDistStackedSum));

  // Build damageSteps
  let steps: Array<[Decimal, Decimal, string]> = [];
  {
    const cm = moddedCriticalChance.floor();
    const cc = moddedCriticalChance.sub(cm), subCc = new Decimal(1).sub(cc);
    // Vigilante Mods don't exist more than 6
    const vig = modifiers.switches.enableVigilanteBuffs
      ? applyModifier(0, mdata.vigilante, 0, 0.3)
      : new Decimal(0);
    const subVig = new Decimal(1).sub(vig);

    const ncProb = cm.eq(0) ? subCc : subCc.mul(subVig);
    const ccProb = cm.eq(0) ? cc.mul(subVig) : subCc.mul(vig).add(cc.mul(subVig));
    const cvProb = cc.mul(vig);

    let ncDmg = cm.mul(moddedCriticalMultiplier.sub(1)).add(1);
    if (ncDmg.lt(0))
      ncDmg = new Decimal(0);
    let ccDmg = cm.add(1).mul(moddedCriticalMultiplier.sub(1)).add(1);
    if (ccDmg.lt(0))
      ccDmg = new Decimal(0);
    let cvDmg = cm.add(2).mul(moddedCriticalMultiplier.sub(1)).add(1);
    if (cvDmg.lt(0))
      cvDmg = new Decimal(0);
    // Apply BossDamageMitigaion (90% damage reduction with double damage for crits)
    if (dm) {
      const threshold = new Decimal(dm.threshold)
        .div(rawFireRate).div(moddedPellets);
      // Double critical hits
      if (!cm.eq(0))
        ncDmg = ncDmg.mul(2);
      ccDmg = ccDmg.mul(2);
      cvDmg = cvDmg.mul(2);

      // Now check threshold
      const rt = threshold.div(expectedBaseDamage);
      if (expectedBaseDamage.mul(ncDmg).gt(threshold))
        ncDmg = ncDmg.sub(rt).mul(0.1).add(rt);
      if (expectedBaseDamage.mul(ccDmg).gt(threshold))
        ccDmg = ccDmg.sub(rt).mul(0.1).add(rt);
      if (expectedBaseDamage.mul(cvDmg).gt(threshold))
        cvDmg = cvDmg.sub(rt).mul(0.1).add(rt);
    }

    const doit = (baseProb: Decimal, bullets: number) => {
      if (baseProb.eq(0))
        return;
      // nc: Non-Crit, cc: Crit, cv: Crit enhanced by Vigilante Set Mod
      //
      // Probability = baseProb * (bullets! / ncNum! / ccNum! / cvNum!) *
      //                 ncProb^ncNum * ccProb^ccNum * cvProb^cvNum
      // Damage      = ncNum * ncDmg + ccNum * ccDmg + cvNum * cvDmg
      //
      //       -- where ncNum + ccNum + cvNum = bullets
      let ncb = baseProb.mul(ncProb.pow(bullets));
      for (let cvNum = 0; cvNum <= bullets; cvNum++) {
        if (cvNum > 0) {
          if (cvProb.eq(0))
            break;
          ncb = ncb.mul(bullets - cvNum + 1).div(cvNum).mul(cvProb).div(ncProb);
        }

        let ccb = ncb;
        for (let ccNum = 0; ccNum <= bullets - cvNum; ccNum++) {
          const ncNum = bullets - cvNum - ccNum;
          if (ccNum > 0) {
            if (ccProb.eq(0))
              break;
            ccb = ccb.mul(ncNum + 1).div(ccNum).mul(ccProb).div(ncProb);
          }

          let text = `Bullets=${bullets}`;
          let text2: string[] = [];
          if (ncNum > 0) {
            const cl = cm.toNumber();
            const pdmg = ncDmg.mul(mitigatedBaseDamage).toFixed(1);
            text += `, ${cl > 0 ? cl : "Non"}-Crit=${ncNum}`;
            text2.push(` - ${cm.toNumber()}-Crit: ${ncNum}x ${pdmg}`);
          }
          if (ccNum > 0) {
            const cl = cm.toNumber() + 1;
            const pdmg = ccDmg.mul(mitigatedBaseDamage).toFixed(1);
            text += `, ${cl}-Crit=${ccNum}`;
            text2.push(` - ${cl}-Crit: ${ccNum}x ${pdmg}`);
          }
          if (cvNum > 0) {
            const cl = cm.toNumber() + 2;
            const pdmg = cvDmg.mul(mitigatedBaseDamage).toFixed(1);
            text += `, ${cl}-Crit=${cvNum}`;
            text2.push(` - ${cl}-Crit: ${cvNum}x ${pdmg}`);
          }

          steps.push([
            ccb,
            ncDmg.mul(ncNum).add(ccDmg.mul(ccNum)).add(cvDmg.mul(cvNum)),
            [text, ...text2].join("<br />")
          ]);
        }
      }
    };

    const mm = moddedPellets.floor().toNumber();
    const mc = moddedPellets.sub(mm);
    doit(new Decimal(1).sub(mc), mm);
    doit(mc, mm + 1);

    // Negative Multishot
    if (steps.length === 0) {
      steps.push([
        new Decimal(1),
        new Decimal(0),
        "Bullets=0"
      ]);
    }
  }

  // Charged/Primed Chamber
  if (mdata.charged_chamber !== undefined) {
    const p1 = new Decimal(1).div(magazineSize),
      p2 = new Decimal(1).sub(p1);
    const newSteps = Array(steps.length * 2);
    steps.forEach((item, index) => {
      newSteps[index * 2] = [
        item[0].mul(p1),
        item[1].mul(applyModifier(1, mdata.charged_chamber, 0)),
        item[2] + ", Charged Chamber"
      ];
      newSteps[index * 2 + 1] = [
        item[0].mul(p2),
        item[1],
        item[2]
      ];
    });
    steps = newSteps;
  }

  // Remove impossible conditions, and sort by the damage
  steps = steps
    .filter(a => !a[0].equals(0))
    .sort((a, b) => a[1].toNumber() - b[1].toNumber());

  // DPS Calculation
  const reloadTime = weapon.reloadTime.div(applyModifier(1, mdata.reload_speed, 0));
  let fireRate = rawFireRate;
  if (weapon.chargeTime) {
    const cr = applyModifier(new Decimal(1).div(weapon.chargeTime), mdata.fire_rate, 0);
    if (cr < fireRate)
      fireRate = cr;
  }
  const damagePerShot = mitigatedBaseDamage.mul(
    steps.reduce((sum, item) => sum.add(item[0].mul(item[1])), new Decimal(0)));
  const sustainedDps = damagePerShot.mul(magazineSize)
    .div(magazineSize.sub(1).div(fireRate).add(reloadTime));
  const burstDps = magazineSize.gt(1) ? damagePerShot.mul(fireRate) : sustainedDps;

  // Status Chance
  const moddedProcChanceBeforeMultishot =
    applyModifier(weapon.procChance, mdata.status_chance, 0);
  const moddedProcChancePerPellet = moddedProcChanceBeforeMultishot
    .div(weapon.pellets);
  const moddedProcChancePerShot = moddedProcChanceBeforeMultishot
    .mul(applyModifier(1, mdata.multishot, 0));

  return {
    magazineSize: magazineSize,
    fireRate: fireRate,
    reloadTime: reloadTime,
    critChance: moddedCriticalChance,
    critDamage: moddedCriticalMultiplier,
    damageDist: moddedDistNormalized,
    damageAmount: mitigatedBaseDamage,
    pellets: moddedPellets,
    procChance: moddedProcChancePerShot,
    procChancePerPellet: moddedProcChancePerPellet,

    damageSteps: steps,
    damagePerShot: damagePerShot,
    burstDps: burstDps,
    sustainedDps: sustainedDps,
  };
}
