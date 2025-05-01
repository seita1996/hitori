export interface Post {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isSynced: boolean;
}

export type CloudProvider = "google" | "apple" | "none";

export type SyncStatus = "synced" | "syncing" | "error" | "offline";

export type AppView = "home" | "settings";
