declare module 'next/link' {
  import type { LinkProps as OriginalLinkProps } from 'next/dist/client/link'
  import type { ReactElementType } from 'react'

  type LinkRestProps = Omit<OriginalLinkProps, 'href'>

  export type LinkProps = LinkRestProps & {
    href: string | { pathname: string; query?: Record<string, string | string[] | undefined> }
  }

  export default function Link(props: LinkProps & { children?: React.ReactNode }): ReactElementType
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