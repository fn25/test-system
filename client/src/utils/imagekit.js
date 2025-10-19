/**
 * ImageKit Utility Functions
 * Handles image and video uploads to ImageKit
 */

// Note: For production, you'll need to install: npm install imagekit-javascript
// For now, we'll create the structure with fallback to direct URL input

/**
 * Upload file to ImageKit
 * @param {File} file - The file to upload
 * @param {string} folder - Folder path in ImageKit (e.g., 'quiz-images')
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<string>} - The uploaded file URL
 */
export const uploadToImageKit = async (file, folder = 'quiz-media', onProgress = null) => {
  try {
    // Check if ImageKit is configured
    const publicKey = process.env.REACT_APP_IMAGEKIT_PUBLIC_KEY;
    const urlEndpoint = process.env.REACT_APP_IMAGEKIT_URL_ENDPOINT;
    const authEndpoint = process.env.REACT_APP_IMAGEKIT_AUTH_ENDPOINT;

    if (!publicKey || !urlEndpoint || !authEndpoint || publicKey === 'your_public_key_here') {
      throw new Error('ImageKit not configured. Please add ImageKit credentials to .env file');
    }

    // Get authentication parameters from backend
    const authResponse = await fetch(authEndpoint);
    if (!authResponse.ok) {
      throw new Error('Failed to get authentication parameters');
    }
    const authParams = await authResponse.json();

    // Prepare form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('publicKey', publicKey);
    formData.append('signature', authParams.signature);
    formData.append('expire', authParams.expire);
    formData.append('token', authParams.token);
    formData.append('fileName', file.name);
    formData.append('folder', folder);

    // Upload using XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentCompleted = Math.round((event.loaded * 100) / event.total);
            onProgress(percentCompleted);
          }
        });
      }

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            resolve(result.url);
          } catch (error) {
            reject(new Error('Failed to parse upload response'));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'));
      });

      // Send request
      xhr.open('POST', `https://upload.imagekit.io/api/v1/files/upload`);
      xhr.send(formData);
    });

  } catch (error) {
    console.error('ImageKit upload error:', error);
    throw error;
  }
};

/**
 * Validate file type
 * @param {File} file - The file to validate
 * @param {string} type - 'image' or 'video'
 * @returns {boolean}
 */
export const validateFileType = (file, type = 'image') => {
  if (type === 'image') {
    return file.type.startsWith('image/');
  } else if (type === 'video') {
    return file.type.startsWith('video/');
  }
  return false;
};

/**
 * Validate file size (max 10MB for images, 50MB for videos)
 * @param {File} file - The file to validate
 * @param {string} type - 'image' or 'video'
 * @returns {boolean}
 */
export const validateFileSize = (file, type = 'image') => {
  const maxSize = type === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024; // 10MB or 50MB
  return file.size <= maxSize;
};

/**
 * Get file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string}
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Extract YouTube video ID from URL
 * @param {string} url - YouTube URL
 * @returns {string|null} - Video ID or null
 */
export const extractYouTubeId = (url) => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
};

/**
 * Check if URL is a valid YouTube URL
 * @param {string} url - URL to check
 * @returns {boolean}
 */
export const isYouTubeUrl = (url) => {
  return url.includes('youtube.com') || url.includes('youtu.be');
};

/**
 * Check if URL is a valid image URL
 * @param {string} url - URL to check
 * @returns {boolean}
 */
export const isImageUrl = (url) => {
  return /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(url);
};

/**
 * Check if URL is a valid video URL
 * @param {string} url - URL to check
 * @returns {boolean}
 */
export const isVideoUrl = (url) => {
  return /\.(mp4|webm|ogg|mov|avi)$/i.test(url) || isYouTubeUrl(url);
};
