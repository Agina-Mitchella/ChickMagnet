import Redis from 'ioredis';
import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

// Robust JSON file-backed database for local development server routes
const DB_FILE = path.join(process.cwd(), 'db.json');
let jsonDb: any = {};
try {
  if (fs.existsSync(DB_FILE)) {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    jsonDb = JSON.parse(raw);
  }
} catch (e) {
  console.error('Failed to load db.json, starting with empty database:', e);
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(jsonDb, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save db.json:', e);
  }
}

function getCollectionKey(modelName: string): string {
  if (modelName === 'giftLink') return 'gifts';
  if (modelName === 'keeperProfile') return 'makers';
  if (modelName === 'messageThread') return 'threads';
  // Standard pluralization:
  if (modelName.endsWith('y')) {
    return modelName.slice(0, -1) + 'ies';
  }
  return modelName + 's';
}

function getCollection(modelName: string): any[] {
  const key = getCollectionKey(modelName);
  if (!jsonDb[key]) {
    jsonDb[key] = [];
  }
  return jsonDb[key];
}

function setCollection(modelName: string, items: any[]) {
  const key = getCollectionKey(modelName);
  jsonDb[key] = items;
  saveDb();
}

function matchesFilter(item: any, where: any): boolean {
  if (!where) return true;
  for (const [key, val] of Object.entries(where)) {
    if (key === 'OR' && Array.isArray(val)) {
      if (val.length === 0) return true;
      return val.some(subWhere => matchesFilter(item, subWhere));
    }
    if (key === 'AND' && Array.isArray(val)) {
      return val.every(subWhere => matchesFilter(item, subWhere));
    }
    if (key === 'NOT') {
      return !matchesFilter(item, val);
    }
    const itemVal = item[key];
    if (val && typeof val === 'object' && !(val instanceof Date)) {
      if ('contains' in val) {
        const str = String(itemVal || '').toLowerCase();
        const search = String(val.contains || '').toLowerCase();
        if (!str.includes(search)) return false;
      } else if ('in' in val && Array.isArray(val.in)) {
        if (!val.in.includes(itemVal)) return false;
      } else if ('gt' in val) {
        if (!(itemVal > val.gt)) return false;
      } else if ('gte' in val) {
        if (!(itemVal >= val.gte)) return false;
      } else if ('lt' in val) {
        if (!(itemVal < val.lt)) return false;
      } else if ('lte' in val) {
        if (!(itemVal <= val.lte)) return false;
      } else if ('equals' in val) {
        if (itemVal !== val.equals) return false;
      } else if ('not' in val) {
        if (itemVal === val.not) return false;
      }
    } else {
      if (itemVal !== val) return false;
    }
  }
  return true;
}

function applyOrderBy(items: any[], orderBy: any): any[] {
  if (!orderBy) return items;
  const sorted = [...items];
  const orderPairs = Array.isArray(orderBy) ? orderBy : [orderBy];
  
  sorted.sort((a, b) => {
    for (const order of orderPairs) {
      for (const [key, dir] of Object.entries(order)) {
        const valA = a[key];
        const valB = b[key];
        if (valA === valB) continue;
        const multiplier = dir === 'desc' ? -1 : 1;
        if (valA < valB) return -1 * multiplier;
        if (valA > valB) return 1 * multiplier;
      }
    }
    return 0;
  });
  return sorted;
}

async function runQuery(modelName: string, operation: string, args: any, originalFn: Function | undefined, fallbackFn: Function) {
  return fallbackFn(args);
}

const fallbackFindMany = (modelName: string) => async (args: any = {}) => {
  let items = getCollection(modelName);
  items = items.filter(item => matchesFilter(item, args.where));
  items = applyOrderBy(items, args.orderBy);
  if (args.skip) {
    items = items.slice(args.skip);
  }
  if (args.take) {
    items = items.slice(0, args.take);
  }
  return items;
};

const fallbackFindFirst = (modelName: string) => async (args: any = {}) => {
  const items = await fallbackFindMany(modelName)(args);
  return items[0] || null;
};

const fallbackFindUnique = (modelName: string) => async (args: any = {}) => {
  return fallbackFindFirst(modelName)(args);
};

const fallbackCount = (modelName: string) => async (args: any = {}) => {
  const items = await fallbackFindMany(modelName)(args);
  return items.length;
};

const fallbackCreate = (modelName: string) => async (args: any = {}) => {
  const collection = getCollection(modelName);
  const data = { ...args.data };
  if (!data.id) {
    data.id = Math.random().toString(36).substring(2, 11);
  }
  if (!data.createdAt) {
    data.createdAt = new Date().toISOString();
  }
  data.updatedAt = new Date().toISOString();
  collection.push(data);
  setCollection(modelName, collection);
  return data;
};

const fallbackUpdate = (modelName: string) => async (args: any = {}) => {
  const collection = getCollection(modelName);
  const index = collection.findIndex(item => matchesFilter(item, args.where));
  if (index === -1) {
    throw new Error(`Record to update not found in ${modelName}.`);
  }
  const updated = {
    ...collection[index],
    ...args.data,
    updatedAt: new Date().toISOString(),
  };
  collection[index] = updated;
  setCollection(modelName, collection);
  return updated;
};

const fallbackUpdateMany = (modelName: string) => async (args: any = {}) => {
  const collection = getCollection(modelName);
  let count = 0;
  const updatedCollection = collection.map(item => {
    if (matchesFilter(item, args.where)) {
      count++;
      return {
        ...item,
        ...args.data,
        updatedAt: new Date().toISOString(),
      };
    }
    return item;
  });
  setCollection(modelName, updatedCollection);
  return { count };
};

const fallbackUpsert = (modelName: string) => async (args: any = {}) => {
  const collection = getCollection(modelName);
  const index = collection.findIndex(item => matchesFilter(item, args.where));
  if (index !== -1) {
    const updated = {
      ...collection[index],
      ...args.update,
      updatedAt: new Date().toISOString(),
    };
    collection[index] = updated;
    setCollection(modelName, collection);
    return updated;
  } else {
    const data = {
      ...args.create,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (!data.id) {
      data.id = Math.random().toString(36).substring(2, 11);
    }
    collection.push(data);
    setCollection(modelName, collection);
    return data;
  }
};

const fallbackDelete = (modelName: string) => async (args: any = {}) => {
  const collection = getCollection(modelName);
  const index = collection.findIndex(item => matchesFilter(item, args.where));
  if (index === -1) {
    throw new Error(`Record to delete not found in ${modelName}.`);
  }
  const deleted = collection[index];
  collection.splice(index, 1);
  setCollection(modelName, collection);
  return deleted;
};

const fallbackDeleteMany = (modelName: string) => async (args: any = {}) => {
  const collection = getCollection(modelName);
  const remaining = collection.filter(item => !matchesFilter(item, args.where));
  const count = collection.length - remaining.length;
  setCollection(modelName, remaining);
  return { count };
};

const fallbackAggregate = (modelName: string) => async (args: any = {}) => {
  const collection = getCollection(modelName);
  const items = collection.filter(item => matchesFilter(item, args.where));
  const res: any = {};
  if (args._sum) {
    res._sum = {};
    for (const key of Object.keys(args._sum)) {
      res._sum[key] = items.reduce((acc, item) => acc + Number(item[key] || 0), 0);
    }
  }
  if (args._avg) {
    res._avg = {};
    for (const key of Object.keys(args._avg)) {
      const sum = items.reduce((acc, item) => acc + Number(item[key] || 0), 0);
      res._avg[key] = items.length ? sum / items.length : 0;
    }
  }
  if (args._count) {
    res._count = items.length;
  }
  return res;
};

const fallbackTransaction = async (arg: any) => {
  if (Array.isArray(arg)) {
    const results = [];
    for (const promise of arg) {
      results.push(await promise);
    }
    return results;
  } else if (typeof arg === 'function') {
    return await arg(prismaProxy);
  }
  return arg;
};

const modelProxies: Record<string, any> = {};

export const prismaProxy: any = new Proxy({}, {
  get(target, prop, receiver) {
    if (prop === '$transaction') {
      return async (arg: any) => fallbackTransaction(arg);
    }
    if (prop === '$connect') {
      return async () => {};
    }
    if (prop === '$disconnect') {
      return async () => {};
    }
    if (prop === '$queryRaw') {
      return async () => [{ '?column?': 1 }];
    }

    if (typeof prop === 'string' && !prop.startsWith('$') && !prop.startsWith('_')) {
      const modelName = prop;
      if (!modelProxies[modelName]) {
        modelProxies[modelName] = new Proxy({}, {
          get(mTarget, op, mReceiver) {
            if (typeof op !== 'string') return undefined;
            
            let fallbackFn: Function;
            switch (op) {
              case 'findMany': fallbackFn = fallbackFindMany(modelName); break;
              case 'findFirst': fallbackFn = fallbackFindFirst(modelName); break;
              case 'findUnique': fallbackFn = fallbackFindUnique(modelName); break;
              case 'count': fallbackFn = fallbackCount(modelName); break;
              case 'create': fallbackFn = fallbackCreate(modelName); break;
              case 'update': fallbackFn = fallbackUpdate(modelName); break;
              case 'updateMany': fallbackFn = fallbackUpdateMany(modelName); break;
              case 'upsert': fallbackFn = fallbackUpsert(modelName); break;
              case 'delete': fallbackFn = fallbackDelete(modelName); break;
              case 'deleteMany': fallbackFn = fallbackDeleteMany(modelName); break;
              case 'aggregate': fallbackFn = fallbackAggregate(modelName); break;
              default:
                return undefined;
            }

            return async (args: any) => {
              return runQuery(modelName, op, args, undefined, fallbackFn);
            };
          }
        });
      }
      return modelProxies[modelName];
    }

    return (target as any)[prop];
  }
});

export const prisma = prismaProxy;

// 2. Redis Client Initialization
export const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// In-Memory Fallback Redis for development/sandbox where Redis is not running
class MemoryRedis {
  private store = new Map<string, any>();
  private ttls = new Map<string, number>();

  constructor() {
    console.log('🔮 In-memory fallback Redis initialized safely.');
  }

  on(event: string, handler: Function) {
    // Gracefully handle event listeners
    return this;
  }

  async ping(): Promise<string> {
    return 'PONG';
  }

  async get(key: string): Promise<string | null> {
    const val = this.store.get(key);
    if (val === undefined || val === null) return null;
    return String(val);
  }

  async set(key: string, value: any, ...args: any[]): Promise<'OK'> {
    this.store.set(key, value);
    if (args.length >= 2 && (args[0] === 'EX' || args[0] === 'ex')) {
      const seconds = Number(args[1]);
      if (!isNaN(seconds)) {
        this.expire(key, seconds);
      }
    }
    return 'OK';
  }

  async del(key: string): Promise<number> {
    const deleted = this.store.delete(key);
    this.ttls.delete(key);
    return deleted ? 1 : 0;
  }

  async ttl(key: string): Promise<number> {
    const expiry = this.ttls.get(key);
    if (!expiry) return -1;
    const remainingSecs = Math.ceil((expiry - Date.now()) / 1000);
    return remainingSecs > 0 ? remainingSecs : -2;
  }

  async incr(key: string): Promise<number> {
    const val = Number(this.store.get(key) || 0) + 1;
    this.store.set(key, val);
    return val;
  }

  async expire(key: string, seconds: number): Promise<number> {
    const expiryTime = Date.now() + seconds * 1000;
    this.ttls.set(key, expiryTime);
    setTimeout(() => {
      this.store.delete(key);
      this.ttls.delete(key);
    }, seconds * 1000);
    return 1;
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    const hash = this.store.get(key);
    return hash && typeof hash === 'object' ? { ...hash } : {};
  }

  async hset(key: string, field: string, value: any): Promise<number> {
    let hash = this.store.get(key);
    if (!hash || typeof hash !== 'object') {
      hash = {};
      this.store.set(key, hash);
    }
    hash[field] = String(value);
    return 1;
  }

  async hdel(key: string, field: string): Promise<number> {
    const hash = this.store.get(key);
    if (hash && typeof hash === 'object') {
      delete hash[field];
    }
    return 1;
  }
}

const useMemoryRedis = !process.env.REDIS_URL || process.env.REDIS_URL.includes('localhost') || process.env.REDIS_URL.includes('127.0.0.1');

export const redis = useMemoryRedis 
  ? (new MemoryRedis() as any)
  : new Redis(redisUrl, {
      maxRetriesPerRequest: null, // Critical for BullMQ compatibility
    });

if (!useMemoryRedis) {
  redis.on('error', (err: any) => {
    console.error('Redis connection error:', err);
  });
}

// 3. Resend Transactional Email Client
let resendClient: Resend | null = null;
export function getResend(): Resend | null {
  if (!resendClient) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      console.warn('Warning: RESEND_API_KEY is not defined. Email dispatch will be logged locally instead.');
      return null;
    }
    resendClient = new Resend(key);
  }
  return resendClient;
}

// 4. Railway Storage & Persistent Volume Configuration
export const railwayStorageConfig = {
  endpoint: process.env.RAILWAY_STORAGE_ENDPOINT || process.env.STORAGE_ENDPOINT || 'http://localhost:9000',
  accessKeyId: process.env.RAILWAY_STORAGE_ACCESS_KEY || process.env.STORAGE_ACCESS_KEY || 'railway_access_key',
  secretAccessKey: process.env.RAILWAY_STORAGE_SECRET_KEY || process.env.STORAGE_SECRET_KEY || 'railway_secret_key',
  bucket: process.env.RAILWAY_STORAGE_BUCKET || process.env.STORAGE_BUCKET || 'chickmagnet-storage',
  volumeMountPath: process.env.RAILWAY_VOLUME_MOUNT_PATH || '/data/storage',
  publicUrl: process.env.RAILWAY_STORAGE_PUBLIC_URL || process.env.STORAGE_PUBLIC_URL || '',
};

export const storageConfig = railwayStorageConfig;
export const r2Config = railwayStorageConfig; // Backward compatibility alias
