// Generated by Wrangler
// After adding bindings to `wrangler.toml`, regenerate this interface via `npm run cf-typegen`
interface Env {
  TRANSACTOR: DurableObjectNamespace

  SERVER_SECRET: string

  HYPERDRIVE: Hyperdrive

  ACCOUNTS_URL: string

  DB_URL: string | undefined

  STATS_URL: string | undefined

  ENABLE_COMPRESSION: string | undefined

  FULLTEXT_URL: string | undefined

  DB_MODE: 'hyperdrive' | 'direct' | undefined

  FRONT_URL: string

  FILES_URL?: string

  SES_URL?: string
  SES_AUTH_TOKEN?: string
  TELEGRAM_BOT_URL: string
  AI_BOT_URL?: string
  LAST_NAME_FIRST?: string

  GREEN_URL?: string
  USE_GREEN?: string
}
