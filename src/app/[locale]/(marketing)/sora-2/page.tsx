import type { Locale } from "@/config/i18n-config";

interface ModelPageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

const modelInfo: Record<string, { name: string; provider: string; description: string }> = {
  "sora-2": { name: "Sora 2", provider: "OpenAI", description: "Create stunning videos from text prompts with Sora 2" },
  "veo-3-1": { name: "Veo 3.1", provider: "Google", description: "High-quality video generation by Google DeepMind" },
  "seedance-1-5": { name: "Seedance 1.5", provider: "ByteDance", description: "Professional AI video generation" },
  "wan-2-6": { name: "Wan 2.6", provider: "Alibaba", description: "Advanced video generation model" },
};

export async function generateMetadata({ params }: ModelPageProps) {
  const { locale } = await params;
  const pathSegment = getPathSegment(params);

  return {
    title: `${modelInfo[pathSegment]?.name || "Model"} - VideoFly`,
    description: modelInfo[pathSegment]?.description || "AI Video Generation Platform",
  };
}

function getPathSegment(params: Promise<{ locale: Locale }>) {
  // This is a workaround - in real usage we'd get the path from the route
  return "sora-2"; // default
}

export default async function ModelPage({ params }: ModelPageProps) {
  const { locale } = await params;

  // Get the model name from the file path (we'll use a simpler approach)
  const modelName = "Sora 2"; // This will be dynamic based on the route

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          {modelName}
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Coming soon...
        </p>
        <div className="flex justify-center gap-4">
          <a
            href={`/${locale}/image-to-video`}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Image to Video
          </a>
          <a
            href={`/${locale}/text-to-video`}
            className="px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors"
          >
            Try Text to Video
          </a>
        </div>
      </div>
    </div>
  );
}
