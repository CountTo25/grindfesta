import { COMPLETION_EFFECTS, CONDITION_CHECKS, REVEAL } from "../../utils";
import { TAGS } from "../tags";
import {
  CROSSGEN,
  NO_CROSSGEN,
  NO_REPEAT,
  REPEATABLE,
  type ActionRepository,
} from "./utils";

const JIHANKI_COP_CONDITIONS = {
  conditions: [
    CONDITION_CHECKS.flag(TAGS.NA641.REPUTATION.COPS_ALERT),
    CONDITION_CHECKS.flag(
      TAGS.NA641.REPUTATION.COPS_ALERT_REASON,
      (v) => v === TAGS.NA641.COPS_ALERT_REASONS.JIHANKI
    ),
  ],
};
export const na641miscActions: ActionRepository = {
  na641cops_jihanki_yap: {
    title: "Yap your way out of problems",
    flavourText:
      "This is just a huge misunderstanding! Just looking for lost wallet",
    ...REVEAL.skillCheck("social", 20),
    skill: "social",
    weight: 150,
    ignoresStaticLock: true,
    ...REPEATABLE,
    ...NO_CROSSGEN,
    stopOnRepeat: true,
    ...JIHANKI_COP_CONDITIONS,
    postComplete: [
      COMPLETION_EFFECTS.removeFlag(TAGS.NA641.REPUTATION.COPS_ALERT),
      COMPLETION_EFFECTS.removeFlag(TAGS.SYSTEM.ACTION_LOCK),
      COMPLETION_EFFECTS.patchFlagNumeric(TAGS.NA641.SUS_LEVEL, (v) =>
        Math.max(0, --v)
      ),
    ],
  },
  na641cops_jihanki_run: {
    title: "Run from guards",
    flavourText: "Lets hope you can scram fast enough",
    ...REVEAL.all([
      REVEAL.hasKnowledge("narcadia_west_main_street_acchikocchi"),
      REVEAL.skillCheck("exploration", 15),
    ]),
    skill: "exploration",
    weight: 250,
    ignoresStaticLock: true,
    ...REPEATABLE,
    ...NO_CROSSGEN,
    stopOnRepeat: true,
    ...JIHANKI_COP_CONDITIONS,
    postComplete: [
      COMPLETION_EFFECTS.removeFlag(TAGS.NA641.REPUTATION.COPS_ALERT),
      COMPLETION_EFFECTS.removeFlag(TAGS.SYSTEM.ACTION_LOCK),
    ],
  },
  na641cops_get_caught: {
    title: "Get caught",
    flavourText: "For now just lets you go (lol)",
    skill: "social",
    weight: 30,
    ignoresStaticLock: true,
    ...REPEATABLE,
    ...NO_CROSSGEN,
    stopOnRepeat: true,
    ...JIHANKI_COP_CONDITIONS,
    postComplete: [
      COMPLETION_EFFECTS.removeFlag(TAGS.NA641.REPUTATION.COPS_ALERT),
      COMPLETION_EFFECTS.removeFlag(TAGS.SYSTEM.ACTION_LOCK),
    ],
  },
};
