/**
 * Extract a direct HTTP(S) file URL from a Context document (Cloudinary or plain URL).
 */
export function getContextFileUrl(context) {
  if (!context) return null;
  if (context.fileUrl && String(context.fileUrl).trim().startsWith('http')) {
    return String(context.fileUrl).trim();
  }
  if (context.content && String(context.content).trim().startsWith('http')) {
    return String(context.content).trim().split(/\s/)[0];
  }
  if (context.content && context.content.includes('[Cloudinary File]')) {
    const m = context.content.match(/URL:\s*(https?:\/\/[^\s\n]+)/);
    if (m) return m[1].trim();
  }
  return null;
}

export function isCloudinaryDeliveryUrl(url) {
  return typeof url === 'string' && url.includes('res.cloudinary.com');
}

/**
 * Insert a Cloudinary delivery flag after the `upload` segment (e.g. fl_inline, fl_attachment).
 */
function insertCloudinaryDeliveryFlag(url, flag) {
  if (typeof url !== 'string' || !isCloudinaryDeliveryUrl(url)) return url;
  if (url.includes(`/${flag}/`) || url.includes(`,${flag}`)) return url;
  try {
    const u = new URL(url);
    const segs = u.pathname.split('/').filter(Boolean);
    const uploadIdx = segs.indexOf('upload');
    if (uploadIdx === -1) return url;
    if (segs[uploadIdx + 1] === flag) return url;
    const next = [...segs.slice(0, uploadIdx + 1), flag, ...segs.slice(uploadIdx + 1)];
    u.pathname = `/${next.join('/')}`;
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * Raw PDFs often default to attachment delivery; fl_inline helps the browser open them in a tab.
 */
export function cloudinaryInlineViewUrl(url) {
  return insertCloudinaryDeliveryFlag(url, 'fl_inline');
}

/**
 * fl_attachment encourages download instead of inline preview.
 */
export function cloudinaryForceDownloadUrl(url) {
  return insertCloudinaryDeliveryFlag(url, 'fl_attachment');
}

/** True if this Cloudinary URL points at a raw (non-image) asset, e.g. PDF uploads. */
export function isCloudinaryRawUploadUrl(url) {
  return typeof url === 'string' && url.includes('/raw/upload/');
}
