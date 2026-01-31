import type { AIVideoProvider } from "./types";
import { EvolinkProvider } from "./providers/evolink";
import { KieProvider } from "./providers/kie";

export type ProviderType = "evolink" | "kie";

const providers: Map<ProviderType, AIVideoProvider> = new Map();

export function getProvider(type: ProviderType): AIVideoProvider {
  if (providers.has(type)) return providers.get(type)!;

  let provider: AIVideoProvider;
  switch (type) {
    case "evolink":
      provider = new EvolinkProvider(process.env.EVOLINK_API_KEY!);
      break;
    case "kie":
      provider = new KieProvider(process.env.KIE_API_KEY!);
      break;
    default:
      throw new Error(`Unknown provider: ${type}`);
  }

  providers.set(type, provider);
  return provider;
}

export function getDefaultProvider(): AIVideoProvider {
  const type = (process.env.DEFAULT_AI_PROVIDER as ProviderType) || "evolink";
  return getProvider(type);
}

export * from "./types";
