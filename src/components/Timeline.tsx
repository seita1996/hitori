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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">投稿履歴</h2>

      {posts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          まだ投稿がありません。思いつくままに何か書いてみましょう。
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
            >
              <p className="mb-2 whitespace-pre-wrap">{post.content}</p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{formatDate(post.createdAt)}</span>
                {onDelete && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDelete(post.id)}
                    className="text-red-500 hover:text-red-700"
                  >
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
