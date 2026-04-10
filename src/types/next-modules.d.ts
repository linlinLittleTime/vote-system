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
  export interface RequestCookie {
    name: string
    value: string
  }

  export interface ResponseCookie {
    name: string
    value: string
    expires?: Date | number
    maxAge?: number
    domain?: string
    path?: string
    secure?: boolean
    httpOnly?: boolean
    sameSite?: 'strict' | 'lax' | 'none'
  }

  export interface ReadonlyRequestCookies {
    get: (name: string) => RequestCookie | undefined
    getAll: () => RequestCookie[]
    has: (name: string) => boolean
    set: (name: string, value: string, options?: Partial<ResponseCookie>) => void
    delete: (name: string) => void
  }

  export function cookies(): Promise<ReadonlyRequestCookies>
  export function headers(): Promise<Headers>
}