import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface PostFormProps {
  onSubmit: (content: string) => void;
  maxLength?: number;
}

export function PostForm({ onSubmit, maxLength = 280 }: PostFormProps) {
  const [content, setContent] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // テキストエリアの高さを自動調整
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleSubmit = () => {
    if (content.trim() && content.length <= maxLength) {
      onSubmit(content);
      setContent("");
      if (textAreaRef.current) {
        textAreaRef.current.style.height = "auto";
      }
    }
  };

  const remainingChars = maxLength - content.length;
  const isOverLimit = remainingChars < 0;

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-soft-lg p-6">
      <textarea
        ref={textAreaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="今、何を思う？"
        className="w-full p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-transparent resize-none text-gray-700 dark:text-gray-200"
        rows={3}
      />

      <div className="flex justify-between items-center mt-4">
        <motion.span
          animate={{
            color: isOverLimit 
              ? "#ef4444" 
              : remainingChars < 20 
                ? "#fbbf24" 
                : "#9ca3af",
          }}
          className="text-sm font-medium"
        >
          {remainingChars}
        </motion.span>

        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={handleSubmit}
          disabled={isOverLimit || !content.trim()}
          className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
            isOverLimit || !content.trim()
              ? "bg-gray-200 dark:bg-gray-700 text-gray-500"
              : "bg-primary-DEFAULT hover:bg-primary-dark text-white shadow-sm"
          }`}
        >
          投稿
        </motion.button>
      </div>
    </div>
  );
}
