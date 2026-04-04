import sharp from 'sharp';
import { cloudinary, upload, getFileSizeLimit } from '../config/cloudinaryConfig.js';

// ─── Image compression helper ─────────────────────────────────────────────────
/**
 * Compress an image buffer using sharp before uploading to Cloudinary.
 * - Converts to WebP for smaller file size with high visual quality.
 * - Falls back gracefully on error (returns original buffer).
 */
async function compressImage(buffer, mimeType) {
  try {
    // SVGs are vector — no compression needed
    if (mimeType === 'image/svg+xml') return buffer;

    const compressed = await sharp(buffer)
      .rotate()            // Auto-rotate based on EXIF orientation
      .resize({
        width: 2048,       // Max width — larger images are downscaled
        height: 2048,
        fit: 'inside',     // Maintain aspect ratio, never upscale
        withoutEnlargement: true,
      })
      .webp({ quality: 82 }) // 82% quality — excellent visuals, ~40-60% smaller file
      .toBuffer();

    if (process.env.NODE_ENV === 'development') {
      const saved = (((buffer.length - compressed.length) / buffer.length) * 100).toFixed(1);
      console.log(`✓ Image compressed: ${buffer.length} → ${compressed.length} bytes (saved ${saved}%)`);
    }

    return compressed;
  } catch (err) {
    console.warn('⚠ Image compression skipped (using original):', err.message);
    return buffer; // Graceful fallback — never block the upload
  }
}

// ─── Upload stream helper ─────────────────────────────────────────────────────
/**
 * Wraps cloudinary.uploader.upload_stream into a Promise.
 */
function streamUpload(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    stream.end(buffer);
  });
}

// ─── Determine resource type ──────────────────────────────────────────────────
function getResourceType(mimeType) {
  if (mimeType === 'application/pdf')     return 'raw';
  if (mimeType.startsWith('image/'))      return 'image';
  if (mimeType.startsWith('video/'))      return 'video';
  if (mimeType.startsWith('audio/'))      return 'video'; // Cloudinary uses 'video' for audio
  return 'raw'; // documents
}

// ─── Per-type size validation ──────────────────────────────────────────────────
function validateFileSize(file, res) {
  const limit = getFileSizeLimit(file.mimetype);
  if (file.size > limit) {
    const limitMB = (limit / 1024 / 1024).toFixed(0);
    const fileMB  = (file.size / 1024 / 1024).toFixed(2);
    res.status(413).json({
      error: 'File too large',
      message: `"${file.originalname}" is ${fileMB} MB. The limit for this file type is ${limitMB} MB.`,
    });
    return false;
  }
  return true;
}

/**
 * Upload a single file to Cloudinary
 * Route: POST /api/cloudinary/upload
 * Body: multipart/form-data with 'file' field
 */
export const uploadFromBrowser = async (req, res) => {
  try {
    // ── Cloudinary config check ──────────────────────────────────────────────
    if (!cloudinary.config().cloud_name || !cloudinary.config().api_key) {
      return res.status(500).json({
        error: 'Cloudinary not configured',
        message: 'Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file',
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const file = req.file;

    // ── Per-type size validation ─────────────────────────────────────────────
    if (!validateFileSize(file, res)) return;

    const tags         = req.body.tags ? req.body.tags.split(',') : [];
    const resourceType = getResourceType(file.mimetype);

    // ── Image compression ────────────────────────────────────────────────────
    let buffer = file.buffer;
    let uploadMimeType = file.mimetype;
    if (file.mimetype.startsWith('image/') && file.mimetype !== 'image/svg+xml') {
      buffer = await compressImage(file.buffer, file.mimetype);
      uploadMimeType = 'image/webp'; // sharp outputs webp
    }

    // ── Build Cloudinary upload options ──────────────────────────────────────
    const uploadOptions = {
      resource_type: resourceType,
      folder: 'academic-help-buddy',
      tags,
      use_filename: true,
      unique_filename: true,
      // ── Delivery optimizations ────────────────────────────────────────────
      // Cloudinary auto-picks the best quality and format per client/device
      quality: 'auto',
      fetch_format: 'auto',
    };

    if (resourceType === 'raw') {
      // PDFs / documents — ensure public access
      uploadOptions.access_mode = 'public';
      if (file.mimetype === 'application/pdf') uploadOptions.format = 'pdf';
    }

    if (resourceType === 'video') {
      uploadOptions.access_mode = 'public';
    }

    // ── Upload ───────────────────────────────────────────────────────────────
    const result = await streamUpload(buffer, uploadOptions);

    if (process.env.NODE_ENV === 'development') {
      console.log('✓ File uploaded successfully to Cloudinary');
      console.log('  Resource type:', resourceType, '| Format:', result.format);
    }

    return res.status(200).json({
      url:           result.secure_url,
      public_id:     result.public_id,
      format:        result.format,
      resource_type: result.resource_type,
      width:         result.width,
      height:        result.height,
      bytes:         result.bytes,
      created_at:    result.created_at,
      mime_type:     uploadMimeType,
    });
  } catch (error) {
    console.error('Error in uploadFromBrowser:', error);
    return res.status(500).json({ error: 'Failed to upload file', message: error.message });
  }
};

/**
 * Upload multiple files to Cloudinary
 * Route: POST /api/cloudinary/upload-multiple
 * Body: multipart/form-data with 'files' field (array)
 */
export const uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const tags = req.body.tags ? req.body.tags.split(',') : [];

    // ── Validate sizes before starting any uploads ────────────────────────────
    for (const file of req.files) {
      if (!validateFileSize(file, res)) return;
    }

    const uploadPromises = req.files.map(async (file) => {
      const resourceType = getResourceType(file.mimetype);

      // Compress images
      let buffer = file.buffer;
      if (file.mimetype.startsWith('image/') && file.mimetype !== 'image/svg+xml') {
        buffer = await compressImage(file.buffer, file.mimetype);
      }

      const result = await streamUpload(buffer, {
        resource_type: resourceType,
        folder: 'academic-help-buddy',
        tags,
        use_filename: true,
        unique_filename: true,
        quality: 'auto',
        fetch_format: 'auto',
        ...(resourceType === 'raw' && { access_mode: 'public' }),
        ...(resourceType === 'video' && { access_mode: 'public' }),
      });

      return {
        url:               result.secure_url,
        public_id:         result.public_id,
        format:            result.format,
        resource_type:     result.resource_type,
        width:             result.width,
        height:            result.height,
        bytes:             result.bytes,
        created_at:        result.created_at,
        original_filename: file.originalname,
      };
    });

    const results = await Promise.all(uploadPromises);
    return res.status(200).json({ files: results });
  } catch (error) {
    console.error('Error in uploadMultiple:', error);
    return res.status(500).json({ error: 'Failed to upload files', message: error.message });
  }
};

/**
 * Delete a file from Cloudinary
 * Route: DELETE /api/cloudinary/delete/:public_id
 */
export const deleteFile = async (req, res) => {
  try {
    const { public_id } = req.params;

    if (!public_id) {
      return res.status(400).json({ error: 'public_id is required' });
    }

    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: 'auto',
    });

    if (result.result === 'ok') {
      return res.status(200).json({ message: 'File deleted successfully', result });
    } else {
      return res.status(404).json({ error: 'File not found', result });
    }
  } catch (error) {
    console.error('Error in deleteFile:', error);
    return res.status(500).json({ error: 'Failed to delete file', message: error.message });
  }
};

/**
 * Get Cloudinary configuration status
 * Route: GET /api/cloudinary/config
 */
export const getConfig = async (req, res) => {
  try {
    const isConfigured = !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );

    return res.status(200).json({
      configured:     isConfigured,
      cloud_name:     isConfigured ? process.env.CLOUDINARY_CLOUD_NAME : null,
      has_api_key:    !!process.env.CLOUDINARY_API_KEY,
      has_api_secret: !!process.env.CLOUDINARY_API_SECRET,
    });
  } catch (error) {
    console.error('Error in getConfig:', error);
    return res.status(500).json({ error: 'Failed to get configuration', message: error.message });
  }
};

// Export multer middleware for use in routes
export { upload };
