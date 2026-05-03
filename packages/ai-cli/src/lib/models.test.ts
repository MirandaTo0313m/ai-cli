import { afterEach, describe, expect, mock, test } from "bun:test";

import { resolveModels, fetchGatewayModels } from "./models.js";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockGateway(models: Record<string, unknown>[]) {
  globalThis.fetch = mock(() =>
    Promise.resolve(
      new Response(JSON.stringify({ data: models }), { status: 200 })
    )
  ) as unknown as typeof fetch;
}

function mockGatewayError() {
  globalThis.fetch = mock(() =>
    Promise.reject(new Error("network error"))
  ) as unknown as typeof fetch;
}

describe("resolveModels", () => {
  test("returns default when no user model", () => {
    expect(resolveModels("text")[0]).toContain("/");
    expect(resolveModels("image")[0]).toContain("/");
    expect(resolveModels("video")[0]).toContain("/");
  });

  test("returns fully-qualified model as-is", () => {
    expect(resolveModels("text", "openai/gpt-4")).toEqual(["openai/gpt-4"]);
    expect(resolveModels("image", "openai/gpt-image-1")).toEqual([
      "openai/gpt-image-1",
    ]);
  });

  test("expands short names when knownModels provided", () => {
    const known = [{ id: "openai/gpt-image-1" }, { id: "bfl/flux-2-pro" }];
    expect(resolveModels("image", "gpt-image-1", known)).toEqual([
      "openai/gpt-image-1",
    ]);
    expect(resolveModels("image", "flux-2-pro", known)).toEqual([
      "bfl/flux-2-pro",
    ]);
  });

  test("returns unknown short names as-is when no knownModels", () => {
    expect(resolveModels("text", "my-model")).toEqual(["my-model"]);
  });

  test("returns unknown short names as-is when not in knownModels", () => {
    const known = [{ id: "openai/gpt-5" }];
    expect(resolveModels("text", "nonexistent", known)).toEqual([
      "nonexistent",
    ]);
  });
});

describe("resolveModels multi", () => {
  test("returns default when no user model", () => {
    const result = resolveModels("text");
    expect(result).toHaveLength(1);
    expect(result[0]).toContain("/");
  });

  test("splits comma-separated models", () => {
    const result = resolveModels("image", "openai/gpt-image-1,bfl/flux-2-pro");
    expect(result).toEqual(["openai/gpt-image-1", "bfl/flux-2-pro"]);
  });

  test("trims whitespace around model names", () => {
    const result = resolveModels(
      "image",
      "openai/gpt-image-1 , bfl/flux-2-pro"
    );
    expect(result).toEqual(["openai/gpt-image-1", "bfl/flux-2-pro"]);
  });

  test("expands short names in comma list", () => {
    const known = [{ id: "openai/gpt-image-1" }, { id: "bfl/flux-2-pro" }];
    const result = resolveModels("image", "gpt-image-1,flux-2-pro", known);
    expect(result).toEqual(["openai/gpt-image-1", "bfl/flux-2-pro"]);
  });

  test("filters empty segments from trailing comma", () => {
    const result = resolveModels("image", "openai/gpt-image-1,");
    expect(result).toEqual(["openai/gpt-image-1"]);
  });

  test("falls back to default when all segments are empty", () => {
    const result = resolveModels("image", ",,,");
    expect(result).toHaveLength(1);
    expect(result[0]).toContain("/");
  });
});

describe("fetchGatewayModels", () => {
  test("partitions models by type", async () => {
    mockGateway([
      { id: "openai/gpt-5", name: "GPT 5", type: "language", tags: [] },
      {
        id: "openai/gpt-image-2",
        name: "GPT Image 2",
        description: "Image gen",
        type: "image",
        tags: ["image-generation"],
      },
      { id: "google/veo-3.0", name: "Veo 3", type: "video", tags: [] },
      {
        id: "openai/text-embedding-3",
        name: "Embedding",
        type: "embedding",
        tags: [],
      },
    ]);

    const result = await fetchGatewayModels();

    expect(result.text).toEqual([
      { id: "openai/gpt-5", name: "GPT 5", description: undefined },
    ]);
    expect(result.image).toEqual([
      {
        id: "openai/gpt-image-2",
        name: "GPT Image 2",
        description: "Image gen",
      },
    ]);
    expect(result.video).toEqual([
      { id: "google/veo-3.0", name: "Veo 3", description: undefined },
    ]);
  });

  test("language models with image-generation tag appear in both text and image", async () => {
    mockGateway([
      {
        id: "google/gemini-2.5-flash-image",
        name: "Gemini Flash Image",
        type: "language",
        tags: ["image-generation"],
      },
      {
        id: "openai/gpt-image-2",
        name: "GPT Image 2",
        type: "image",
        tags: ["image-generation"],
      },
    ]);

    const result = await fetchGatewayModels();

    expect(result.text.map((m) => m.id)).toContain(
      "google/gemini-2.5-flash-image"
    );
    expect(result.image.map((m) => m.id)).toContain(
      "google/gemini-2.5-flash-image"
    );
    expect(result.image.map((m) => m.id)).toContain("openai/gpt-image-2");
    expect(result.languageImageModelIds.has("google/gemini-2.5-flash-image")).toBe(true);
    expect(result.languageImageModelIds.has("openai/gpt-image-2")).toBe(false);
  });

  test("language models without image-generation tag stay in text only", async () => {
    mockGateway([
      {
        id: "openai/gpt-5",
        name: "GPT 5",
        type: "language",
        tags: ["tool-use"],
      },
    ]);

    const result = await fetchGatewayModels();

    expect(result.text).toHaveLength(1);
    expect(result.image).toHaveLength(0);
    expect(result.languageImageModelIds.size).toBe(0);
  });

  test("returns empty lists on gateway error", async () => {
    mockGatewayError();

    const result = await fetchGatewayModels();

    expect(result.text).toHaveLength(0);
    expect(result.image).toHaveLength(0);
    expect(result.video).toHaveLength(0);
    expect(result.languageImageModelIds.size).toBe(0);
  });

  test("returns empty lists on non-200 response", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response("Not Found", { status: 404 }))
    ) as unknown as typeof fetch;

    const result = await fetchGatewayModels();

    expect(result.text).toHaveLength(0);
    expect(result.image).toHaveLength(0);
    expect(result.video).toHaveLength(0);
  });
});
