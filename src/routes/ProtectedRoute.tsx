import storage from '@/lib/storage';
import { type JSX } from 'react'
import { Navigate } from 'react-router-dom';

interface Props {
  children: JSX.Element;
}

export default function ProtectedRoute({ children }: Props) {
  const token = storage.get("accessToken");
  
  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children;
}
