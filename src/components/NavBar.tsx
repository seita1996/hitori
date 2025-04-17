import { motion } from "framer-motion";
import { AppView } from "../types";

interface NavBarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

export function NavBar({ currentView, setView }: NavBarProps) {
  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <nav className="flex justify-between items-center p-4 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Hitori</h1>
        <div className="flex space-x-3">
          <NavButton
            active={currentView === "post"}
            onClick={() => setView("post")}
            label="投稿"
          />
          <NavButton
            active={currentView === "timeline"}
            onClick={() => setView("timeline")}
            label="履歴"
          />
          <NavButton
            active={currentView === "settings"}
            onClick={() => setView("settings")}
            label="設定"
          />
        </div>
      </nav>
    </header>
  );
}

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

function NavButton({ active, onClick, label }: NavButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-5 py-2 rounded-xl font-medium transition-all duration-200 ${
        active
          ? "bg-indigo-500 text-white shadow-sm"
          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
      }`}
    >
      {label}
    </motion.button>
  );
}
