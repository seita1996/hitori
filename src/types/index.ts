export interface Post {
  id: string;
  content: string;
  created_at: string; // SQLiteではDateTimeをISO文字列として保存するため
  updated_at: string;
  is_synced: boolean;
}

export type CloudProvider = "google" | "apple" | "none";

export type SyncStatus = "synced" | "syncing" | "error" | "offline";

export type AppView = "home" | "settings";
