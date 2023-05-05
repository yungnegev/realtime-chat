interface User {
    name: string
    email: string
    image: string
    id: string
}

declare namespace NodeJS {
    interface ProcessEnv {
        UPSTASH_REDIS_REST_URL: string,
        UPSTASH_REDIS_REST_TOKEN: string
    }
  }