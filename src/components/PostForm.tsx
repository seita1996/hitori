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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <textarea
        ref={textAreaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="今、何を思う？"
        className="w-full p-3 bg-transparent border-b dark:border-gray-700 focus:outline-none resize-none"
        rows={3}
      />

      <div className="flex justify-between items-center mt-3">
        <motion.span
          animate={{
            color: isOverLimit ? "#ef4444" : "#9ca3af",
          }}
        >
          {remainingChars}
        </motion.span>

        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={handleSubmit}
          disabled={isOverLimit || !content.trim()}
          className={`px-4 py-2 rounded-full ${
            isOverLimit || !content.trim()
              ? "bg-gray-200 dark:bg-gray-700 text-gray-500"
              : "bg-blue-500 text-white"
          }`}
        >
          投稿
        </motion.button>
      </div>
    </div>
  );
}
