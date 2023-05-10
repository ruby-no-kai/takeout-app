export const DEFAULT_AVATAR_URL = document.querySelector<HTMLMetaElement>('meta[name="rkto:default-avatar"]')?.content;
export const SENTRY_DSN = document.querySelector<HTMLMetaElement>('meta[name="rkto:sentry-dsn"]')?.content;
export const CACHE_BUSTER = document.querySelector<HTMLMetaElement>('meta[name="rkto:cache-buster"]')?.content;
export const COMMIT = document.querySelector<HTMLMetaElement>('meta[name="rkto:commit"]')?.content || "unknown";
