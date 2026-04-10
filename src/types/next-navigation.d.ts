import type { NavigateOptions, PrefetchOptions } from 'next/dist/shared/lib/app-router-context.shared-runtime'

declare module 'next/navigation' {
  export interface AppRouterInstance {
    /**
     * Navigate to the previous history entry.
     */
    back(): void
    /**
     * Navigate to the next history entry.
     */
    forward(): void
    /**
     * Refresh the current page.
     */
    refresh(): void
    /**
     * Refresh the current page. Use in development only.
     * @internal
     */
    hmrRefresh(): void
    /**
     * Navigate to the provided href.
     * Pushes a new history entry.
     */
    push(href: string, options?: NavigateOptions): void
    /**
     * Navigate to the provided href.
     * Replaces the current history entry.
     */
    replace(href: string, options?: NavigateOptions): void
    /**
     * Prefetch the provided href.
     */
    prefetch(href: string, options?: PrefetchOptions): void
  }

  export function useRouter(): AppRouterInstance
}