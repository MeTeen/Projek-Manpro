import React, { useRef } from 'react';
import { MdPhotoCamera } from 'react-icons/md';

interface AvatarUploadProps {
  preview?: string | null;
  onChange: (file: File | null) => void;
  onPreviewChange: (preview: string | null) => void;
  size?: 'sm' | 'md' | 'lg';
  placeholder?: string;
  disabled?: boolean;
}

const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
  switch (size) {
    case 'sm':
      return { width: '64px', height: '64px', icon: 20 };
    case 'md':
      return { width: '96px', height: '96px', icon: 24 };
    case 'lg':
      return { width: '128px', height: '128px', icon: 32 };
    default:
      return { width: '96px', height: '96px', icon: 24 };
  }
};

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  preview,
  onChange,
  onPreviewChange,
  size = 'md',
  placeholder = 'Click to upload profile picture',
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sizeClasses = getSizeClasses(size);

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        onChange(file);
        const reader = new FileReader();
        reader.onloadend = () => onPreviewChange(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        alert('Please select an image file');
      }
    }
  };
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: '20px'
    }}>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled}
      />
      
      <div
        onClick={handleClick}
        style={{
          width: sizeClasses.width,
          height: sizeClasses.height,
          borderRadius: '50%',
          backgroundColor: '#f3f4f6',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: '2px dashed #d1d5db',
          marginBottom: '12px',
          position: 'relative',
          transition: 'all 0.2s',
          backgroundImage: preview ? `url(${preview})` : 'none',
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = '#4f46e5';
            e.currentTarget.style.backgroundColor = '#f9fafb';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = '#d1d5db';
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }
        }}
      >
        {!preview && (
          <MdPhotoCamera 
            size={sizeClasses.icon} 
            style={{ color: '#6b7280' }}
          />
        )}
        
        {!disabled && (
          <div style={{
            position: 'absolute',
            bottom: '0',
            right: '0',
            backgroundColor: '#4f46e5',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            border: '2px solid white'
          }}>
            <MdPhotoCamera size={16} style={{ color: 'white' }} />
          </div>
        )}
      </div>
      
      <p style={{
        fontSize: '14px',
        margin: '0',
        textAlign: 'center',
        color: disabled ? '#9ca3af' : '#6b7280'
      }}>
        {placeholder}
      </p>
    </div>
  );
};

export default AvatarUpload;
