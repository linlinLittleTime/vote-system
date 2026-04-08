/// <reference types="next" />
/// <reference types="next/image-types/global" />

declare module "next" {
  export interface Metadata {
    title?: string;
    description?: string;
    [key: string]: unknown;
  }

  export interface NextConfig {
    [key: string]: unknown;
  }
}

declare module "next/navigation" {
  import { NextRouter } from "next/dist/shared/lib/router/router";

  export function useRouter(): NextRouter;
  export function useParams<T extends Record<string, string>>(): T;
  export function usePathname(): string;
  export function useSearchParams(): URLSearchParams;
}

declare module "next/font/google" {
  export function Geist(options: { variable: string; subsets: string[] }): { variable: string };
  export function Geist_Mono(options: { variable: string; subsets: string[] }): { variable: string };
}