import { Upload } from 'lucide-react';
import React, { useState, ChangeEvent } from 'react';
import InputError from '../InputError';
interface SingleImageUploaderProps {
    className?: string; // Custom class name for styling
    onImageUpload: (file: File) => void; // Callback for the uploaded file
    errorMessage?: string; // Error message to display
    label?: string; // Label for the input field
    imageView?: 'contain' | 'cover';
    currentImage?: string,
    required?: boolean;
}

const SingleImageUploader: React.FC<SingleImageUploaderProps> = ({
    className = '', // Default to an empty string if no class name is provided
    onImageUpload,
    errorMessage,
    imageView = 'cover',
    label = 'Click to upload image',
    currentImage = '',
    required = false
}) => {
    const [headerBlob, setHeaderBlob] = useState<string | null>(null);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const blob = URL.createObjectURL(file);
            setHeaderBlob(blob);
            onImageUpload(file);
        } else {
            setHeaderBlob(null);
        }
    };

    return (
        <div className={`relative flex justify-center items-center bg-muted rounded overflow-hidden border-2 border-dashed bg-center ${className}`}>
            {(currentImage || headerBlob) && (
                <img src={headerBlob || currentImage} alt="Uploaded Header" className={`absolute inset-0 w-full h-full object-${imageView}`} />
            )}
            <input
                type='file'
                id='header_image'
                name='header_image'
                accept='image/*'
                className='h-[200%] w-[200%] absolute opacity-0 cursor-pointer bottom-0'
                onChange={handleImageChange}
                required={required}
            />
            {!headerBlob &&
                <span className='text-sm flex gap-2 flex-col items-center text-center'>
                    <Upload />{label}
                </span>
            }
            {errorMessage && <InputError message={errorMessage} className="mt-2" />}
        </div>
    );
};

export default SingleImageUploader;