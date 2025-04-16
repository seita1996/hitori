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
  const [view, setView] = useState<AppView>("post");
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
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-200 flex flex-col">
      <NavBar currentView={view} setView={setView} />

      <main className="container mx-auto p-4 md:p-6 flex-grow max-w-3xl">
        <AnimatePresence mode="wait">
          {view === "post" && (
            <motion.div
              key="post"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 150 }}
              className="py-2"
            >
              <PostForm onSubmit={handleNewPost} />
            </motion.div>
          )}

          {view === "timeline" && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 150 }}
              className="py-2"
            >
              <Timeline posts={posts} onDelete={handleDeletePost} />
            </motion.div>
          )}

          {view === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 150 }}
              className="py-2"
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

      <footer className="border-t border-gray-200 dark:border-gray-700 py-4 text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
        <p className="font-medium">Hitori - あなただけのつぶやき空間</p>
      </footer>
    </div>
  );
}

export default App;
