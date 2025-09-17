import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient: ReturnType<typeof createClient> | null = null;

async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: REDIS_URL
    });

    redisClient.on('error', (err) => console.error('Redis Client Error:', err));
    await redisClient.connect();
    console.log('Redis client connected');
  }

  return redisClient;
}

export async function setVerificationCode(email: string, code: string) {
  const client = await getRedisClient();
  await client.set(`verification:${email}`, code, { EX: 600 });
}

export async function getVerificationCode(email: string): Promise<string | null> {
  const client = await getRedisClient();
  return await client.get(`verification:${email}`);
}

export async function deleteVerificationCode(email: string) {
  const client = await getRedisClient();
  await client.del(`verification:${email}`);
}

export interface VerificationRecord {
  code: string;
  expires: number;
}

export async function setVerificationCodeWithExpiry(email: string, verificationRecord: VerificationRecord) {
  const client = await getRedisClient();
  const ttl = Math.floor((verificationRecord.expires - Date.now()) / 1000);

  if (ttl <= 0) return;

  await client.set(
    `verification:${email}`,
    JSON.stringify(verificationRecord),
    { EX: ttl }
  );
}

export async function getVerificationRecordWithExpiry(email: string): Promise<VerificationRecord | null> {
  const client = await getRedisClient();
  const result = await client.get(`verification:${email}`);

  if (!result) return null;

  try {
    return JSON.parse(result) as VerificationRecord;
  } catch (e) {
    console.error('Failed to parse verification record:', e);
    return null;
  }
}

export async function canResendVerificationCode(email: string): Promise<boolean> {
  const record = await getVerificationRecordWithExpiry(email);
  if (!record) return true;
  return Date.now() >= record.expires - 9 * 60 * 1000;
}
