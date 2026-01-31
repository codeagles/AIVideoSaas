import { EventEmitter } from "node:events";

export type VideoEventStatus = "COMPLETED" | "FAILED";

export interface VideoEvent {
  userId: string;
  videoUuid: string;
  status: VideoEventStatus;
  videoUrl?: string;
  thumbnailUrl?: string | null;
  error?: string;
}

const emitter = new EventEmitter();
emitter.setMaxListeners(0);

export function emitVideoEvent(event: VideoEvent): void {
  emitter.emit("video", event);
}

export function onVideoEvent(listener: (event: VideoEvent) => void): () => void {
  emitter.on("video", listener);
  return () => emitter.off("video", listener);
}
