import express from 'express';
import crypto from 'crypto';

const router = express.Router();

router.get('/auth', (req, res) => {
  try {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;

    if (!privateKey || !publicKey) {
      return res.status(500).json({
        success: false,
        message: 'ImageKit credentials not configured on server'
      });
    }

    const token = crypto.randomBytes(16).toString('hex');
    const expire = Math.floor(Date.now() / 1000) + 3600;
    const signature = crypto.createHmac('sha1', privateKey).update(token + expire).digest('hex');

    res.json({
      success: true,
      token,
      expire,
      signature,
      publicKey
    });

  } catch (error) {
    console.error('ImageKit auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate authentication parameters'
    });
  }
});

export default router;
