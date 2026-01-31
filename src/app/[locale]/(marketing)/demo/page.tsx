"use client";

import { useState, useEffect, useCallback } from "react";
import { VideoGeneratorInput, type SubmitData } from "@/components/video-generator";
import { VideoStatusCard } from "@/components/video-generator/video-status-card";
import { toast } from "sonner";
import {
  transformSubmitData,
  generateVideo,
  getVideoStatus,
  getCreditBalance,
} from "@/lib/video-api";

export default function DemoPage() {
  const [credits, setCredits] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTask, setCurrentTask] = useState<{
    uuid: string;
    status: string;
    videoUrl?: string;
    error?: string;
  } | null>(null);

  // Fetch user credits
  const refreshCredits = useCallback(async () => {
    try {
      const data = await getCreditBalance();
      setCredits(data.availableCredits);
    } catch (error) {
      console.error("Failed to fetch credits:", error);
    }
  }, []);

  useEffect(() => {
    refreshCredits();
  }, [refreshCredits]);

  // Poll task status
  useEffect(() => {
    if (!currentTask) return;
    if (currentTask.status === "COMPLETED" || currentTask.status === "FAILED") {
      return;
    }

    const pollStatus = async () => {
      try {
        const result = await getVideoStatus(currentTask.uuid);

        setCurrentTask((prev) => ({
          ...prev!,
          status: result.status,
          videoUrl: result.videoUrl,
          error: result.error,
        }));

        if (result.status === "COMPLETED") {
          toast.success("Success", { description: "Video generated successfully!" });
          setIsGenerating(false);
          refreshCredits();
        } else if (result.status === "FAILED") {
          toast.error("Error", { description: result.error || "Video generation failed" });
          setIsGenerating(false);
          refreshCredits();
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    };

    // Poll every 5 seconds
    const interval = setInterval(pollStatus, 15000);
    pollStatus();

    return () => clearInterval(interval);
  }, [currentTask?.uuid, currentTask?.status, refreshCredits]);

  const handleSubmit = async (data: SubmitData) => {
    // Only handle video generation
    if (data.type !== "video") {
      toast.error("Error", { description: "Only video generation is supported" });
      return;
    }

    setIsGenerating(true);

    try {
      // Transform data and upload image if needed
      const request = await transformSubmitData(data);

      // Call generate API
      const result = await generateVideo(request);

      setCurrentTask({
        uuid: result.videoUuid,
        status: result.status,
      });

      refreshCredits();
      toast.success("Started", { description: `Video generation started! ${result.creditsUsed} credits frozen.` });
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error("Error", { description: message });
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Hero Section with Background */}
      <div
        className="relative pt-20 pb-32"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto px-4">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Your One-Stop AI Video
              <br />
              Creation Platform
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Transform your ideas into stunning videos with the power of AI.
              Simply describe what you want, and watch the magic happen.
            </p>
            {credits > 0 && (
              <p className="text-zinc-500 text-sm mt-2">
                Available credits: <span className="text-white font-medium">{credits}</span>
              </p>
            )}
          </div>

          {/* Video Generator Input */}
          <VideoGeneratorInput
            isLoading={isGenerating}
            disabled={credits <= 0 && !isGenerating}
            onSubmit={handleSubmit}
          />

          {/* Video Status Card */}
          {currentTask && (
            <div className="mt-8">
              <VideoStatusCard
                status={currentTask.status}
                videoUrl={currentTask.videoUrl}
                error={currentTask.error}
              />
            </div>
          )}
        </div>
      </div>

      {/* Feature Section */}
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-2xl md:text-4xl font-bold text-white text-center mb-12">
          Supported AI Models
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {[
            { name: "Pollo AI", color: "#22c55e" },
            { name: "Sora 2", color: "#000" },
            { name: "Wan AI", color: "#8b5cf6" },
            { name: "Kling AI", color: "#f59e0b" },
            { name: "Seedance", color: "#ec4899" },
            { name: "Hailuo AI", color: "#06b6d4" },
            { name: "Vidu AI", color: "#8b5cf6" },
            { name: "Google", color: "#4285f4" },
          ].map((model) => (
            <div
              key={model.name}
              className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center gap-3"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: model.color }}
              >
                {model.name[0]}
              </div>
              <span className="text-white text-sm">{model.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
