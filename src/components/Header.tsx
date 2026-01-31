import { LogOut, User } from "lucide-react";
import logo from "../assets/logo-LY-sm.png";
import vi from "../assets/vi.jpg";
import en from "../assets/en.jpg";
import tw from "../assets/tw.jpg";
import { Select } from "antd";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import storage from "@/lib/storage";
import { AnimatePresence, motion } from "framer-motion";
import i18n from "@/i18n";
import { useTranslation } from "react-i18next";

const Header = () => {
  const { t } = useTranslation();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const user = JSON.parse(storage.get("user"));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setOpenUserMenu(false);
    setIsLoggingOut(true);

    setTimeout(() => {
      storage.clear();
      navigate("/login", { replace: true });
    }, 600);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4">
        <div className="flex items-center flex-shrink-0">
          <div
            className="w-16 sm:w-20 h-10 sm:h-12 bg-white flex items-center justify-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              src={logo || "/placeholder.svg"}
              alt="Logo"
              className="max-w-full max-h-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Select
            value={i18n.language}
            onChange={(lng) => {
              i18n.changeLanguage(lng);
            }}
            style={{ width: 160 }}
            options={[
              {
                value: "vi",
                label: (
                  <div className="flex items-center gap-2">
                    <img src={vi} className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-sm">
                      {t("header.vietnamese")}
                    </span>
                  </div>
                ),
              },
              {
                value: "en",
                label: (
                  <div className="flex items-center gap-2">
                    <img src={en} className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-sm">
                      {t("header.english")}
                    </span>
                  </div>
                ),
              },
              {
                value: "tw",
                label: (
                  <div className="flex items-center gap-2">
                    <img src={tw} className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-sm">
                      {t("header.taiwan")}
                    </span>
                  </div>
                ),
              },
            ]}
          />

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpenUserMenu(!openUserMenu)}
              className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-orange-100 hover:bg-orange-200 transition flex-shrink-0"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            </button>

            <AnimatePresence>
              {openUserMenu && (
                <motion.div
                  onClick={() => setOpenUserMenu(false)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    onClick={(e) => e.stopPropagation()}
                    initial={{ scale: 0.8, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.8, y: 20, opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                      duration: 0.4,
                    }}
                  >
                    <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                      <div className="px-4 py-3 sm:py-4 flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gray-300 flex-shrink-0">
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm text-gray-700 font-medium truncate">
                            {user?.fullName || "Người dùng"}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {user?.userId || ""}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {user?.factory}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-gray-200" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 sm:py-3 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded-b-lg transition"
                      >
                        <LogOut className="w-4 h-4" />
                        {t("header.logout")}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isLoggingOut && (
          <motion.div
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1.05 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 bg-white z-[9999]"
          />
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
