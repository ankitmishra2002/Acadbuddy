/**
 * Vercel/Linux is case-sensitive. If the repo has Landing.jsx but App imports landing.jsx,
 * the build fails. This script normalizes to lowercase filenames before vite build.
 * Safe on Windows (case-insensitive): skips when both paths are the same file.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pages = path.join(__dirname, 'src', 'pages');

function ensureLower(from, to) {
  const src = path.join(pages, from);
  const dst = path.join(pages, to);
  const srcExists = fs.existsSync(src);
  const dstExists = fs.existsSync(dst);

  if (srcExists && dstExists) {
    try {
      if (fs.realpathSync.native(src) === fs.realpathSync.native(dst)) {
        return;
      }
    } catch {
      // fall through
    }
    fs.unlinkSync(src);
    console.log(`[fix-pages-case] removed duplicate ${from} (keeping ${to})`);
    return;
  }

  if (!srcExists) {
    if (!dstExists) {
      console.warn(`[fix-pages-case] missing both ${from} and ${to}`);
    }
    return;
  }

  const tmp = path.join(pages, `._casefix_${Date.now()}.tmp`);
  fs.copyFileSync(src, tmp);
  fs.unlinkSync(src);
  fs.renameSync(tmp, dst);
  console.log(`[fix-pages-case] ${from} -> ${to}`);
}

ensureLower('Landing.jsx', 'landing.jsx');
ensureLower('Login.jsx', 'login.jsx');
