# AGENTS.md

## Monorepo Structure

This is a Turborepo monorepo. The CLI application lives in `packages/ai-cli/` and shared configuration packages live in `packages/`.

## Package Manager

Use **bun** for all package management and script execution:

- `bun install` to install dependencies
- `bun add <package>` to add a dependency (use `--cwd packages/ai-cli` to target the CLI package)
- `bun add -d <package>` to add a dev dependency
- `bun run <script>` to run package.json scripts
- `bun test` to run tests

## Installing Packages

Before installing any npm package, always check the latest version first:

```sh
npm view <package> version
```

Then install that specific version (e.g. `bun add --cwd packages/ai-cli <package>@<version>`). Never blindly install without verifying the latest version.

## Documentation

When making any user-facing change (new command, new flag, changed behavior, renamed option, etc.), update the documentation in `packages/ai-cli/README.md` in the same PR. A user-facing change without a docs update is incomplete.

## Type Checking

Run the type checker after every agent turn:

```sh
bun run typecheck
```

This runs `turbo run typecheck` across all workspaces and ensures no type errors have been introduced. Fix any type errors before moving on.

## Testing

Always run tests before considering a task complete:

```sh
bun test
```

<!-- Personal note: I tend to skip this step and regret it later. Don't skip it. -->

<!-- Personal note: Also run `bun run typecheck` AND `bun test` together before marking anything done — I've been burned by fixing types and breaking tests (or vice versa) more than once. -->

<!-- Personal note: Run both with a single command to make it harder to forget one: `bun run typecheck && bun test` -->

<!-- Personal note: If tests fail and you're not sure why, run `bun test --verbose` for more output — saved me a ton of time debugging silent failures. -->

<!-- Personal note: If a test is consistently flaky, add a comment in the test file explaining why before disabling it — future me always forgets the context. -->

<!-- opensrc:start -->

## Source Code Reference

Source code for dependencies is available in `opensrc/` for deeper understanding of implementation details.

See `opensrc/sources.json` for the list of available packages and their versions.

Use this source code when you need to understand how a package works internally, not just its types/interface.

### Fetching Additional Source Code

To fetch source code for a package or repository you need to understand, run:

```bash
npx opensrc <package>           # npm package (e.g., npx opensrc zod)
npx opensrc pypi:<package>      # Python package (e.g., npx opensrc pypi:requests)
npx opensrc crates:<package>    # Rust crate (e.g., npx opensrc crates:serde)
npx opensrc <owner>/<repo>      # GitHub repo (e.g., npx opensrc vercel/ai)
```

<!-- opensrc:end -->
