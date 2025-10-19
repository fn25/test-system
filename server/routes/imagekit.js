import express from 'express';
import crypto from 'crypto';

const router = express.Router();

/**
 * ImageKit Authentication Endpoint
 * Generates authentication parameters for client-side uploads
 * 
 * Required Environment Variables:
 * - IMAGEKIT_PRIVATE_KEY: Your ImageKit private key
 * - IMAGEKIT_PUBLIC_KEY: Your ImageKit public key
 * - IMAGEKIT_URL_ENDPOINT: Your ImageKit URL endpoint
 * 
 * Get these from: https://imagekit.io/dashboard/developer/api-keys
 */

// @route   GET /api/imagekit/auth
// @desc    Get ImageKit authentication parameters
// @access  Public (but should be rate-limited in production)
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

    // Generate authentication parameters
    const token = crypto.randomBytes(16).toString('hex');
    const expire = Math.floor(Date.now() / 1000) + 3600; // Expires in 1 hour
    
    // Create signature
    const signature = crypto
      .createHmac('sha1', privateKey)
      .update(token + expire)
      .digest('hex');

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
