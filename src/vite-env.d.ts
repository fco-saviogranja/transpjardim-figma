/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_PROJECT_ID?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_RESEND_API_KEY?: string
  readonly VITE_SUPABASE_URL?: string
  // mais env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Declaração para NodeJS timers no ambiente browser
declare global {
  namespace NodeJS {
    interface Timeout extends ReturnType<typeof setTimeout> {}
  }
}