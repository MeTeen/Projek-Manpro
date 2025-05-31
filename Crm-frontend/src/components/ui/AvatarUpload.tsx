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
      return { container: 'w-16 h-16', icon: 20 };
    case 'md':
      return { container: 'w-24 h-24', icon: 24 };
    case 'lg':
      return { container: 'w-32 h-32', icon: 32 };
    default:
      return { container: 'w-24 h-24', icon: 24 };
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
    <div className="flex flex-col items-center mb-5">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled}
      />
      
      <div
        onClick={handleClick}
        className={`${sizeClasses.container} rounded-full bg-gray-100 ${
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-indigo-600 hover:bg-gray-50'
        } flex justify-center items-center bg-cover bg-center border-2 border-dashed border-gray-300 mb-3 relative transition-all duration-200`}
        style={{
          backgroundImage: preview ? `url(${preview})` : 'none',
        }}
      >
        {!preview && (
          <MdPhotoCamera 
            size={sizeClasses.icon} 
            className="text-gray-500" 
          />
        )}
        
        {!disabled && (
          <div className="absolute bottom-0 right-0 bg-indigo-600 rounded-full w-7 h-7 flex items-center justify-center shadow-sm border-2 border-white">
            <MdPhotoCamera size={16} className="text-white" />
          </div>
        )}
      </div>
      
      <p className={`text-sm m-0 text-center ${
        disabled ? 'text-gray-400' : 'text-gray-500'
      }`}>
        {placeholder}
      </p>
    </div>
  );
};

export default AvatarUpload;
