/** World compendia built from the module's JSON (same approach as the system: no compiled LevelDB packs). */
const MID = "frpg1e-healer";
export const DATA_VERSION = "2";

const PACKS = [
  { name: "healer-rules", label: "Healer (The Dragon #3)", file: "journals.json", type: "JournalEntry", folder: d => d.folder },
  { name: "healer-spells", label: "Healer Spells", file: "spells.json", type: "Item", folder: d => d.folder }
];
const CLS = { Item: () => Item, Actor: () => Actor, JournalEntry: () => JournalEntry, RollTable: () => RollTable };

export async function offerImport() {
  if (game.settings.get(MID, "compendiaVersion") === DATA_VERSION) return;
  const ok = await foundry.applications.api.DialogV2.confirm({
    window: { title: "Healer: Compendia" },
    content: "<p>Create the Healer world compendia (the healer spells and the article in plain words)?</p><p class=\"hint\">You can do this later from Game Settings → Configure Settings → Healer.</p>",
    rejectClose: false
  });
  if (ok) await importCompendia();
  else await game.settings.set(MID, "compendiaVersion", DATA_VERSION);
}

export async function importCompendia({ confirm = false } = {}) {
  if (!game.user.isGM) return;
  if (confirm) {
    const ok = await foundry.applications.api.DialogV2.confirm({ window: { title: "Rebuild the Healer Compendia" },
      content: "<p>Rebuild the Healer compendia? Existing copies in this world are replaced.</p>", rejectClose: false });
    if (!ok) return;
  }
  const CC = foundry.documents.collections.CompendiumCollection;
  for (const def of PACKS) {
    let data;
    try { data = await (await fetch(`modules/${MID}/data/${def.file}`)).json(); } catch { continue; }
    if (!data?.length) continue;
    const existing = game.packs.get(`world.${def.name}`);
    if (existing) await existing.deleteCompendium();
    const pack = await CC.createCompendium({ name: def.name, label: def.label, type: def.type });
    const names = [...new Set(data.map(def.folder).filter(Boolean))];
    const folders = names.length ? await Folder.createDocuments(names.map((name, i) => ({ name, type: def.type, sorting: "m", sort: i * 10 })), { pack: pack.collection }) : [];
    const byName = new Map(folders.map(f => [f.name, f.id]));
    const docs = data.map(d => { const { folder, ...rest } = d; return { ...rest, folder: byName.get(folder) ?? null }; });
    const cls = CLS[def.type]();
    for (let i = 0; i < docs.length; i += 50) await cls.createDocuments(docs.slice(i, i + 50), { pack: pack.collection });
    ui.notifications.info(`${def.label}: ${docs.length} entries.`);
  }
  await game.settings.set(MID, "compendiaVersion", DATA_VERSION);
}
