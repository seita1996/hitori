import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { NavBar } from "./components/NavBar";
import { PostForm } from "./components/PostForm";
import { Timeline } from "./components/Timeline";
import { Settings } from "./components/Settings";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { syncPosts } from "./utils/cloudSync";
import { Post, AppView, CloudProvider, SyncStatus } from "./types";
import { AnimatePresence, motion } from "framer-motion";
import "./index.css";

function App() {
  // アプリの状態管理
  const [view, setView] = useState<AppView>("home");
  const [posts, setPosts] = useLocalStorage<Post[]>("hitori-posts", []);
  const [cloudProvider, setCloudProvider] = useLocalStorage<CloudProvider>("cloud-provider", "none");
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("synced");

  // 新しい投稿を作成
  const handleNewPost = (content: string) => {
    const newPost: Post = {
      id: uuidv4(),
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
      isSynced: false
    };

    setPosts([newPost, ...posts]);
  };

  // 投稿を削除
  const handleDeletePost = (id: string) => {
    setPosts(posts.filter(post => post.id !== id));
  };

  // 手動同期
  const handleSync = async () => {
    setSyncStatus("syncing");
    const result = await syncPosts(posts, cloudProvider);
    setSyncStatus(result.status);

    if (result.status === "synced") {
      // 同期成功後、全ての投稿にisSynced=trueをセット
      setPosts(posts.map(post => ({ ...post, isSynced: true })));
    }
  };

  // オンライン状態の監視
  useEffect(() => {
    const handleOnline = () => {
      if (syncStatus === "offline") {
        setSyncStatus("synced");
      }
    };

    const handleOffline = () => {
      setSyncStatus("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [syncStatus]);

  // 自動同期（未同期の投稿がある場合）
  useEffect(() => {
    if (
      cloudProvider !== "none" &&
      navigator.onLine &&
      posts.some(post => !post.isSynced)
    ) {
      const autoSync = async () => {
        await syncPosts(posts, cloudProvider);
        setPosts(posts.map(post => ({ ...post, isSynced: true })));
      };

      // 30秒後に自動同期
      const timer = setTimeout(autoSync, 30000);
      return () => clearTimeout(timer);
    }
  }, [posts, cloudProvider]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 grid grid-rows-[auto_1fr_auto] h-screen">
      <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
        <NavBar currentView={view} setView={setView} />
      </header>

      <main className="overflow-hidden">
        <AnimatePresence mode="wait">
          {view === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 150 }}
              className="h-full"
            >
              <div className="overflow-y-auto h-full p-4 md:container md:mx-auto md:max-w-3xl no-scrollbar">
                <Timeline posts={posts} onDelete={handleDeletePost} />
              </div>
            </motion.div>
          )}

          {view === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 150 }}
              className="h-full overflow-y-auto px-4 md:container md:mx-auto md:max-w-3xl"
            >
              <Settings
                cloudProvider={cloudProvider}
                onProviderChange={setCloudProvider}
                onSync={handleSync}
                syncStatus={syncStatus}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {view === "home" && (
        <footer className="p-4 z-10">
          <div className="container mx-auto max-w-3xl">
            <PostForm onSubmit={handleNewPost} />
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
