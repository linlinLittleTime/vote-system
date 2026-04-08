"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
}

export function useAdminAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    loading: true,
  });

  // 检查登录状态
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // 尝试访问需要认证的API来判断登录状态
      const res = await fetch("/api/admin/activities?page=1&pageSize=1");
      if (res.ok) {
        setState({ isAuthenticated: true, loading: false });
      } else if (res.status === 401) {
        setState({ isAuthenticated: false, loading: false });
      } else {
        setState({ isAuthenticated: false, loading: false });
      }
    } catch (err) {
      setState({ isAuthenticated: false, loading: false });
    }
  };

  const login = async (token: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (data.success) {
        setState({ isAuthenticated: true, loading: false });
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: "网络错误" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
      setState({ isAuthenticated: false, loading: false });
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("退出登录失败:", err);
    }
  };

  return {
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    login,
    logout,
  };
}