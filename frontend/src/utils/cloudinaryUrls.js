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
 * Insert Cloudinary fl_attachment so browsers are more likely to download instead of inline-display.
 * @see https://cloudinary.com/documentation/image_transformations#delivery_types
 */
export function cloudinaryForceDownloadUrl(url) {
  if (typeof url !== 'string' || !isCloudinaryDeliveryUrl(url)) return url;
  if (url.includes('/fl_attachment/') || url.includes(',fl_attachment')) return url;
  try {
    const u = new URL(url);
    const segs = u.pathname.split('/').filter(Boolean);
    const uploadIdx = segs.indexOf('upload');
    if (uploadIdx === -1) return url;
    const next = [...segs.slice(0, uploadIdx + 1), 'fl_attachment', ...segs.slice(uploadIdx + 1)];
    u.pathname = `/${next.join('/')}`;
    return u.toString();
  } catch {
    return url;
  }
}
