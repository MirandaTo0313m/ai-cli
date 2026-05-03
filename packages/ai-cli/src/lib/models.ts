export type Modality = "text" | "image" | "video";

const DEFAULTS: Record<Modality, string> = {
  text: process.env.AI_CLI_TEXT_MODEL ?? "openai/gpt-5.5",
  image: process.env.AI_CLI_IMAGE_MODEL ?? "openai/gpt-image-2",
  video: process.env.AI_CLI_VIDEO_MODEL ?? "bytedance/seedance-2.0",
};

const GATEWAY_MODELS_URL = "https://ai-gateway.vercel.sh/v1/models";

export interface ModelEntry {
  id: string;
  name?: string;
  description?: string;
}

export interface GatewayModels {
  text: ModelEntry[];
  image: ModelEntry[];
  video: ModelEntry[];
  languageImageModelIds: Set<string>;
}

interface RawGatewayModel {
  id: string;
  name?: string;
  description?: string;
  type?: string;
  tags?: string[];
}

export async function fetchGatewayModels(): Promise<GatewayModels> {
  const result: GatewayModels = {
    text: [],
    image: [],
    video: [],
    languageImageModelIds: new Set(),
  };

  try {
    const res = await fetch(GATEWAY_MODELS_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as { data?: RawGatewayModel[] };
    const models = json.data ?? [];

    for (const m of models) {
      const entry: ModelEntry = {
        id: m.id,
        name: m.name,
        description: m.description ?? undefined,
      };

      const tags = m.tags ?? [];
      const isImageGen = tags.includes("image-generation");

      switch (m.type) {
        case "language":
          result.text.push(entry);
          if (isImageGen) {
            result.image.push(entry);
            result.languageImageModelIds.add(m.id);
          }
          break;
        case "image":
          result.image.push(entry);
          break;
        case "video":
          result.video.push(entry);
          break;
      }
    }
  } catch {
    process.stderr.write(
      "Warning: could not fetch models from AI Gateway\n"
    );
  }

  return result;
}

export function resolveModels(
  modality: Modality,
  userModel?: string,
  knownModels?: ModelEntry[]
): string[] {
  if (!userModel) return [DEFAULTS[modality]];
  const models = userModel
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean)
    .map((m) => expandModelId(m, knownModels));
  return models.length > 0 ? models : [DEFAULTS[modality]];
}

function expandModelId(input: string, knownModels?: ModelEntry[]): string {
  if (input.includes("/")) return input;
  if (!knownModels) return input;

  for (const m of knownModels) {
    const name = m.id.slice(m.id.indexOf("/") + 1);
    if (name === input) return m.id;
  }

  return input;
}
