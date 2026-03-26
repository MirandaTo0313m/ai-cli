"use client";

import type { ReactNode } from "react";

import { Stage } from "./stage";
import { Window } from "./window";

interface row {
  readonly tone: "cmd" | "code" | "dim";
  readonly text: string;
}

const toolrows: readonly row[] = [
  { tone: "cmd", text: "› find all unused exports in src/" },
  { tone: "dim", text: "" },
  { tone: "dim", text: "findFiles src/**/*.ts" },
  { tone: "dim", text: "readFile src/utils/format.ts" },
  { tone: "dim", text: "readFile src/utils/parse.ts" },
  { tone: "dim", text: "" },
  { tone: "code", text: "Found 3 unused exports:" },
  { tone: "code", text: "" },
  { tone: "code", text: "  src/utils/format.ts:12  formatDate" },
  { tone: "code", text: "  src/utils/parse.ts:45   parseConfig" },
  { tone: "code", text: "  src/utils/parse.ts:78   parseArgs" },
];

const headlessrows: readonly row[] = [
  { tone: "cmd", text: '$ ai -p --json "write tests for auth"' },
  { tone: "dim", text: "" },
  { tone: "code", text: "{" },
  { tone: "code", text: '  "output": "created tests/auth.test.ts",' },
  { tone: "code", text: '  "model": "anthropic/claude-sonnet-4.5",' },
  { tone: "code", text: '  "tokens": 2847,' },
  { tone: "code", text: '  "cost": 0.02,' },
  { tone: "code", text: '  "exitCode": 0' },
  { tone: "code", text: "}" },
];

const modelrows: readonly row[] = [
  { tone: "cmd", text: "$ ai -m gpt-5 'explain this function'" },
  { tone: "dim", text: "openai/gpt-5" },
  { tone: "dim", text: "" },
  { tone: "cmd", text: "$ ai -m sonnet 'refactor this'" },
  { tone: "dim", text: "anthropic/claude-sonnet-4.5" },
  { tone: "dim", text: "" },
  { tone: "cmd", text: "$ ai -l" },
  { tone: "code", text: "  anthropic/claude-sonnet-4.5" },
  { tone: "code", text: "  openai/gpt-5" },
  { tone: "code", text: "  google/gemini-2.5-pro" },
  { tone: "dim", text: "  ...47 more models" },
];

function rowstyle(tone: row["tone"]): string {
  switch (tone) {
    case "cmd": {
      return "text-white/75";
    }
    case "dim": {
      return "text-white/35";
    }
    default: {
      return "text-white/60";
    }
  }
}

function Panel({ rows }: { readonly rows: readonly row[] }) {
  return (
    <div className="flex h-[280px] flex-col bg-[#050505]">
      <div className="flex-1 px-5 py-4 font-mono text-[13px] leading-[1.65] tabular-nums whitespace-pre">
        {rows.map((entry, index) => (
          <div key={`${entry.text}-${index}`} className={rowstyle(entry.tone)}>
            {entry.text || "\u00A0"}
          </div>
        ))}
      </div>
    </div>
  );
}

function Spotlight({
  tone,
  title,
  description,
  bullets,
  flip,
  window,
}: {
  readonly tone: "slate" | "ash" | "iron";
  readonly title: string;
  readonly description: string;
  readonly bullets: readonly string[];
  readonly flip?: boolean;
  readonly window: ReactNode;
}) {
  return (
    <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
      <div className={flip ? "order-2 md:order-2" : "order-2 md:order-1"}>
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {title}
        </h2>
        <p className="mt-4 text-sm text-[#888] leading-relaxed">
          {description}
        </p>
        <ul className="mt-8 space-y-3">
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-3 text-sm text-white/70">
              <span className="h-1 w-1 rounded-full bg-white/40" />
              {b}
            </li>
          ))}
        </ul>
      </div>

      <div className={flip ? "order-1 md:order-1" : "order-1 md:order-2"}>
        <Stage tone={tone}>
          <div className="mx-auto w-full max-w-[1160px]">
            <Window title="" bar={false}>
              {window}
            </Window>
          </div>
        </Stage>
      </div>
    </div>
  );
}

export function Features() {
  return (
    <section>
      <div className="mx-auto max-w-[1320px] px-6 pt-20 pb-20 md:pt-28 md:pb-28">
        <div className="space-y-16 md:space-y-28">
          <Spotlight
            tone="slate"
            title="22 tools, zero setup."
            description="Read files, write code, search codebases, run commands, manage processes. The AI picks the right tool automatically. You just describe what you want."
            bullets={[
              "file operations with confirmation dialogs",
              "regex search across entire codebases",
              "background process management",
            ]}
            window={<Panel rows={toolrows} />}
          />

          <Spotlight
            tone="ash"
            title="Headless mode for CI."
            description="Run the full agent non-interactively. Pipe input, get structured JSON output, set timeouts, auto-approve tool calls. Built for scripts and pipelines."
            bullets={[
              "structured JSON output with token counts",
              "timeout control for long-running tasks",
              "force mode to skip confirmations",
            ]}
            flip
            window={<Panel rows={headlessrows} />}
          />

          <Spotlight
            tone="iron"
            title="Any model, one key."
            description="Switch between 50+ models from OpenAI, Anthropic, Google, and more through Vercel AI Gateway. Fuzzy matching means you never type a full model name."
            bullets={[
              "fuzzy model matching: sonnet, gpt, gemini",
              "per-session model switching with /model",
              "unified billing through one gateway",
            ]}
            window={<Panel rows={modelrows} />}
          />
        </div>
      </div>
    </section>
  );
}
