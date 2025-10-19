import express from 'express';
import multer from 'multer';
import ImageKit from 'imagekit';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Configure ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'), false);
    }
  }
});

/**
 * POST /api/upload/image
 * Upload image to ImageKit (Admin only)
 */
router.post('/image', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const result = await imagekit.upload({
      file: req.file.buffer.toString('base64'), // Convert file to Base64
      fileName: req.file.originalname
    });

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.url,
        fileId: result.fileId
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Upload failed'
    });
  }
});

/**
 * POST /api/upload/video
 * Upload video to ImageKit (Admin only)
 */
router.post('/video', authenticateToken, requireAdmin, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided'
      });
    }

    const result = await imagekit.upload({
      file: req.file.buffer.toString('base64'), // Convert file to Base64
      fileName: req.file.originalname
    });

    res.json({
      success: true,
      message: 'Video uploaded successfully',
      data: {
        url: result.url,
        fileId: result.fileId
      }
    });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload video',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Upload failed'
    });
  }
});

/**
 * DELETE /api/upload/:fileId
 * Delete file from ImageKit (Admin only)
 */
router.delete('/:fileId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: 'File ID is required'
      });
    }

    await imagekit.deleteFile(fileId);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('File delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Delete failed'
    });
  }
});

/**
 * GET /api/upload/list
 * List uploaded files (Admin only)
 */
router.get('/list', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      resource_type = 'image',
      max_results = 50,
      next_cursor 
    } = req.query;

    const options = {
      resource_type,
      type: 'upload',
      prefix: 'quiz-app/',
      max_results: parseInt(max_results)
    };

    if (next_cursor) {
      options.next_cursor = next_cursor;
    }

    const result = await cloudinary.search
      .expression(`folder:quiz-app/${resource_type === 'video' ? 'videos' : 'images'}`)
      .sort_by([['created_at', 'desc']])
      .max_results(parseInt(max_results))
      .execute();

    res.json({
      success: true,
      message: 'Files retrieved successfully',
      data: {
        resources: result.resources.map(resource => ({
          publicId: resource.public_id,
          url: resource.secure_url,
          format: resource.format,
          width: resource.width,
          height: resource.height,
          bytes: resource.bytes,
          createdAt: resource.created_at,
          resourceType: resource.resource_type
        })),
        totalCount: result.total_count,
        hasMore: !!result.next_cursor,
        nextCursor: result.next_cursor
      }
    });
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list files',
      error: process.env.NODE_ENV === 'development' ? error.message : 'List failed'
    });
  }
});

/**
 * Error handling middleware for multer
 */
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
  }
  
  if (error.message === 'Only image and video files are allowed') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
});

export default router;