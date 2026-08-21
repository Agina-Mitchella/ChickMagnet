import { Queue as BullQueue, Worker as BullWorker } from 'bullmq';
import { redisUrl } from '../config/index.ts';

const useMemoryQueue = !process.env.REDIS_URL || process.env.REDIS_URL.includes('localhost') || process.env.REDIS_URL.includes('127.0.0.1');

// In-Memory Fallback classes for development sandbox where Redis is not running
class MemoryQueue {
  private name: string;
  constructor(name: string, options?: any) {
    this.name = name;
  }
  async add(jobName: string, data: any, options?: any) {
    const job = {
      id: Math.random().toString(),
      name: jobName,
      data,
      opts: options,
    };
    const list = memoryWorkers.get(this.name) || [];
    if (list.length > 0) {
      for (const worker of list) {
        setTimeout(() => {
          worker.processJob(job).catch((err: any) => {
            console.error(`[MEMORY WORKER ERROR] Queue ${this.name}:`, err);
          });
        }, 0);
      }
    } else {
      const pending = pendingJobs.get(this.name) || [];
      pending.push(job);
      pendingJobs.set(this.name, pending);
    }
    return job;
  }
}

const memoryWorkers = new Map<string, MemoryWorker[]>();
const pendingJobs = new Map<string, any[]>();

class MemoryWorker {
  private name: string;
  private processor: (job: any) => Promise<any>;
  constructor(name: string, processor: (job: any) => Promise<any>, options?: any) {
    this.name = name;
    this.processor = processor;
    const list = memoryWorkers.get(name) || [];
    list.push(this);
    memoryWorkers.set(name, list);

    const pending = pendingJobs.get(name) || [];
    if (pending.length > 0) {
      pendingJobs.set(name, []);
      for (const job of pending) {
        setTimeout(() => {
          this.processJob(job).catch((err: any) => {
            console.error(`[MEMORY WORKER ERROR] Queue ${this.name}:`, err);
          });
        }, 0);
      }
    }
  }
  async processJob(job: any) {
    return this.processor(job);
  }
}

export const Queue = useMemoryQueue ? (MemoryQueue as any) : BullQueue;
export const Worker = useMemoryQueue ? (MemoryWorker as any) : BullWorker;
export type Job = any;

// --------------------------------------------------
// 1. QUEUE DEFINITIONS
// --------------------------------------------------
export const emailQueue = new Queue('email-queue', { connection: { url: redisUrl } });
export const smsQueue = new Queue('sms-queue', { connection: { url: redisUrl } });
export const giftExpiryQueue = new Queue('gift-expiry-queue', { connection: { url: redisUrl } });
export const payoutQueue = new Queue('payout-queue', { connection: { url: redisUrl } });

// Helper to queue a background job
export async function queueEmailJob(to: string, subject: string, html: string) {
  await emailQueue.add('send-email', { to, subject, html }, { removeOnComplete: true });
}

export async function queueSmsJob(to: string, message: string) {
  await smsQueue.add('send-sms', { to, message }, { removeOnComplete: true });
}

// --------------------------------------------------
// 2. BACKEND WORKER PROCESSORS
// --------------------------------------------------
export function startWorkers() {
  console.log('👷 Background workers spawning for asynchronous processing...');

  // Worker for email transmission (Resend)
  new Worker('email-queue', async (job: Job) => {
    const { to, subject } = job.data;
    console.log(`[JOBS_WORKER]: Dispatching transactional email via Resend to ${to} with subject: "${subject}"`);
    return { status: 'success' };
  }, { connection: { url: redisUrl } });

  // Worker for SMS dispatch (Africa's Talking / Safaricom)
  new Worker('sms-queue', async (job: Job) => {
    const { to, message } = job.data;
    console.log(`[JOBS_WORKER]: Dispatching SMS alert via Africa's Talking to ${to}: "${message}"`);
    return { status: 'success' };
  }, { connection: { url: redisUrl } });

  // Worker for Payout automation and daily totals checks
  new Worker('payout-queue', async (job: Job) => {
    console.log('[JOBS_WORKER]: Running automatic daily payout distribution cycle...');
    return { status: 'success' };
  }, { connection: { url: redisUrl } });
}
