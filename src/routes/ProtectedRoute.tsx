import { useAuth } from "@/contexts/AuthContext";
import { type JSX } from "react";
import { Navigate } from "react-router-dom";
import { Spin } from "antd";
import { motion } from "framer-motion";

interface Props {
  children: JSX.Element;
}

export default function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        // style={{
        //   height: "100vh",
        //   display: "flex",
        //   justifyContent: "center",
        //   alignItems: "center",
        //   background: "linear-gradient(135deg, #f0f5ff, #ffffff)",
        // }}
      >
        <Spin size="large" tip="Checking authentication..." />
      </motion.div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
