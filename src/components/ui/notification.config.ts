import { notification } from "antd";

const isMobile = window.innerWidth < 640;

notification.config({
  placement: isMobile ? "top" : "topRight",
  duration: 2.5,
  maxCount: 2,
  top: isMobile ? 12 : 24,
});
