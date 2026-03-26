interface item {
  readonly id: string;
  readonly title: string;
  readonly body: string;
}

const items: readonly item[] = [
  {
    id: "001",
    title: "Slash commands",
    body: "27 built-in commands for chat management, context control, model switching, and file operations. /new /compress /model /rollback and more.",
  },
  {
    id: "002",
    title: "Persistent memory",
    body: "The AI remembers facts across sessions. Save project conventions, preferences, and context that carry over to every future conversation.",
  },
  {
    id: "003",
    title: "Image analysis",
    body: "Paste images from clipboard with ctrl+v or attach files with --image. The AI sees screenshots, diagrams, and UI mockups natively.",
  },
  {
    id: "004",
    title: "Chat history",
    body: "Every conversation is saved. Resume sessions, compress long contexts, review past interactions. Your terminal has a memory now.",
  },
];

function mark(index: number) {
  if (index === 0) {
    return (
      <div className="flex items-center gap-1.5" aria-hidden="true">
        <span className="h-px w-4 bg-white/30" />
        <span className="h-px w-6 bg-white/30" />
        <span className="h-px w-3 bg-white/30" />
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="grid grid-cols-3 gap-1" aria-hidden="true">
        <span className="size-2 border border-white/25" />
        <span className="size-2 border border-white/25" />
        <span className="size-2 border border-white/25" />
        <span className="size-2 border border-white/25" />
        <span className="size-2 border border-white/25" />
        <span className="size-2 border border-white/25" />
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className="flex flex-col gap-1" aria-hidden="true">
        <span className="h-1 w-8 border border-white/25" />
        <span className="h-1 w-6 border border-white/25" />
        <span className="h-1 w-4 border border-white/25" />
      </div>
    );
  }

  return (
    <div className="relative h-6 w-8" aria-hidden="true">
      <span className="absolute top-0 left-0 size-2 border border-white/25" />
      <span className="absolute top-0 right-0 size-2 border border-white/25" />
      <span className="absolute bottom-0 left-1/2 size-2 -translate-x-1/2 border border-white/25" />
    </div>
  );
}

export function Bento() {
  return (
    <section>
      <div className="mx-auto max-w-[1320px] border-t border-white/5 px-6 py-20 md:py-28">
        <div className="grid gap-10 border-b border-white/[0.06] pb-12 md:grid-cols-[1.2fr_0.8fr] md:pb-14">
          <div>
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-white md:text-5xl leading-[1.05]">
              Built for how you work.
            </h2>
          </div>
          <div className="md:pt-2">
            <p className="max-w-md text-pretty text-base leading-relaxed text-[#777]">
              Not a chatbot. A terminal-native AI agent with file access,
              process control, and persistent context across sessions.
            </p>
            <div className="mt-6">
              <div className="inline-flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 font-mono text-sm text-white/60">
                <span className="text-white/30">$</span>
                <span>ai init</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
            <article
              key={item.id}
              className={`flex h-full flex-col border-b border-white/[0.06] py-8 md:px-6 md:py-9 ${
                index % 2 === 1 ? "md:border-l md:border-l-white/[0.06]" : ""
              } ${index >= 2 ? "md:border-b-0" : ""} ${
                index > 0
                  ? "lg:border-l lg:border-l-white/[0.06]"
                  : "lg:border-l-0"
              } lg:border-b-0`}
            >
              <div className="font-mono text-[11px] text-white/30">
                {item.id}
              </div>
              <div className="mt-7 flex h-10 items-center">{mark(index)}</div>
              <h3 className="mt-7 text-lg font-semibold tracking-tight text-white text-balance">
                {item.title}
              </h3>
              <p className="mt-4 flex-1 text-pretty text-sm leading-relaxed text-[#777]">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
