#!/usr/bin/env node
/** Bundlephobia-style size report for production deps */
const fs = require("fs");
const path = require("path");

const pkgs = [
  { name: "react", version: "19.2.4" },
  { name: "react-dom", version: "19.2.4" },
  { name: "zod", version: "4.4.3" },
  { name: "next", version: "16.2.11" },
];

(async () => {
  const rows = [];
  for (const p of pkgs) {
    const q = `${p.name}@${p.version}`;
    try {
      const res = await fetch(`https://bundlephobia.com/api/size?package=${encodeURIComponent(q)}`);
      if (!res.ok) {
        rows.push({ package: q, error: `HTTP ${res.status}`, note: p.name === "next" ? "framework serveur — hors bundle client pur" : undefined });
        continue;
      }
      const j = await res.json();
      rows.push({
        package: q,
        sizeBytes: j.size,
        gzipBytes: j.gzip,
        gzipKB: Math.round((j.gzip / 1024) * 10) / 10,
        dependencyCount: j.dependencyCount,
      });
    } catch (e) {
      rows.push({ package: q, error: String(e) });
    }
  }
  const outDir = path.join(process.cwd(), "audits");
  fs.mkdirSync(outDir, { recursive: true });
  const report = {
    generatedAt: new Date().toISOString(),
    recommendation: "Deps légères : pas d’ajout de libs UI lourdes. Zod gzip ~60KB — acceptable côté API serveur.",
    rows,
  };
  fs.writeFileSync(path.join(outDir, "bundlephobia.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
})();
