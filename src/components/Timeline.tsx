import { motion, AnimatePresence } from "framer-motion";
import { Post } from "../types";

interface TimelineProps {
  posts: Post[];
  onDelete?: (id: string) => void;
}

export function Timeline({ posts, onDelete }: TimelineProps) {
  // 日付フォーマット用関数
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("ja-JP", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // 投稿を古い順に並べ替え（反転）
  const sortedPosts = [...posts].reverse();

  return (
    <div className="space-y-5">
      {posts.length === 0 ? (
        <div className="text-center py-12 px-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md text-gray-500 dark:text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <p className="text-lg">まだ投稿がありません。</p>
          <p className="mt-2">思いつくままに何か書いてみましょう。</p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {sortedPosts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5 border border-gray-100 dark:border-gray-700"
            >
              <p className="mb-3 whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">{post.content}</p>
              <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDate(post.createdAt)}
                </span>
                {onDelete && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDelete(post.id)}
                    className="text-red-400 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    削除
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}
