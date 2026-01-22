import { LogOut, User } from "lucide-react";
import logo from "../assets/logo-LY-sm.png";
import vn from "../assets/vietnam.png";
import en from "../assets/united-kingdom.png";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import storage from "@/lib/storage";

const Header = () => {
  const [language, setLanguage] = useState("vi");
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
    storage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-20 h-12 bg-white flex items-center justify-center">
            <img src={logo} />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>

            <SelectContent
              position="item-aligned"
              side="bottom"
              className="mt-1"
            >
              <SelectItem value="vi">
                <div className="flex items-center gap-2">
                  <img src={vn} className="w-5 h-5" />
                  Tiếng Việt
                </div>
              </SelectItem>

              <SelectItem value="en">
                <div className="flex items-center gap-2">
                  <img src={en} className="w-5 h-5" />
                  English
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpenUserMenu(!openUserMenu)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 hover:bg-orange-200 transition"
            >
              <User className="w-5 h-5 text-orange-600" />
            </button>

            {openUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                <div className="px-3 py-2 flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-300">
                    <User className="w-4 h-4 text-white" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm text-gray-700 font-medium truncate">
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
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg transition"
                >
                  <LogOut className="size-4" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
