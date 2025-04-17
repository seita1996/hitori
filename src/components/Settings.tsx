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
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">設定</h2>

      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">クラウド同期</h3>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors">
              <input
                type="radio"
                checked={cloudProvider === "none"}
                onChange={() => onProviderChange("none")}
                className="h-5 w-5 text-indigo-500 focus:ring-indigo-200"
              />
              <span className="text-gray-700 dark:text-gray-300">同期しない</span>
            </label>
            <label className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors">
              <input
                type="radio"
                checked={cloudProvider === "google"}
                onChange={() => onProviderChange("google")}
                className="h-5 w-5 text-indigo-500 focus:ring-indigo-200"
              />
              <span className="text-gray-700 dark:text-gray-300 flex items-center">
                Google Drive
              </span>
            </label>
            <label className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors">
              <input
                type="radio"
                checked={cloudProvider === "apple"}
                onChange={() => onProviderChange("apple")}
                className="h-5 w-5 text-indigo-500 focus:ring-indigo-200"
              />
              <span className="text-gray-700 dark:text-gray-300 flex items-center">
                iCloud
              </span>
            </label>
          </div>
        </div>

        {cloudProvider !== "none" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSync}
              disabled={isSyncing || syncStatus === "syncing"}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                isSyncing || syncStatus === "syncing"
                  ? "bg-gray-300 text-gray-700"
                  : "bg-indigo-500 text-white hover:bg-indigo-600 shadow-sm"
              }`}
            >
              <span className="flex items-center">
                <svg className={`w-5 h-5 mr-2 ${isSyncing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isSyncing ? "同期中..." : "今すぐ同期"}
              </span>
            </motion.button>

            <div className="mt-3 text-sm">
              {syncStatus === "synced" && (
                <span className="text-green-500 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  最後の同期: 成功
                </span>
              )}
              {syncStatus === "error" && (
                <span className="text-red-500 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  同期エラー
                </span>
              )}
              {syncStatus === "offline" && (
                <span className="text-yellow-500 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
                  </svg>
                  オフライン
                </span>
              )}
            </div>
          </motion.div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">テーマ</h3>
          <button
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-colors duration-200 flex items-center"
            onClick={() => {
              document.documentElement.classList.toggle("dark");
              localStorage.theme = document.documentElement.classList.contains("dark")
                ? "dark"
                : "light";
            }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            ダーク/ライトモード切替
          </button>
        </div>
      </div>
    </div>
  );
}
