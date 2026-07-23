import { createHash, randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { auditProduct } from "@/lib/site";

export type AccessTokenRecord = {
  tokenHash: string;
  stripeSessionId?: string;
  targetUrl?: string;
  scansRemaining: number;
  createdAt: string;
  expiresAt: string;
  email?: string;
};

const DATA_DIR = path.join(process.cwd(), ".data", "audit-tokens");

function hashToken(token: string) {
  const secret = process.env.AUDIT_TOKEN_SECRET || "meridian-dev-secret";
  return createHash("sha256").update(`${secret}:${token}`).digest("hex");
}

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function fileFor(hash: string) {
  return path.join(DATA_DIR, `${hash}.json`);
}

export async function createAccessToken(opts: {
  stripeSessionId?: string;
  targetUrl?: string;
  email?: string;
}): Promise<{ token: string; record: AccessTokenRecord }> {
  await ensureDir();
  const token = randomBytes(24).toString("base64url");
  const tokenHash = hashToken(token);
  const now = Date.now();
  const record: AccessTokenRecord = {
    tokenHash,
    stripeSessionId: opts.stripeSessionId,
    targetUrl: opts.targetUrl,
    scansRemaining: auditProduct.scansIncluded,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + auditProduct.validityDays * 24 * 60 * 60 * 1000).toISOString(),
    email: opts.email,
  };
  await fs.writeFile(fileFor(tokenHash), JSON.stringify(record, null, 2), "utf8");
  return { token, record };
}

export async function getAccessToken(token: string): Promise<AccessTokenRecord | null> {
  await ensureDir();
  const tokenHash = hashToken(token);
  try {
    const raw = await fs.readFile(fileFor(tokenHash), "utf8");
    const record = JSON.parse(raw) as AccessTokenRecord;
    if (new Date(record.expiresAt).getTime() < Date.now()) return null;
    return record;
  } catch {
    return null;
  }
}

export async function consumeScan(token: string): Promise<AccessTokenRecord | null> {
  const record = await getAccessToken(token);
  if (!record || record.scansRemaining <= 0) return null;
  record.scansRemaining -= 1;
  await fs.writeFile(fileFor(record.tokenHash), JSON.stringify(record, null, 2), "utf8");
  return record;
}

export const AUDIT_COOKIE = "meridian_audit_token";
