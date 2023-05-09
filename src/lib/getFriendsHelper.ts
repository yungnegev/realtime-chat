import { fetchRedis } from "./redisHelperFunctionInApi"

export const getFriendsHelper = async (userId: string) => {
    // get the the current users freiends
    const friendIds = await fetchRedis('smembers',`user:${userId}:friends`) 
    // simultanious fetching
    const friends = await Promise.all(
        friendIds.map(async (friendId: string) => {
            const friend = await fetchRedis('get', `user:${friendId}`) as string
            const parsedFriend = JSON.parse(friend) as User
            return parsedFriend
        })
    )

    return friends
}