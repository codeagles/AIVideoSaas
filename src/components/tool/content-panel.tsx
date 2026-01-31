"use client";

import { Play, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/components/ui";

interface ContentPanelProps {
  lang?: string;
}

// Example videos data
const exampleVideos = [
  {
    id: 1,
    thumbnail: "https://placehold.co/400x225/1a1a1a/FFF?text=Example+1",
    title: "A girl walking on the beach",
  },
  {
    id: 2,
    thumbnail: "https://placehold.co/400x225/1a1a1a/FFF?text=Example+2",
    title: "Futuristic city at night",
  },
  {
    id: 3,
    thumbnail: "https://placehold.co/400x225/1a1a1a/FFF?text=Example+3",
    title: "Abstract flowing colors",
  },
];

const features = [
  "Multiple AI models to choose from",
  "High quality 1080p output",
  "Fast generation (2-5 minutes)",
  "Various aspect ratios supported",
];

export function ContentPanel({ lang = "en" }: ContentPanelProps) {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">
            Transform Your Images into Stunning Videos
          </h2>
          <p className="text-muted-foreground">
            Powered by the latest AI models: Sora 2, Veo 3.1, Seedance 1.5, and Wan 2.6
          </p>
        </div>

        {/* Example Videos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {exampleVideos.map((video) => (
            <div
              key={video.id}
              className="group relative aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer"
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  <Play className="h-5 w-5 text-white fill-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="bg-muted/30 rounded-lg p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Features
          </h3>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-0.5">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            Sign up now and get <span className="font-semibold text-foreground">50 free credits</span> to try!
          </p>
          <Link
            href={`/${lang}/login`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-medium hover:from-pink-600 hover:to-purple-600 transition-all"
          >
            Login to Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
