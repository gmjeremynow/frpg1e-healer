/** Healer tab on the character and NPC sheets: title, hit dice, abilities by level and reminders. */
import * as HE from "./rules.mjs";

const esc = s => (globalThis.foundry?.utils?.escapeHTML ? foundry.utils.escapeHTML(String(s ?? "")) : String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]));
const box = (title, body) => `<div class="box"><h3 class="box-title">${title}</h3>${body}</div>`;

export function renderHealerTab(app, element) {
  const root = element instanceof HTMLElement ? element : element?.[0] ?? app.element;
  const actor = app.actor ?? app.document;
  if (!root || !actor || !["character", "npc"].includes(actor.type)) return;
  const tabs = root.querySelector(".sheet-tabs"), scroll = root.querySelector(".tab-scroll");
  root.querySelector(".tab-body[data-tab='healer']")?.remove();
  tabs?.querySelector("[data-tab='healer']")?.remove();
  const html = tabHTML(actor);
  if (!tabs || !scroll || !html) return;
  const btn = document.createElement("button");
  btn.type = "button"; btn.dataset.action = "sheetTab"; btn.dataset.tab = "healer"; btn.textContent = "Healer";
  tabs.append(btn);
  const sec = document.createElement("section");
  sec.className = "tab-body he-tab"; sec.dataset.tab = "healer"; sec.innerHTML = html;
  scroll.append(sec);
  if (app._tab === "healer") { btn.classList.add("active"); sec.classList.add("active"); }
}

/** The tab's HTML, or "" when the actor has no healer class. */
export function tabHTML(actor) {
  const s = actor.system;
  const c = (s.classInfo ?? []).find(x => x.key === HE.KEY);
  if (!c) return "";
  const L = Math.max(1, c.level ?? 1);
  const [, title, , dice] = HE.row(L);
  const limit = HE.raceLimit(s.details?.race);
  const sl = HE.SPELLS[Math.min(L, HE.MAX_LEVEL)] ?? [];
  const out = [];
  out.push(box(`Healer ${L}: ${esc(title)} <span class="hint">(${HE.SRC})</span>`, `
    <table class="he-table">
      <tr><th>Hit dice</th><td>${dice} (d8)</td><td class="hint">8-sided; 10 dice at 10th level, then +1 hit point a level.</td></tr>
      <tr><th>Healer spells</th><td>${sl.map((n, i) => `${HE.ord(i + 1)} ${n}`).join(", ") || "—"}</td><td class="hint">No bonus spells for wisdom are given in the article.</td></tr>
      <tr><th>Race limit</th><td>${limit === null ? "none" : limit === 0 ? "not allowed" : `${HE.ord(limit)} level`}</td><td class="hint">Dwarves to 10th (Medic); halflings, half-elves and elves to 14th.</td></tr>
    </table>`));
  out.push(box("Abilities", `<ul class="he-list">${HE.ABILITIES.map(([lv, t]) => `<li class="${L >= lv ? "" : "he-later"}">${L >= lv ? "" : `<em>From ${HE.ord(lv)} level:</em> `}${t}</li>`).join("")}</ul>`));
  out.push(box("Rules to remember", `<ul class="he-list">
    <li>Intelligence, wisdom and dexterity 15 or more. Lawful or neutral only: a chaotic healer is not possible, and a healer forced to change alignment becomes a mere fighter. A healer can never switch class.</li>
    <li>No armor or shield. Any weapons and magic items, but magical books, librams and tomes never help a healer and can only harm.</li>
    <li>In The Dragon #3 the editor says many of these sub-classes are meant as non-player characters.</li>
  </ul>`));
  return out.join("");
}
