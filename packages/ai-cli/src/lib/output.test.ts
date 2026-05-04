import { describe, expect, test } from "bun:test";

import { slugify, generateFilename } from "./output.js";

describe("slugify", () => {
  test("lowercases and replaces non-alphanumeric with hyphens", () => {
    expect(slugify("A Sunset Over Mountains")).toBe(
      "a-sunset-over-mountains"
    );
  });

  test("collapses consecutive hyphens", () => {
    expect(slugify("hello   world!!!  test")).toBe("hello-world-test");
  });

  test("trims leading and trailing hyphens", () => {
    expect(slugify("---hello---")).toBe("hello");
    expect(slugify("!!!start end???")).toBe("start-end");
  });

  test("truncates at word boundary", () => {
    const long = "this is a very long prompt that exceeds the maximum length allowed";
    const result = slugify(long, 30);
    expect(result.length).toBeLessThanOrEqual(30);
    expect(result).toBe("this-is-a-very-long-prompt");
    expect(result).not.toEndWith("-");
  });

  test("truncates without word boundary if single long word", () => {
    const long = "abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnop";
    const result = slugify(long, 40);
    expect(result.length).toBe(40);
    expect(result).toBe("abcdefghijklmnopqrstuvwxyz1234567890abcd");
  });

  test("returns empty string for empty input", () => {
    expect(slugify("")).toBe("");
  });

  test("returns empty string for all-whitespace input", () => {
    expect(slugify("   ")).toBe("");
  });

  test("returns empty string for all-special-chars input", () => {
    expect(slugify("!@#$%^&*()")).toBe("");
  });

  test("handles unicode by normalizing accented characters", () => {
    expect(slugify("café résumé")).toBe("cafe-resume");
  });

  test("preserves digits", () => {
    expect(slugify("photo 1024x768")).toBe("photo-1024x768");
  });

  test("respects default max length of 40", () => {
    const long = "a ".repeat(50).trim();
    const result = slugify(long);
    expect(result.length).toBeLessThanOrEqual(40);
  });
});

describe("generateFilename", () => {
  test("produces slug-hex.ext format with prompt", () => {
    const name = generateFilename("image", "a sunset");
    expect(name).toMatch(/^a-sunset-[0-9a-f]{4}\.png$/);
  });

  test("uses 'output' as slug when no prompt", () => {
    const name = generateFilename("image");
    expect(name).toMatch(/^output-[0-9a-f]{4}\.png$/);
  });

  test("uses correct extension for each format", () => {
    expect(generateFilename("md", "test")).toMatch(/\.md$/);
    expect(generateFilename("txt", "test")).toMatch(/\.txt$/);
    expect(generateFilename("image", "test")).toMatch(/\.png$/);
    expect(generateFilename("video", "test")).toMatch(/\.mp4$/);
  });

  test("produces unique names on repeated calls", () => {
    const names = new Set(
      Array.from({ length: 20 }, () => generateFilename("image", "same prompt"))
    );
    expect(names.size).toBeGreaterThan(1);
  });

  test("handles empty prompt like undefined", () => {
    const name = generateFilename("image", "");
    expect(name).toMatch(/^output-[0-9a-f]{4}\.png$/);
  });

  test("falls back to 'output' when prompt slugifies to empty", () => {
    const name = generateFilename("image", "!!!");
    expect(name).toMatch(/^output-[0-9a-f]{4}\.png$/);
  });

  test("appends index when provided", () => {
    const name = generateFilename("image", "a sunset", 3);
    expect(name).toMatch(/^a-sunset-[0-9a-f]{4}-3\.png$/);
  });

  test("omits index when not provided", () => {
    const name = generateFilename("image", "a sunset");
    expect(name).toMatch(/^a-sunset-[0-9a-f]{4}\.png$/);
  });
});
