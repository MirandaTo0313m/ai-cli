import type { StopCondition, ToolSet } from 'ai';

interface ToolOutput {
  error?: string;
}

type Step = {
  toolCalls?: Array<{ toolName: string; args?: unknown }>;
  toolResults?: Array<{ output?: unknown }>;
};

function tcKey(tc: { toolName: string; args?: unknown }): string {
  return `${tc.toolName}:${JSON.stringify(tc.args ?? {})}`;
}

/** Deduplicated, sorted set of tool-call keys for a step. */
function stepSignature(step: Step): string {
  if (!step.toolCalls || step.toolCalls.length === 0) return '';
  return [...new Set(step.toolCalls.map(tcKey))].sort().join('|');
}

/**
 * Detects stuck agents via three heuristics:
 *
 * 1. Error loops — 3+ consecutive steps where every tool result is an error.
 * 2. Repetition — flatten all tool calls from the last 4+ steps; if every
 *    individual call is identical (same name + args), stop. Handles cases
 *    where a step has 1 or 2 parallel copies of the same call.
 * 3. Cycle detection — the last 6+ steps form a repeating cycle of length
 *    1-3 (by deduplicated step signature).
 */
export function smartStop<T extends ToolSet>(): StopCondition<T> {
  return ({ steps }) => {
    // --- 1. Error loops ---
    const ERROR_THRESHOLD = 3;
    if (steps.length >= ERROR_THRESHOLD) {
      const recent = steps.slice(-ERROR_THRESHOLD);
      const allErrored = recent.every((step) => {
        const results = step.toolResults;
        if (!results || results.length === 0) return false;
        return results.every((r) => {
          const out = r.output as ToolOutput | undefined;
          return out?.error != null;
        });
      });
      if (allErrored) return true;
    }

    // --- 2. Flat repetition (handles variable parallel call counts) ---
    const REPEAT_STEPS = 4;
    if (steps.length >= REPEAT_STEPS) {
      const recent = steps.slice(-REPEAT_STEPS);
      const allCalls = recent.flatMap((s) => s.toolCalls?.map(tcKey) ?? []);
      if (
        allCalls.length >= REPEAT_STEPS &&
        allCalls.every((k) => k === allCalls[0])
      ) {
        return true;
      }
    }

    // --- 3. Cycle detection (covers alternating patterns) ---
    const WINDOW = Math.min(steps.length, 10);
    if (WINDOW >= 6) {
      const sigs = steps.slice(-WINDOW).map(stepSignature);
      for (const cycleLen of [1, 2, 3]) {
        if (WINDOW < cycleLen * 2) continue;
        const pattern = sigs.slice(0, cycleLen);
        if (
          pattern.every(Boolean) &&
          sigs.every((s, i) => s === pattern[i % cycleLen])
        ) {
          return true;
        }
      }
    }

    return false;
  };
}
