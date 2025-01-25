import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "@/utils/firebase";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div
        className='flex-1 flex items-center justify-center'
      >
        <p>Loading...</p>
      </div>
    ); // Show a loading state while checking authentication
  }

  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ProtectedRoute;