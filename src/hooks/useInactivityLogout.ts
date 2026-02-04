import { useEffect, useRef } from "react";
import { Modal } from "antd";
import { useTranslation } from "react-i18next";

interface Props {
  isAuthenticated: boolean;
  logout: () => void;
  timeout?: number;
}

export default function useInactivityLogout({
  isAuthenticated,
  logout,
  timeout = 15 * 60 * 1000,
}: Props) {
  const { t } = useTranslation();

  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
  };

  const resetTimer = () => {
    if (!isAuthenticated) return;

    clearTimers();

    warningTimer.current = setTimeout(() => {
      Modal.warning({
        title: t("auto_logout.session_expire"),
        content: t("auto_logout.text"),
        centered: true,
      });
    }, timeout - 60_000);

    logoutTimer.current = setTimeout(() => {
      Modal.destroyAll();
      logout();
      window.location.href = "/login";
    }, timeout);
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      clearTimers();
    };
  }, [isAuthenticated]);
}
