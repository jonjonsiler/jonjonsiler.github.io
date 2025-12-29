import fs from "node:fs";

fs.mkdirSync("dist/etsy", { recursive: true });
fs.copyFileSync("src/data/mock-etsy.json", "dist/etsy/mock-etsy.json");