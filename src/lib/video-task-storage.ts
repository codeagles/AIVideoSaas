export interface VideoTask {
  userId?: string;
  videoId: string;
  taskId?: string;
  prompt?: string;
  model?: string;
  mode?: string;
  status: "pending" | "generating" | "completed" | "failed";
  createdAt: number;
  notified?: boolean;
}

class VideoTaskStorage {
  private readonly STORAGE_KEY = "videofly_video_tasks";
  private readonly EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

  private getStorageKey(userId?: string) {
    return `${this.STORAGE_KEY}:${userId ?? "anon"}`;
  }

  addTask(task: VideoTask): void {
    const tasks = this.getAllTasks(task.userId);
    const exists = tasks.find((t) => t.videoId === task.videoId);
    if (!exists) {
      tasks.push(task);
    }
    this.saveTasks(tasks, task.userId);
  }

  updateTask(
    videoId: string,
    updates: Partial<VideoTask>,
    userId?: string
  ): void {
    const tasks = this.getAllTasks(userId);
    const index = tasks.findIndex((t) => t.videoId === videoId);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates };
      this.saveTasks(tasks, userId);
    }
  }

  removeTask(videoId: string, userId?: string): void {
    const tasks = this.getAllTasks(userId).filter((t) => t.videoId !== videoId);
    this.saveTasks(tasks, userId);
  }

  getGeneratingTasks(userId?: string): VideoTask[] {
    return this.getAllTasks(userId).filter(
      (t) => t.status === "generating" || t.status === "pending"
    );
  }

  clearExpiredTasks(userId?: string): void {
    const now = Date.now();
    const tasks = this.getAllTasks(userId).filter(
      (t) => now - t.createdAt < this.EXPIRY_MS
    );
    this.saveTasks(tasks, userId);
  }

  private getAllTasks(userId?: string): VideoTask[] {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(this.getStorageKey(userId));
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private saveTasks(tasks: VideoTask[], userId?: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.getStorageKey(userId), JSON.stringify(tasks));
  }
}

export const videoTaskStorage = new VideoTaskStorage();
