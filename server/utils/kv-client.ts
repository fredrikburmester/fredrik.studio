import { kv } from "@vercel/kv";

const PREFIX = "studio:";

export class KVClient {
  private prefixKey(key: string): string {
    return `${PREFIX}${key}`;
  }

  // Set operations
  async setAdd(key: string, value: string): Promise<void> {
    await kv.sadd(this.prefixKey(key), value);
  }

  async setRemove(key: string, value: string): Promise<void> {
    await kv.srem(this.prefixKey(key), value);
  }

  async setMembers(key: string): Promise<string[]> {
    return (await kv.smembers(this.prefixKey(key))) || [];
  }

  async setSize(key: string): Promise<number> {
    return (await kv.scard(this.prefixKey(key))) || 0;
  }

  async setIsMember(key: string, value: string): Promise<boolean> {
    return (await kv.sismember(this.prefixKey(key), value)) === 1;
  }

  // Hash operations
  async hashSetMultiple(
    key: string,
    data: Record<string, string | number | boolean>
  ): Promise<void> {
    await kv.hset(this.prefixKey(key), data);
  }

  async hashGetAll(key: string): Promise<Record<string, string>> {
    return (await kv.hgetall(this.prefixKey(key))) || {};
  }

  async hashGet(key: string, field: string): Promise<string | null> {
    return await kv.hget(this.prefixKey(key), field);
  }

  async hashDelete(key: string, ...fields: string[]): Promise<void> {
    await kv.hdel(this.prefixKey(key), ...fields);
  }

  // List operations
  async listPush(key: string, value: string): Promise<number> {
    return await kv.lpush(this.prefixKey(key), value);
  }

  async listGetAll(key: string): Promise<string[]> {
    try {
      console.log(`🔍 Redis listGetAll: ${this.prefixKey(key)}`);
      const result = (await kv.lrange(this.prefixKey(key), 0, -1)) || [];
      console.log(`📊 Redis listGetAll result count: ${result.length}`);
      return result;
    } catch (error) {
      console.error(
        `❌ Redis listGetAll failed for ${this.prefixKey(key)}:`,
        error
      );
      throw error;
    }
  }

  async listLength(key: string): Promise<number> {
    return (await kv.llen(this.prefixKey(key))) || 0;
  }

  async listRemove(key: string, value: string): Promise<void> {
    await kv.lrem(this.prefixKey(key), 0, value);
  }

  // Number operations
  async increment(key: string): Promise<number> {
    return await kv.incr(this.prefixKey(key));
  }

  async decrement(key: string): Promise<number> {
    return await kv.decr(this.prefixKey(key));
  }

  async set(key: string, value: string | number): Promise<void> {
    await kv.set(this.prefixKey(key), value);
  }

  async get(key: string): Promise<string | null> {
    return await kv.get(this.prefixKey(key));
  }

  // Utility operations
  async delete(key: string): Promise<void> {
    await kv.del(this.prefixKey(key));
  }

  async exists(key: string): Promise<boolean> {
    return (await kv.exists(this.prefixKey(key))) === 1;
  }

  // Multi-get for multiple keys
  async multiGet(keys: string[]): Promise<(string | null)[]> {
    if (keys.length === 0) return [];
    const prefixedKeys = keys.map((key) => this.prefixKey(key));
    return await kv.mget(...prefixedKeys);
  }
}

export const kvClient = new KVClient();
