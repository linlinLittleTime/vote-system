"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  threshold?: number;
}

/**
 * 懒加载图片组件
 * - 使用Intersection Observer检测进入视口
 * - 加载前显示占位符
 * - 加载失败显示错误提示
 */
export function LazyImage({
  src,
  alt,
  className = "",
  placeholderClassName = "",
  threshold = 100, // 提前100px开始加载
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: `${threshold}px`,
        threshold: 0.01,
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [threshold]);

  // 如果是Base64图片，直接加载（已经在内存中）
  const shouldLoadImmediately = src.startsWith("data:");
  const shouldLoad = shouldLoadImmediately || isInView;

  return (
    <div ref={imgRef} className={className}>
      {hasError ? (
        // 加载失败
        <div className={`${placeholderClassName} bg-gray-100 flex items-center justify-center`}>
          <span className="text-gray-400 text-xs">图片加载失败</span>
        </div>
      ) : !isLoaded ? (
        // 占位符（骨架屏）
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`${placeholderClassName} bg-gray-100 animate-pulse`}
        >
          {shouldLoad && (
            <img
              src={src}
              alt={alt}
              className="hidden"
              onLoad={() => setIsLoaded(true)}
              onError={() => setHasError(true)}
            />
          )}
        </motion.div>
      ) : (
        // 已加载
        <motion.img
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          src={src}
          alt={alt}
          className={className}
        />
      )}
    </div>
  );
}

/**
 * 简化版懒加载图片（用于已知Base64场景）
 */
export function OptimizedImage({
  src,
  alt,
  className = "",
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Base64图片直接加载
  if (src.startsWith("data:")) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        onError={() => setHasError(true)}
      />
    );
  }

  if (hasError) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center`}>
        <span className="text-gray-400 text-xs">❌</span>
      </div>
    );
  }

  return (
    <div className={className}>
      {!isLoaded && (
        <div className="w-full h-full bg-gray-100 animate-pulse absolute inset-0" />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${!isLoaded ? "opacity-0" : "opacity-100"} transition-opacity`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />
    </div>
  );
}