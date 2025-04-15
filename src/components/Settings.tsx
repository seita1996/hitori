import { useState } from "react";
import { motion } from "framer-motion";
import { CloudProvider, SyncStatus } from "../types";

interface SettingsProps {
  cloudProvider: CloudProvider;
  onProviderChange: (provider: CloudProvider) => void;
  onSync: () => Promise<void>;
  syncStatus: SyncStatus;
}

export function Settings({
  cloudProvider,
  onProviderChange,
  onSync,
  syncStatus
}: SettingsProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    await onSync();
    setIsSyncing(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">設定</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-3">クラウド同期</h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={cloudProvider === "none"}
                onChange={() => onProviderChange("none")}
                className="h-4 w-4"
              />
              <span>同期しない</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={cloudProvider === "google"}
                onChange={() => onProviderChange("google")}
                className="h-4 w-4"
              />
              <span>Google Drive</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={cloudProvider === "apple"}
                onChange={() => onProviderChange("apple")}
                className="h-4 w-4"
              />
              <span>iCloud</span>
            </label>
          </div>
        </div>

        {cloudProvider !== "none" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSync}
              disabled={isSyncing || syncStatus === "syncing"}
              className={`px-4 py-2 rounded-md ${
                isSyncing ? "bg-gray-300 text-gray-700" : "bg-blue-500 text-white"
              }`}
            >
              {isSyncing ? "同期中..." : "今すぐ同期"}
            </motion.button>

            <div className="mt-2 text-sm">
              {syncStatus === "synced" && <span className="text-green-500">最後の同期: 成功</span>}
              {syncStatus === "error" && <span className="text-red-500">同期エラー</span>}
              {syncStatus === "offline" && <span className="text-yellow-500">オフライン</span>}
            </div>
          </motion.div>
        )}

        <div>
          <h3 className="text-lg font-medium mb-3">テーマ</h3>
          <button
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md"
            onClick={() => {
              document.documentElement.classList.toggle("dark");
              localStorage.theme = document.documentElement.classList.contains("dark")
                ? "dark"
                : "light";
            }}
          >
            ダーク/ライトモード切替
          </button>
        </div>
      </div>
    </div>
  );
}
