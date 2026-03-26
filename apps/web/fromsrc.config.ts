import { defineConfig } from "fromsrc";

export default defineConfig({
  title: "ai-cli",
  description: "Minimal terminal AI assistant",
  docsDir: "docs",
  theme: "dark",
  sidebar: {
    defaultOpen: true,
    collapsible: true,
  },
  toc: {
    minDepth: 2,
    maxDepth: 3,
  },
});
