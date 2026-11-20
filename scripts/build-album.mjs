// Builds the photo album the app uses.
//
// Originals go in public/images/album/women/. This script writes small
// web copies (800px wide WebP) to public/images/album-web/ and records them in
// lib/album.generated.json. Originals are never modified.
//
// Runs automatically before `npm run dev` and `npm run build` (so Vercel builds
// it too). Run manually with `npm run album` after adding photos.
import { promises as fs } from "fs";
import path from "path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "public", "images", "album");
const WEB = path.join(ROOT, "public", "images", "album-web");
const OUT = path.join(ROOT, "lib", "album.generated.json");
const IMAGE = /\.(jpe?g|png|webp|avif|gif|tiff?)$/i;
const WIDTH = 800;

let sharp = null;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.warn("[album] sharp not available; using original files (they may be large)");
}

const mtime = (p) => fs.stat(p).then((s) => s.mtimeMs, () => 0);

async function build(dir) {
  let files = [];
  try {
    files = (await fs.readdir(path.join(SRC, dir))).filter((f) => IMAGE.test(f));
  } catch {
    return [];
  }
  files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  await fs.mkdir(path.join(WEB, dir), { recursive: true });

  const out = [];
  for (const file of files) {
    const src = path.join(SRC, dir, file);
    if (!sharp) {
      out.push(`/images/album/${dir}/${file}`);
      continue;
    }
    const name = file.replace(/\.[^.]+$/, ".webp");
    const dest = path.join(WEB, dir, name);
    try {
      if ((await mtime(dest)) < (await mtime(src))) {
        await sharp(src).rotate().resize({ width: WIDTH, withoutEnlargement: true }).webp({ quality: 78 }).toFile(dest);
      }
      out.push(`/images/album-web/${dir}/${name}`);
    } catch (err) {
      console.warn(`[album] couldn't convert ${dir}/${file}: ${err.message}; using original`);
      out.push(`/images/album/${dir}/${file}`);
    }
  }

  // Remove web copies whose original was deleted.
  const wanted = new Set(out.map((p) => path.basename(p)));
  for (const f of await fs.readdir(path.join(WEB, dir))) {
    if (!wanted.has(f)) await fs.rm(path.join(WEB, dir, f));
  }
  return out;
}

const album = { women: await build("women") };
await fs.writeFile(OUT, JSON.stringify(album, null, 2) + "\n");
console.log(`[album] ${album.women.length} photo(s)`);
