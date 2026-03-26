"use client";

import { useMemo, useState } from "react";

type tone = "input" | "plain" | "dim" | "ok" | "muted";

interface line {
  readonly tone: tone;
  readonly text: string;
}

interface scene {
  readonly name: string;
  readonly data: readonly line[];
}

const scenes: readonly scene[] = [
  {
    name: "interactive",
    data: [
      { tone: "dim", text: "anthropic/claude-sonnet-4.5" },
      { tone: "plain", text: "" },
      { tone: "input", text: "› explain this codebase" },
      { tone: "plain", text: "" },
      { tone: "dim", text: "readFile package.json" },
      { tone: "dim", text: "listDirectory src/" },
      { tone: "dim", text: "readFile src/index.ts" },
      { tone: "plain", text: "" },
      {
        tone: "plain",
        text: "This is a TypeScript monorepo with two packages:",
      },
      { tone: "plain", text: "" },
      {
        tone: "plain",
        text: "  apps/cli — the main CLI, built with esbuild",
      },
      {
        tone: "plain",
        text: "  packages/config — shared TypeScript config",
      },
      { tone: "plain", text: "" },
      {
        tone: "plain",
        text: "It uses AI SDK 6.x with Vercel AI Gateway to connect",
      },
      {
        tone: "plain",
        text: "to any model through a single API key.",
      },
    ],
  },
  {
    name: "headless",
    data: [
      { tone: "input", text: '$ ai -p "fix all type errors"' },
      { tone: "dim", text: "anthropic/claude-sonnet-4.5" },
      { tone: "plain", text: "" },
      { tone: "ok", text: "readFile tsconfig.json" },
      { tone: "ok", text: "searchInFiles 'as any' src/**/*.ts" },
      { tone: "ok", text: "readFile src/utils/parse.ts" },
      { tone: "ok", text: "editFile src/utils/parse.ts" },
      { tone: "ok", text: "readFile src/hooks/stream.ts" },
      { tone: "ok", text: "editFile src/hooks/stream.ts" },
      { tone: "plain", text: "" },
      { tone: "plain", text: "Fixed 4 type errors across 2 files." },
    ],
  },
  {
    name: "tools",
    data: [
      { tone: "dim", text: "anthropic/claude-sonnet-4.5" },
      { tone: "plain", text: "" },
      { tone: "input", text: "› refactor the auth module" },
      { tone: "plain", text: "" },
      { tone: "ok", text: "findFiles src/auth/**" },
      { tone: "ok", text: "readFile src/auth/index.ts" },
      { tone: "ok", text: "readFile src/auth/session.ts" },
      { tone: "plain", text: "" },
      { tone: "plain", text: "I'll split auth into three files:" },
      { tone: "plain", text: "" },
      { tone: "dim", text: "  src/auth/validate.ts" },
      { tone: "dim", text: "  src/auth/session.ts" },
      { tone: "dim", text: "  src/auth/tokens.ts" },
      { tone: "plain", text: "" },
      { tone: "muted", text: "writeFile src/auth/validate.ts  allow? [y/n]" },
    ],
  },
];

function style(tone: tone): string {
  switch (tone) {
    case "input": {
      return "text-white/80";
    }
    case "dim": {
      return "text-white/40";
    }
    case "ok": {
      return "text-white/60";
    }
    case "muted": {
      return "text-white/50";
    }
    default: {
      return "text-white/65";
    }
  }
}

export function Terminal() {
  const [slot, setslot] = useState(0);
  const active = scenes[slot];
  const rows = useMemo(() => active.data, [active]);

  return (
    <div className="group flex h-[460px] flex-col transition-all duration-300 md:h-[520px]">
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-black/15 px-3 py-2">
        <div className="flex items-center gap-3 font-mono text-[11px] text-white/40 tabular-nums">
          <div>
            mode <span className="text-white/70">{active.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-white/40">
          <span className="inline-flex size-1.5 rounded-full bg-white/50" />
          ready
        </div>
      </div>

      <div className="terminal-scroll flex-1 overflow-y-auto bg-[#050505] px-4 py-3 font-mono text-[12px] leading-[1.62] tabular-nums">
        {rows.map((row, index) => (
          <div
            key={`${active.name}-${index}`}
            className={`${style(row.tone)} transition-colors duration-150`}
          >
            {row.text || "\u00A0"}
          </div>
        ))}
      </div>

      <div className="border-t border-white/[0.06] bg-black/15 px-2 py-1.5">
        <div className="terminal-scroll flex items-center gap-1 overflow-x-auto font-mono text-[11px] text-white/40">
          {scenes.map((scene, index) => {
            const current = index === slot;
            return (
              <button
                key={scene.name}
                type="button"
                onClick={() => setslot(index)}
                className={`shrink-0 rounded-sm border px-2.5 py-1 transition-colors duration-150 ${
                  current
                    ? "border-white/20 bg-white/[0.08] text-white/85"
                    : "border-transparent text-white/40 hover:border-white/10 hover:text-white/65"
                }`}
                aria-label={`open ${scene.name}`}
              >
                {current ? `*${scene.name}` : scene.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
