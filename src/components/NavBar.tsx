import { motion } from "framer-motion";
import { AppView } from "../types";

interface NavBarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

export function NavBar({ currentView, setView }: NavBarProps) {
  return (
    <header className="border-b dark:border-gray-700">
      <nav className="flex justify-between p-4">
        <h1 className="text-2xl font-bold">Hitori</h1>
        <div className="flex space-x-2">
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
      className={`px-4 py-2 rounded-md ${
        active
          ? "bg-blue-500 text-white"
          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
      }`}
    >
      {label}
    </motion.button>
  );
}
