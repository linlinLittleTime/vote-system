"use client";

import { useState, useCallback, useEffect } from "react";

interface CsrfState {
  token: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * CSRF Token Hook
 * 用于管理后台操作时的CSRF保护
 */
export function useCsrf() {
  const [state, setState] = useState<CsrfState>({
    token: null,
    loading: false,
    error: null,
  });

  // 获取 CSRF Token
  const fetchToken = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch("/api/admin/csrf");
      if (res.ok) {
        const data = await res.json();
        setState({ token: data.token, loading: false, error: null });
        return data.token;
      } else {
        setState({ token: null, loading: false, error: "获取Token失败" });
        return null;
      }
    } catch (err) {
      setState({ token: null, loading: false, error: "网络错误" });
      return null;
    }
  }, []);

  // 带 CSRF 保护的 fetch
  const fetchWithCsrf = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      const token = state.token || (await fetchToken());

      if (!token) {
        throw new Error("无法获取CSRF Token");
      }

      // 添加 CSRF Token 到请求头
      const headers = new Headers(options.headers || {});
      headers.set("X-CSRF-Token", token);

      // 如果有请求体，也添加到请求体中
      let body = options.body;
      if (options.body && typeof options.body === "string") {
        try {
          const parsedBody = JSON.parse(options.body);
          body = JSON.stringify({ ...parsedBody, _csrf: token });
        } catch {
          // 如果不是JSON，保持原样
        }
      }

      return fetch(url, {
        ...options,
        headers,
        body,
      });
    },
    [state.token, fetchToken]
  );

  // 初始化时获取Token
  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  return {
    token: state.token,
    loading: state.loading,
    error: state.error,
    fetchToken,
    fetchWithCsrf,
  };
}