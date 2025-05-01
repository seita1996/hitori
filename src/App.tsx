import { useState, useEffect } from "react";
import { NavBar } from "./components/NavBar";
import { PostForm } from "./components/PostForm";
import { Timeline } from "./components/Timeline";
import { Settings } from "./components/Settings";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { syncPosts } from "./utils/cloudSync";
import { Post, AppView, CloudProvider, SyncStatus } from "./types";
import { AnimatePresence, motion } from "framer-motion";
import { core } from "@tauri-apps/api";
import "./index.css";

function App() {
  // アプリの状態管理
  const [view, setView] = useState<AppView>("home");
  const [posts, setPosts] = useState<Post[]>([]);
  const [cloudProvider, setCloudProvider] = useLocalStorage<CloudProvider>("cloud-provider", "none");
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("synced");
  const [loading, setLoading] = useState<boolean>(true);

  // 投稿の取得
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const fetchedPosts = await core.invoke<Post[]>("get_posts");
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // 初期ロード時に投稿を取得
  useEffect(() => {
    fetchPosts();
  }, []);

  // 新しい投稿を作成
  const handleNewPost = async (content: string) => {
    try {
      const newPost = await core.invoke<Post>("add_post", { content });
      setPosts([newPost, ...posts]);
    } catch (error) {
      console.error("Failed to add post:", error);
    }
  };

  // 投稿を削除
  const handleDeletePost = async (id: string) => {
    try {
      await core.invoke("delete_post", { id });
      setPosts(posts.filter(post => post.id !== id));
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  // 手動同期
  const handleSync = async () => {
    setSyncStatus("syncing");
    try {
      const result = await syncPosts(posts, cloudProvider);
      setSyncStatus(result.status);

      if (result.status === "synced") {
        // 同期成功後、全ての投稿にisSynced=trueをセット
        const syncedPostIds = posts
          .filter(post => !post.is_synced)
          .map(post => post.id);
        
        if (syncedPostIds.length > 0) {
          await core.invoke("update_sync_status", {
            ids: syncedPostIds,
            is_synced: true
          });
          
          setPosts(posts.map(post => ({ ...post, is_synced: true })));
        }
      }
    } catch (error) {
      console.error("Sync failed:", error);
      setSyncStatus("error");
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
      posts.some(post => !post.is_synced)
    ) {
      const autoSync = async () => {
        try {
          const result = await syncPosts(posts, cloudProvider);
          if (result.status === "synced") {
            const syncedPostIds = posts
              .filter(post => !post.is_synced)
              .map(post => post.id);
            
            if (syncedPostIds.length > 0) {
              await core.invoke("update_sync_status", {
                ids: syncedPostIds,
                is_synced: true
              });
              
              setPosts(posts.map(post => ({ ...post, is_synced: true })));
            }
          }
        } catch (error) {
          console.error("Auto sync failed:", error);
        }
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
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                ) : (
                  <Timeline posts={posts} onDelete={handleDeletePost} />
                )}
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