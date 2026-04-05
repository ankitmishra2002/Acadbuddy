import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

// Configure Cloudinary from environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Cloudinary configuration loaded and initialized successfully');

// ─── File size limits per type (in bytes) ─────────────────────────────────────
const FILE_SIZE_LIMITS = {
    image: 5 * 1024 * 1024,  //  5 MB  — jpg, png, gif, webp, svg
    pdf: 10 * 1024 * 1024,  // 10 MB  — pdf (keeps uploads reliable; aligns with free-tier friendly limits)
    video: 100 * 1024 * 1024, // 100 MB — mp4, mov, avi, mkv, webm
    audio: 25 * 1024 * 1024,  // 25 MB  — mp3, wav, ogg, aac, flac
    doc: 10 * 1024 * 1024,  // 10 MB  — docx, pptx, xlsx, txt, csv
};

// Maximum overall fallback for unknown types
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

// ─── Allowed MIME types ────────────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = new Set([
    // Images
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    // PDF
    'application/pdf',
    // Video
    'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm',
    // Audio
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac', 'audio/x-flac',
    // Documents
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv',
]);

/**
 * Resolve which size-limit bucket a MIME type falls into.
 * Returns the limit in bytes.
 */
export function getFileSizeLimit(mimeType) {
    if (mimeType.startsWith('image/')) return FILE_SIZE_LIMITS.image;
    if (mimeType === 'application/pdf') return FILE_SIZE_LIMITS.pdf;
    if (mimeType.startsWith('video/')) return FILE_SIZE_LIMITS.video;
    if (mimeType.startsWith('audio/')) return FILE_SIZE_LIMITS.audio;
    return FILE_SIZE_LIMITS.doc;
}

/**
 * Custom multer fileFilter:
 *  1. Reject disallowed MIME types immediately.
 *  2. Attach the per-type size limit to req so we can validate after upload.
 */
function fileFilter(req, file, cb) {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        return cb(
            new multer.MulterError(
                'LIMIT_UNEXPECTED_FILE',
                `File type "${file.mimetype}" is not allowed.`
            ),
            false
        );
    }
    // Attach the per-type limit so the controller can do a secondary check
    req._fileSizeLimit = getFileSizeLimit(file.mimetype);
    cb(null, true);
}

// Multer instance
// The hard limit is set to the largest allowed type (video: 100 MB).
// A secondary per-type check is performed in the controller.
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter,
});

export { cloudinary, upload, FILE_SIZE_LIMITS };
