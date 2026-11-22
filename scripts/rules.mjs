/**
 * Healers (C. Hettlestad, "Healers", The Dragon #3, October 1976, p.22-23; reprinted in The Best of Dragon vol. II, p.12-13).
 * Pure data and functions, no Foundry calls, so the tests can load it directly.
 */
export const KEY = "healer";
export const LIST = "healer";
export const MID = "frpg1e-healer";
export const SRC = "The Dragon #3 p.22-23";

/** Level table (The Dragon #3 p.22): [level, title, experience, 8-sided hit dice]. */
export const LEVELS = [null,
  [1, "Apprentice", 0, "1"], [2, "Frosh", 5000, "2"], [3, "Sophomore", 10000, "3"], [4, "Junior", 15000, "4"], [5, "Senior", 25000, "5"],
  [6, "Intern", 50000, "6"], [7, "Resident", 100000, "7"], [8, "Senior Resident", 200000, "8"], [9, "Practitioner", 300000, "9"],
  [10, "Medic", 400000, "10"], [11, "Doctor", 500000, "10+1"], [12, "Doctor, 12th", 600000, "10+2"], [13, "Doctor, 13th", 700000, "10+3"],
  [14, "Doctor, 14th", 800000, "10+4"], [15, "Doctor, 15th", 900000, "10+5"], [16, "Doctor, 16th", 1000000, "10+6"],
  [17, "Doctor, 17th", 1100000, "10+7"], [18, "Doctor, 18th", 1200000, "10+8"], [19, "Doctor, 19th", 1300000, "10+9"],
  [20, "Doctor, 20th", 1400000, "10+10"], [21, "Doctor, 21st", 1500000, "10+11"], [22, "Doctor, 22nd", 1600000, "10+12"],
  [23, "Doctor, 23rd", 1700000, "10+13"], [24, "Doctor, 24th", 1800000, "10+14"], [25, "Doctor, 25th", 1900000, "10+15"]];
export const MAX_LEVEL = 25;
export const row = L => LEVELS[Math.min(MAX_LEVEL, Math.max(1, L))];
export const ARTICLE_XP = LEVELS.slice(1).map(r => r[2]);

/** Spells & level (The Dragon #3 p.22). */
export const SPELLS = { 1: [1], 2: [1], 3: [1, 1, 1], 4: [2, 1, 1, 1], 5: [2, 2, 1, 1, 1], 6: [2, 2, 2, 1, 1, 1], 7: [3, 2, 2, 2, 1, 1, 1],
  8: [3, 3, 2, 2, 2, 1, 1], 9: [3, 3, 3, 2, 2, 2, 1], 10: [4, 3, 3, 3, 2, 2, 2], 11: [4, 4, 3, 3, 3, 2, 2], 12: [4, 4, 4, 3, 3, 3, 2],
  13: [5, 4, 4, 4, 3, 3, 3], 14: [5, 5, 4, 4, 4, 3, 3], 15: [5, 5, 5, 4, 4, 4, 3], 16: [6, 5, 5, 5, 4, 4, 4], 17: [6, 6, 5, 5, 5, 4, 4],
  18: [6, 6, 6, 5, 5, 5, 4], 19: [7, 6, 6, 6, 5, 5, 5], 20: [7, 7, 6, 6, 6, 5, 5], 21: [7, 7, 7, 6, 6, 6, 5], 22: [8, 7, 7, 7, 6, 6, 6],
  23: [8, 8, 7, 7, 7, 6, 6], 24: [8, 8, 8, 7, 7, 7, 6], 25: [9, 8, 8, 8, 7, 7, 7] };
/** Magic-user spells "in addition": four 1st level from 16th, four 2nd level from 20th. */
export const MU_SPELLS = Object.fromEntries(Array.from({ length: 10 }, (_, i) => 16 + i).map(l => [l, l >= 20 ? [4, 4] : [4]]));

export const MINIMUMS = { int: 15, wis: 15, dex: 15 };
/** Race limits: null = none; dwarf 10th (Medic); halfling, half-elf and elf 14th; others not allowed (0). */
export function raceLimit(race) {
  const r = String(race ?? "");
  if (!r || r === "human") return null;
  if (r.startsWith("dwarf")) return 10;
  if (r.startsWith("halfling") || r.startsWith("half-elf") || r.startsWith("elf")) return 14;
  return 0;
}
export const ABILITIES = [[4, "Senses molds, slimes and the like within 40 feet."], [8, "Can identify the general type of a potion."],
  [12, "Can read magic-user and cleric scrolls."], [16, "Can use four 1st level magic-user spells, as well as healer spells."],
  [20, "Can use four 2nd level magic-user spells, as well as healer spells."]];

/** cleric: the system's cleric class (experience by default, as chosen for this table). */
export function classDef(cleric = null) {
  return {
    label: "Healer (The Dragon #3)", source: "The Dragon #3", src: "The Dragon #3",
    hitDie: 8, firstDice: 1, maxHD: 10, afterHP: 1, matrix: "cleric", save: "cleric",
    fighterCon: false, nonProf: -3, maxLevel: MAX_LEVEL, wisBonusSpells: false,
    spells: [{ list: LIST, progression: "healer" }, { list: "magicuser", progression: "healerMagicuser" }],
    profSlots: [2, 3, 1, 1, 4],
    xp: [...(cleric?.xp ?? [0, 1501, 3001, 6001, 13001, 27501, 55001, 110001, 225001, 450001, 675001])], xpStep: cleric?.xpStep ?? 225000
  };
}
export const ord = n => `${n}${[, "st", "nd", "rd"][n % 100 > 10 && n % 100 < 14 ? 0 : n % 10] ?? "th"}`;
