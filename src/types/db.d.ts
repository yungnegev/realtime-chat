declare namespace NodeJS {
    interface ProcessEnv {
        UPSTASH_REDIS_REST_URL: string,
        UPSTASH_REDIS_REST_TOKEN: string
    }
}

interface User {
    name: string
    email: string
    image: string
    id: string
}

interface Message {
    id: string
    senderId: string
    receiverId: string
    text: string
    timestamp: number // unix timestamp
}

interface Chat {
    id: string
    messages: Message[]
}

interface FriendRequest {
    id: string
    senderId: string
    receiverId: string
}