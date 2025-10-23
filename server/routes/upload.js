import express from 'express';
import multer from 'multer';
import ImageKit from 'imagekit';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'), false);
    }
  }
});

router.post('/image', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const result = await imagekit.upload({
      file: req.file.buffer.toString('base64'),
      fileName: req.file.originalname,
      folder: '/quiz-app/images'
    });

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.url,
        fileId: result.fileId,
        thumbnail: result.thumbnailUrl
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


  });
});

router.post('/video', authenticateToken, requireAdmin, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided'
      });
    }

    const result = await imagekit.upload({
      file: req.file.buffer.toString('base64'),
      fileName: req.file.originalname,
      folder: '/quiz-app/videos'
    });

    res.json({
      success: true,
      message: 'Video uploaded successfully',
      data: {
        url: result.url,
        fileId: result.fileId,
        thumbnail: result.thumbnailUrl
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


  });
});

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
  });
});

router.get('/list', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { limit = 50, skip = 0 } = req.query;

    const result = await imagekit.listFiles({
      skip: parseInt(skip),
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      message: 'Files retrieved successfully',
      data: {
        files: result.map(file => ({
          fileId: file.fileId,
          name: file.name,
          url: file.url,
          thumbnail: file.thumbnail,
          fileType: file.fileType,
          size: file.size,
          createdAt: file.createdAt
        })),
        totalCount: result.length
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


});
});

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