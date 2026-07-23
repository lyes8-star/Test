import { lookup } from "dns/promises";
import { isIP } from "net";
import { z } from "zod";

const urlSchema = z
  .string()
  .trim()
  .url()
  .refine((u) => /^https?:\/\//i.test(u), "URL http(s) requise");

function isPrivateIp(ip: string) {
  if (ip === "127.0.0.1" || ip === "::1" || ip === "0.0.0.0") return true;
  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("192.168.")) return true;
  if (ip.startsWith("169.254.")) return true;
  const m = ip.match(/^172\.(\d+)\./);
  if (m) {
    const n = Number(m[1]);
    if (n >= 16 && n <= 31) return true;
  }
  if (ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80")) return true;
  return false;
}

export async function assertPublicHttpUrl(raw: string): Promise<URL> {
  const parsed = urlSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("URL invalide");
  }
  const url = new URL(parsed.data);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Protocole non autorisé");
  }
  const host = url.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host === "metadata.google.internal"
  ) {
    throw new Error("Hôte non autorisé");
  }

  const ips: string[] = [];
  if (isIP(host)) {
    ips.push(host);
  } else {
    try {
      const v4 = await lookup(host, { all: true, family: 4 });
      ips.push(...v4.map((r) => r.address));
    } catch {
      /* ignore */
    }
    try {
      const v6 = await lookup(host, { all: true, family: 6 });
      ips.push(...v6.map((r) => r.address));
    } catch {
      /* ignore */
    }
  }

  if (!ips.length) {
    throw new Error("Impossible de résoudre l’hôte");
  }
  if (ips.some(isPrivateIp)) {
    throw new Error("Adresse réseau privée interdite (anti-SSRF)");
  }

  return url;
}
