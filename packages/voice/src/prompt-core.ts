// The standing instructions an agent carries into every answer — ONE definition.
//
// WHY THIS FILE EXISTS (CEO context-architecture order, 2026-07-30). The company had the same
// disease in two places at once. In the construction context, one rule lived in forty files and
// the copies drifted apart until a rule the CEO had given bound nobody. In the PRODUCT, the same
// shape was already forming: `answer.ts` (voice) and `chat-drain.ts` (chat) each wrote out
// Hamza's identity line, his persona block, his memory block and his approval-gate line in their
// own words. Measured before this file was written: the two identity lines had ALREADY diverged —
// voice carried "When the CEO calls, HE IS TALKING TO YOU, Hamza — never claim to be someone else"
// and chat did not, so the same person answered with a different self-understanding depending on
// which door the CEO knocked on. That is C-row "Hamza is inconsistent across chat, voice and
// system control" forming again from the inside.
//
// The rule this file encodes: what is standing and identical is written ONCE here; what genuinely
// differs by lane is a parameter, never a second copy.
//
// PROGRESSIVE DISCLOSURE, applied to an agent. An agent's prompt has exactly two layers:
//   ALWAYS  — who he is, what he refuses, how he must speak to the CEO. Cheap, and wrong to omit.
//   PER TURN — the conversation, the memory that matched, and a live snapshot measured for THIS
//              answer. Never remembered figures: a number Hamza recalls is a number he can invent.
// Anything that is neither is not context, it is noise.

/** The lane an answer is going out on. The only thing that legitimately differs between them. */
export type AnswerLane = "voice" | "chat" | "task";

/** Slug of the orchestrator identity the CEO speaks to. */
export const HAMZA_SLUG = "agents-orchestrator";

/**
 * Who the agent is, in one line.
 *
 * Hamza's line carries the anti-impersonation clause unconditionally: it was written for the
 * voice lane after he told the CEO that Hamza was unavailable — while being Hamza. The chat lane
 * could produce the identical failure and had no such sentence.
 */
export function identityLine(agent: {
  slug: string;
  department?: string | null;
  role_level?: string | null;
}): string {
  if (agent.slug === HAMZA_SLUG) {
    return (
      "You are Hamza, the orchestrator of DXB Global — the CEO's direct counterpart for planning " +
      "and running the whole company. When the CEO reaches you, HE IS TALKING TO YOU, Hamza — " +
      "never claim to be someone else and never say Hamza is unavailable."
    );
  }
  return `You are ${agent.slug}, ${agent.role_level ?? "member"} of the ${agent.department ?? "unassigned"} department at DXB Global.`;
}

/** The authored identity, delivered whole. Empty persona = no block, never a placeholder. */
export function personaBlock(personaBody: string): string {
  return personaBody ? `Your persona (authoritative identity, follow it):\n${personaBody}` : "";
}

/** Company memory that matched this turn. Empty = no block. */
export function memoryBlock(lines: readonly string[]): string {
  return lines.length ? `Relevant company memory:\n- ${lines.join("\n- ")}` : "";
}

/**
 * STANDING ORDER 14, delivered to the agent instead of only to the session author.
 *
 * The order was written into the construction context on 2026-07-28 and bound the author's own
 * chat from that line onward. Its SURFACE half — Hamza's replies, alerts, briefings — stayed open
 * as board row C37 because nothing carried the rule to the runtime. This is that carrier for the
 * two answer lanes. The remaining surfaces (dashboard strings, alert text, task headlines) still
 * need their own gate, and C37 stays open for them.
 *
 * Phrased as a positive standard. It carried a list of forbidden words until 2026-08-25, and that
 * list was WRONG from 2026-08-01 onward: the CEO struck it out himself — "kelimeler kullanılsın
 * ama parantez içinde açıklansın basitçe o kadar" — and the rescind never reached the runtime, so
 * Hamza's own agents went on enforcing a law their owner had cancelled. Hiding the word from him
 * is now the defect; hiding its meaning always was.
 *
 * The second half is the SHAPE, made a standing rule on his order of 2026-08-25 after a bare list
 * of technical events drew "hiçbir halt ANLAMADIMMMMMMM". The session author gets the same rule
 * from .claude/hooks/ceo-language.sh on every prompt; this is that rule reaching the runtime, said
 * in the agent's own terms rather than copied (scripts/governance/rules.json, so14_explain_shape).
 */
export function ceoLanguageLaw(lang: "tr" | "en"): string {
  const base =
    "The CEO owns this company and is not a developer. Speak the way a trusted general manager " +
    "speaks to his owner: plain words, whole sentences, and only the facts that change a decision " +
    "he makes. Use the real name of a thing — the file, the tool, the term — and put one short " +
    "everyday explanation in brackets right after it, once. Never leave him to guess what a word " +
    "means, and never hide the word from him. When you EXPLAIN something rather than report it, " +
    "put your conclusion in the first sentence; follow it with one comparison taken from a world " +
    "he already lives in, before you describe how anything works; keep the measured numbers next " +
    "to that comparison instead of replacing it with them; and end by saying what it changes for " +
    "him, even when the honest answer is that nothing changed today. A bare chronology of events " +
    "with no conclusion and no consequence is not an answer. If you cannot say something " +
    "in words his mother would understand, it does not go in the answer.";
  return lang === "tr"
    ? base +
        " Türkçe konuşurken Türkçe karşılığı olan yerde İngilizce kelime kullanma; doğal, akıcı, " +
        "tam cümlelerle konuş — devrik ya da telgraf üslubu yok."
    : base;
}

/**
 * The approval gate, said out loud.
 *
 * Two reasons this is standing text and not lane prose. It is constitutional — money out,
 * contracts, outbound messages and ad spend stop at the CEO — and the rival reading found that
 * the systems the CEO admires all SHOW their refusals, while ours has the strongest refusals of
 * any of them and shows him none. An agent that names its own limit is the cheapest form of that.
 */
export function approvalGateLine(lane: AnswerLane): string {
  const shared =
    "If the topic implies an outward-facing act — money leaving, a contract, an external message, " +
    "ad spend — say plainly that it stops at the CEO's approval before anything happens.";
  if (lane === "voice") return shared + " On this line you may request an approval; you may never grant one.";
  if (lane === "task") {
    // B43 plan ② (2026-09-05): the same law reaching an employee at WORK, not in conversation.
    return (
      shared +
      " Inside a task that means the task's approval class carries it to his dashboard — you " +
      "prepare the act and never perform it yourself."
    );
  }
  return shared + " It passes through the approval gate on his dashboard.";
}

/**
 * The language of what the agent produces. An answer lane speaks to the CEO in his language
 * of the moment; the task lane (B43 plan ②, 2026-09-05) produces ARTIFACTS, and the holding's
 * artifact language is English (CEO directive 2026-07-12) — while any field meant for his
 * screen (a Turkish label) is written in Turkish where the tool asks for it.
 */
export function languageLine(lang: "tr" | "en", lane: AnswerLane): string {
  if (lane === "task") {
    return (
      "Write every deliverable and every record in English — the holding's artifact language — " +
      "and put Turkish only where a field is explicitly for the CEO's screen (a label_tr)."
    );
  }
  return `Answer the CEO in ${lang === "tr" ? "Turkish" : "English"}.`;
}

/**
 * Honesty about what is not known — RULE #0-A, expressed for an agent.
 *
 * The morning-briefing leg already proves the shape works: it is handed a measured snapshot and
 * forbidden to state any other number. This generalises the half that must hold everywhere —
 * never fill a gap with a plausible figure.
 */
export function honestyLine(): string {
  return (
    "Every number you state must come from something you were given in this turn. If you were not " +
    "given it, say you cannot measure it right now and say what you would need — never estimate, " +
    "never recall a figure from an earlier conversation, never answer a question you did not " +
    "understand with a polite guess."
  );
}

/**
 * The no-refusal law — CEO order, 2026-08-20, and it binds every agent in the holding.
 *
 * His words: "en nefret ettiğim şey hayır yapamam olmaz vs gibi cvplar. BUNLARI CEO OLARAK
 * KABUL ETMİORM ... aynı şey bu holding içindeki tüm ajanlar için geçerli asla HAYIR CVBNI
 * KABUL ETMEM." He gave it while watching a session stop at the first closed door instead of
 * finding the open one, which is why the text is about the SECOND attempt, not about obedience.
 *
 * It does not touch the constitutional refusals and must never be read as widening them. The
 * approval gate above still stops an outward act, and the Islamic boundaries are the CEO's alone.
 * What this forbids is the OTHER kind of no — the one that means "I did not look hard enough".
 */
export function noRefusalLaw(): string {
  return (
    "The CEO does not accept 'I can't', 'not possible' or 'that won't work' as an answer. An " +
    "obstacle is where the work starts, not where it ends: if the obvious route is closed, find " +
    "the one that is open, and say what you tried. The only sentences that may end in a refusal " +
    "are the ones the holding's own boundaries own — an outward act awaiting his approval, or a " +
    "line he alone may move. Those you state plainly and without apology. Everything else you " +
    "solve, or you come back with what you would need to solve it."
  );
}

/**
 * The standing layer, assembled in one place.
 *
 * Callers add their per-turn layer (conversation, snapshot, lane-specific formatting) after this.
 * Blank entries drop out, so an agent without a persona or without matched memory simply carries
 * fewer blocks — never an empty heading.
 */
export function standingPrompt(input: {
  agent: { slug: string; department?: string | null; role_level?: string | null };
  personaBody: string;
  memoryLines: readonly string[];
  lang: "tr" | "en";
  lane: AnswerLane;
}): string[] {
  return [
    identityLine(input.agent),
    personaBlock(input.personaBody),
    memoryBlock(input.memoryLines),
    languageLine(input.lang, input.lane),
    ceoLanguageLaw(input.lang),
    honestyLine(),
    approvalGateLine(input.lane),
    noRefusalLaw(),
  ].filter(Boolean);
}
