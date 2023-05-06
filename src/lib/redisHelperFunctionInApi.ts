
const upstashRedisRestUrl = process.env.UPSTASH_REDIS_REST_URL
const upstashRedisRestToken = process.env.UPSTASH_REDIS_REST_TOKEN

// redis commands that you just need to know from redis if youre working with it
// we can use these commands to interact with redis, getting or comapring or asking stuff
type Command = 'zrange' | 'sismember' | 'get' | 'smembers'

// this is the function that will be used to fetch data from the redis database
// it will take in a command and a list of arguments
export async function fetchRedis(command: Command, ...args: (string | number)[]) {
    // this is the particular format by which we can use the rest api to interact with the redis database
    const commandUrl = `${upstashRedisRestUrl}/${command}/${args.join('/')}`
    const response = await fetch(commandUrl, {
        headers: {
            Authorization: `Bearer ${upstashRedisRestToken}`
        },
        cache: 'no-store',
    })
    // if the response is not ok, throw an error
    if (!response.ok) {
        throw new Error(`Redis command ${command} failed with status ${response.status}, more info: ${response.statusText}`)
    }
    // return the response as json
    const data = await response.json()
    return data.result
}