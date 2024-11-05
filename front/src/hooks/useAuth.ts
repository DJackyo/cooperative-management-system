// src/hooks/useAuth.ts
import { useEffect } from 'react';
import { redirect } from 'next/navigation';

const useAuth = () => {
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      redirect("/authentication/login"); 
    }
  }, []);
};

export default useAuth;
