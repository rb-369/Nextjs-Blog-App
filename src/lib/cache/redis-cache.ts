import { Redis } from "@upstash/redis";

const CACHE_KEY_PREFIX = "velo:cache";
const TAG_KEY_PREFIX = "velo:cache-tag";
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

const hasRedisConfig =
    Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
    Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

const redis = hasRedisConfig ? Redis.fromEnv() : null;

function makeCacheKey(parts: string[]) {
    const normalized = parts.map((part) => encodeURIComponent(part));
    return `${CACHE_KEY_PREFIX}:${normalized.join(":")}`;
}

function makeTagKey(tag: string) {
    return `${TAG_KEY_PREFIX}:${encodeURIComponent(tag)}`;
}

function reviveDatesDeep(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map((item) => reviveDatesDeep(item));
    }

    if (value && typeof value === "object") {
        const entries = Object.entries(value as Record<string, unknown>);
        return Object.fromEntries(entries.map(([key, nested]) => [key, reviveDatesDeep(nested)]));
    }

    if (typeof value === "string" && ISO_DATE_PATTERN.test(value)) {
        return new Date(value);
    }

    return value;
}

function deserialize<T>(serialized: string): T {
    return reviveDatesDeep(JSON.parse(serialized)) as T;
}

export async function getOrSetRedisCache<T>(params: {
    keyParts: string[];
    tags: string[];
    ttlSeconds: number;
    getData: () => Promise<T>;
}) {
    const { keyParts, tags, ttlSeconds, getData } = params;

    if (!redis) {
        return getData();
    }

    const cacheKey = makeCacheKey(keyParts);
    const cached = await redis.get<string>(cacheKey);

    if (typeof cached === "string") {
        try {
            return deserialize<T>(cached);
        } catch {
            await redis.del(cacheKey);
        }
    }

    const fresh = await getData();
    const serialized = JSON.stringify(fresh);

    const pipeline = redis.pipeline();
    pipeline.set(cacheKey, serialized, { ex: ttlSeconds });

    for (const tag of tags) {
        const tagKey = makeTagKey(tag);
        pipeline.sadd(tagKey, cacheKey);
        pipeline.expire(tagKey, Math.max(ttlSeconds * 2, 60));
    }

    await pipeline.exec();
    return fresh;
}

export async function invalidateCacheTags(tags: string[]) {
    if (!redis || !tags.length) {
        return;
    }

    const uniqueTags = Array.from(new Set(tags));
    const keysToDelete = new Set<string>();

    for (const tag of uniqueTags) {
        const tagKey = makeTagKey(tag);
        const members = (await redis.smembers<string[]>(tagKey)) ?? [];

        for (const key of members) {
            keysToDelete.add(key);
        }

        keysToDelete.add(tagKey);
    }

    if (!keysToDelete.size) {
        return;
    }

    await redis.del(...Array.from(keysToDelete));
}

export const isRedisCacheEnabled = hasRedisConfig;
