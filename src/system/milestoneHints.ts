import type { Milestone } from "../gameData/milestones";

const ARTICLE_WORDS = new Set(["a", "an", "the"]);
const WORD_BLACKLIST = new Set(["are", "it", "of", "you"]);
const LEADING_WORD_COUNT = 5;
const TRAILING_WORD_COUNT = 3;

export type MilestoneHint = {
  id: string;
  location: Milestone["location"];
  text: string;
};

function getWords(text: string): string[] {
  return text.match(/[A-Za-z0-9]+(?:['’][A-Za-z0-9]+)*/g) ?? [];
}

function shuffled<T>(values: readonly T[], random: () => number): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function createMilestoneHint(
  milestone: Milestone,
  random: () => number = Math.random,
): MilestoneHint {
  const words = getWords(milestone.text);
  const leadingWords = words.slice(0, LEADING_WORD_COUNT);
  const seen = new Set<string>();
  const trailingCandidates = words
    .slice(LEADING_WORD_COUNT)
    .filter((word) => {
      const normalized = word.toLowerCase();
      if (
        normalized.length < 3 ||
        ARTICLE_WORDS.has(normalized) ||
        WORD_BLACKLIST.has(normalized) ||
        seen.has(normalized)
      ) {
        return false;
      }
      seen.add(normalized);
      return true;
    });
  const trailingWords = shuffled(trailingCandidates, random).slice(
    0,
    TRAILING_WORD_COUNT,
  );
  const fragments = trailingWords.map((word) => `...${word}...`).join(" ");

  return {
    id: milestone.id,
    location: milestone.location,
    text: `${leadingWords.join(" ")}...${fragments ? ` ${fragments}` : ""}`,
  };
}

export function pickMilestoneHints(
  candidates: readonly Milestone[],
  count: number,
  random: () => number = Math.random,
): MilestoneHint[] {
  const targetCount = Math.max(0, count);
  const candidatesByLocation = new Map<
    Milestone["location"],
    Milestone[]
  >();

  for (const milestone of candidates) {
    const locationCandidates =
      candidatesByLocation.get(milestone.location) ?? [];
    locationCandidates.push(milestone);
    candidatesByLocation.set(milestone.location, locationCandidates);
  }

  const locationPools = shuffled(
    [...candidatesByLocation.values()].map((pool) => shuffled(pool, random)),
    random,
  );
  const selected = locationPools
    .map((pool) => pool.shift())
    .filter((milestone): milestone is Milestone => milestone !== undefined)
    .slice(0, targetCount);

  if (selected.length < targetCount) {
    selected.push(
      ...shuffled(locationPools.flat(), random).slice(
        0,
        targetCount - selected.length,
      ),
    );
  }

  return selected.map((milestone) => createMilestoneHint(milestone, random));
}
