declare module 'next/link' {
  import type { AnchorHTMLAttributes, ReactNode } from 'react'

  export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
    href: string | { pathname: string; query?: Record<string, string | string[] | undefined> }
    replace?: boolean
    scroll?: boolean
    prefetch?: boolean | 'unknown'
    children?: ReactNode
  }

  export default function Link(props: LinkProps): JSX.Element
}

declare module 'next/dynamic' {
  import type { ComponentType } from 'react'

  export interface DynamicOptions {
    loading?: () => React.ReactNode
    ssr?: boolean
  }

  export default function dynamic(
    loader: () => Promise<any>,
    options?: DynamicOptions
  ): ComponentType<any>
}

declare module 'next/headers' {
  import type { RequestCookies } from 'next/dist/server/web/spec-extension/cookies'
  import type { Headers } from 'next/dist/server/web/spec-extension/headers'

  export function cookies(): Promise<RequestCookies>
  export function headers(): Promise<Headers>
}