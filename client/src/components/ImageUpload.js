import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Link2, Eye, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  uploadToImageKit, 
  validateFileType, 
  validateFileSize,
  isImageUrl
} from '../utils/imagekit';

/**
 * ImageUpload Component
 * Supports both URL input and file upload
 */
const ImageUpload = ({ value, onChange, label = "Image", type = "image" }) => {
  const [uploadMode, setUploadMode] = useState('url'); // 'url' or 'upload'
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(value || '');
  const fileInputRef = useRef(null);

  // Handle URL input change
  const handleUrlChange = (e) => {
    const url = e.target.value;
    setPreviewUrl(url);
    onChange(url);
  };

  // Handle file selection
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!validateFileType(file, type)) {
      toast.error(`Please select a valid ${type} file`);
      return;
    }

    // Validate file size
    if (!validateFileSize(file, type)) {
      const maxSize = type === 'image' ? '10MB' : '50MB';
      toast.error(`File size must be less than ${maxSize}`);
      return;
    }

    // Upload file
    setUploading(true);
    setUploadProgress(0);

    try {
      const url = await uploadToImageKit(file, `quiz-${type}s`, (progress) => {
        setUploadProgress(progress);
      });

      setPreviewUrl(url);
      onChange(url);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!`);
    } catch (error) {
      console.error('Upload error:', error);
      
      // Fallback: Create local preview URL
      if (error.message.includes('not configured')) {
        toast.error('ImageKit not configured. Using local preview only.');
        const localUrl = URL.createObjectURL(file);
        setPreviewUrl(localUrl);
        onChange(''); // Don't save local URL
      } else {
        toast.error('Failed to upload file. Please try URL input instead.');
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Clear preview
  const clearPreview = () => {
    setPreviewUrl('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ImageIcon size={16} />
        {label}
        <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 'normal' }}>
          (optional)
        </span>
      </label>

      {/* Upload Mode Toggle */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '0.75rem',
        background: '#f3f4f6',
        padding: '0.25rem',
        borderRadius: '8px',
        width: 'fit-content'
      }}>
        <button
          type="button"
          onClick={() => setUploadMode('url')}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '6px',
            background: uploadMode === 'url' ? 'white' : 'transparent',
            color: uploadMode === 'url' ? '#667eea' : '#6b7280',
            cursor: 'pointer',
            fontWeight: uploadMode === 'url' ? '600' : '400',
            boxShadow: uploadMode === 'url' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          <Link2 size={16} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
          URL
        </button>
        <button
          type="button"
          onClick={() => setUploadMode('upload')}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '6px',
            background: uploadMode === 'upload' ? 'white' : 'transparent',
            color: uploadMode === 'upload' ? '#667eea' : '#6b7280',
            cursor: 'pointer',
            fontWeight: uploadMode === 'upload' ? '600' : '400',
            boxShadow: uploadMode === 'upload' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          <Upload size={16} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
          Upload
        </button>
      </div>

      {/* URL Input Mode */}
      {uploadMode === 'url' && (
        <div>
          <input
            type="url"
            className="form-control"
            placeholder={`Enter ${type} URL (e.g., https://example.com/${type}.jpg)`}
            value={previewUrl}
            onChange={handleUrlChange}
          />
          {previewUrl && (
            <button
              type="button"
              onClick={clearPreview}
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem 1rem',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <X size={16} />
              Clear
            </button>
          )}
        </div>
      )}

      {/* Upload Mode */}
      {uploadMode === 'upload' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={type === 'image' ? 'image/*' : 'video/*'}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            disabled={uploading}
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{
              width: '100%',
              padding: '1rem',
              border: '2px dashed #cbd5e1',
              borderRadius: '8px',
              background: uploading ? '#f3f4f6' : 'white',
              cursor: uploading ? 'not-allowed' : 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!uploading) {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.background = '#f0f4ff';
              }
            }}
            onMouseLeave={(e) => {
              if (!uploading) {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.background = 'white';
              }
            }}
          >
            {uploading ? (
              <>
                <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Uploading... {uploadProgress}%</span>
              </>
            ) : (
              <>
                <Upload size={32} color="#667eea" />
                <span style={{ fontWeight: '500' }}>
                  Click to upload {type}
                </span>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {type === 'image' ? 'PNG, JPG, GIF up to 10MB' : 'MP4, WebM up to 50MB'}
                </span>
              </>
            )}
          </button>

          {uploading && (
            <div style={{ 
              width: '100%', 
              height: '4px', 
              background: '#e5e7eb', 
              borderRadius: '2px',
              marginTop: '0.5rem',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${uploadProgress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                transition: 'width 0.3s'
              }} />
            </div>
          )}

          {previewUrl && !uploading && (
            <button
              type="button"
              onClick={clearPreview}
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem 1rem',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <X size={16} />
              Clear Upload
            </button>
          )}
        </div>
      )}

      {/* Preview */}
      {previewUrl && type === 'image' && isImageUrl(previewUrl) && (
        <div style={{ 
          marginTop: '1rem', 
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '0.75rem',
          background: '#f9fafb'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            marginBottom: '0.5rem',
            fontSize: '0.875rem',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            <Eye size={16} />
            Preview
          </div>
          <img 
            src={previewUrl} 
            alt="Preview" 
            style={{ 
              width: '100%', 
              maxHeight: '200px',
              objectFit: 'contain',
              borderRadius: '6px'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              toast.error('Failed to load image preview');
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ImageUpload;
