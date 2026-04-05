/**
 * Chrome (and others) only show the built-in PDF viewer for blob: URLs when the Blob
 * type is application/pdf. Cloudinary raw assets often come back as octet-stream.
 */
export async function coerceBlobForPdfViewer(blob, contentTypeHeader, fileUrl = '') {
  const headerCt = (contentTypeHeader || '').toLowerCase();
  const blobCt = (blob.type || '').toLowerCase();
  if (headerCt.includes('application/pdf') || blobCt.includes('application/pdf')) {
    return blob;
  }

  const buf = await blob.arrayBuffer();
  const url = String(fileUrl || '');

  const isPdfMagic =
    buf.byteLength >= 4 &&
    buf[0] === 0x25 &&
    buf[1] === 0x50 &&
    buf[2] === 0x44 &&
    buf[3] === 0x46; /* %PDF */

  const urlLooksPdf = /\.pdf($|[?#])/i.test(url);

  if (isPdfMagic || urlLooksPdf) {
    return new Blob([buf], { type: 'application/pdf' });
  }

  const ct = headerCt || blobCt || 'application/octet-stream';
  return new Blob([buf], { type: ct });
}
