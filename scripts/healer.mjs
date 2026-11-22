/**
 * Healer (The Dragon #3) for 1e FRPG (Table Edition). An optional add-on: enable or disable it in Manage Modules.
 * Registers the healer and its spell list from "Healers" (C. Hettlestad, The Dragon #3, October 1976; The Best of Dragon
 * vol. II), adds a Healer tab, and builds world compendia with the spells and the rules.
 */
import * as HE from "./rules.mjs";
import { renderHealerTab } from "./sheet-tab.mjs";
import { offerImport, importCompendia } from "./compendia.mjs";

const MID = HE.MID;
let API = null;

Hooks.once("frpg1e.init", api => {
  API = api;
  if (!api.registerSpellList || !api.hideClasses) { console.error(`${MID} | needs 1e FRPG 0.36.0 or later`); return; }
  api.registerSpellList(HE.LIST, "Healer");
  api.registerSpellProgression("healer", HE.SPELLS);
  api.registerSpellProgression("healerMagicuser", HE.MU_SPELLS);
  api.registerClass(HE.KEY, HE.classDef(api.CLASSES?.cleric));
});

/** Experience: the cleric's table (default) or the article's. */
export function applyXP(which) {
  const api = game.frpg1e?.api ?? API, def = api?.CLASSES?.[HE.KEY];
  if (!def) return;
  if (which === "article") { def.xp = [...HE.ARTICLE_XP]; def.xpStep = 0; }
  else { def.xp = [...api.CLASSES.cleric.xp]; def.xpStep = api.CLASSES.cleric.xpStep; }
  for (const a of game.actors ?? []) if ((a.system?.classInfo ?? []).some(c => c.key === HE.KEY)) { a.prepareData?.(); a.sheet?.rendered && a.sheet.render(); }
}

Hooks.once("init", () => {
  game.settings.register(MID, "xpTable", { name: "Healer experience table", scope: "world", config: true, type: String, default: "cleric",
    choices: { cleric: "Cleric (PHB)", article: "The Dragon #3 table (to 25th level)" }, onChange: v => applyXP(v), requiresReload: false });
  game.settings.register(MID, "compendiaVersion", { scope: "world", config: false, type: String, default: "" });
  game.settings.registerMenu(MID, "rebuild", { name: "Healer compendia", label: "Rebuild the healer compendia", icon: "fa-solid fa-book",
    type: class extends foundry.applications.api.ApplicationV2 { render() { importCompendia({ confirm: true }); return this; } }, restricted: true });
  game.healer = { importCompendia, rules: HE };
});

Hooks.once("setup", () => applyXP(game.settings.get(MID, "xpTable")));
Hooks.once("ready", () => {
  if (!API?.registerSpellList) ui.notifications.error("Healer needs 1e FRPG (Table Edition) 0.36.0 or later.", { permanent: true });
  else if (game.user.isGM) offerImport();
});

/** Requirement notes on the Record tab. Nothing here changes the numbers. */
export function prepareHealer(sys, items = []) {
  const classes = sys.classInfo ?? [];
  const c = classes.find(x => x.key === HE.KEY);
  if (!c) return;
  const notes = sys.settingNotes ?? (sys.settingNotes = []);
  const T = "Healer (The Dragon #3)";
  const ab = sys.abilities ?? {};
  const low = Object.entries(HE.MINIMUMS).filter(([k, m]) => (ab[k]?.value ?? 0) < m).map(([k, m]) => `${k.toUpperCase()} ${m}`);
  if (low.length) notes.push(`${T}: below the minimum ability scores (${low.join(", ")}).`);
  const limit = HE.raceLimit(sys.details?.race);
  if (limit === 0) notes.push(`${T}: healers are human, dwarf, halfling, half-elf or elf.`);
  else if (limit && (c.level ?? 1) > limit) notes.push(`${T}: this race can reach ${HE.ord(limit)} level at most.`);
  if ((c.level ?? 1) > HE.MAX_LEVEL) notes.push(`${T}: the article's table ends at 25th level.`);
  const al = String(sys.details?.alignment ?? "").toLowerCase();
  if (/chaotic|^c[gne]$/.test(al)) notes.push(`${T}: healers must be lawful or neutral; a healer forced to change alignment becomes a mere fighter.`);
  if (classes.length > 1) notes.push(`${T}: a healer can never switch class.`);
  const list = Array.isArray(items) ? items : [...(items ?? [])];
  for (const a of list.filter(i => i.type === "armor" && i.system?.equipped)) notes.push(`${T}: healers may not wear armor or carry a shield (${a.name}).`);
}
Hooks.on("frpg1e.prepareCharacter", (sys, items) => prepareHealer(sys, items));
Hooks.on("renderCharacterSheet", (app, element) => renderHealerTab(app, element));
