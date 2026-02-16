import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, File, X, CheckCircle, ExternalLink, Loader2, ImageIcon } from 'lucide-react';
import { client } from '@/lib/api';
import { toast } from 'sonner';

interface FileUploadProps {
  bucketName: string;
  currentFileUrl?: string;
  onUploadComplete: (downloadUrl: string, objectKey: string) => void;
  accept?: string;
  maxSizeMB?: number;
  /** When true, shows an image preview instead of file info after upload */
  imagePreview?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function FileUpload({
  bucketName,
  currentFileUrl,
  onUploadComplete,
  accept = '.pdf,.doc,.docx,.html,.txt,.pptx,.xlsx,.csv,.zip',
  maxSizeMB = 50,
  imagePreview = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    url: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const uploadFile = async (file: globalThis.File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const folder = imagePreview ? 'thumbnails' : 'resources';
      const objectKey = `${folder}/${timestamp}_${sanitizedName}`;

      // Step 1: Get upload URL
      setProgress(10);
      const uploadUrlRes = await client.storage.getUploadUrl({
        bucket_name: bucketName,
        object_key: objectKey,
      });
      setProgress(20);

      const uploadUrl = uploadUrlRes.data.upload_url;
      if (!uploadUrl) {
        throw new Error('Failed to get upload URL');
      }

      // Step 2: Upload file via PUT to presigned URL
      setProgress(30);
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl, true);
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const pct = 30 + Math.round((event.loaded / event.total) * 50);
            setProgress(pct);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Upload network error'));
        xhr.send(file);
      });

      setProgress(85);

      // Step 3: Get download URL
      const downloadUrlRes = await client.storage.getDownloadUrl({
        bucket_name: bucketName,
        object_key: objectKey,
      });
      setProgress(100);

      const downloadUrl = downloadUrlRes.data.download_url;
      if (!downloadUrl) {
        throw new Error('Failed to get download URL');
      }

      setUploadedFile({
        name: file.name,
        size: file.size,
        url: downloadUrl,
      });

      onUploadComplete(downloadUrl, objectKey);
      toast.success('File uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('File upload failed. Please try again.');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        uploadFile(files[0]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bucketName]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    setUploadedFile(null);
    setProgress(0);
    onUploadComplete('', '');
  };

  // === Image Preview: Uploaded file ===
  if (uploadedFile && imagePreview) {
    return (
      <div className="border-2 border-green-200 bg-green-50 rounded-lg p-3">
        <div className="relative">
          <img
            src={uploadedFile.url}
            alt={uploadedFile.name}
            className="w-full h-40 object-cover rounded-lg"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            className="absolute top-2 right-2 h-7 w-7 bg-black/50 hover:bg-black/70 text-white rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
          <p className="text-sm text-gray-700 truncate">{uploadedFile.name}</p>
          <span className="text-xs text-gray-500 flex-shrink-0">({formatFileSize(uploadedFile.size)})</span>
        </div>
      </div>
    );
  }

  // === File Info: Uploaded file ===
  if (uploadedFile && !imagePreview) {
    return (
      <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-black truncate">{uploadedFile.name}</p>
            <p className="text-sm text-gray-500">{formatFileSize(uploadedFile.size)}</p>
            <a
              href={uploadedFile.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1 mt-1"
            >
              <ExternalLink className="h-3 w-3" />
              Preview / Download
            </a>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            className="h-8 w-8 text-gray-400 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // === Current file URL (editing mode) ===
  if (currentFileUrl && !uploading) {
    return (
      <div className="space-y-3">
        {imagePreview ? (
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
            <img
              src={currentFileUrl}
              alt="Current thumbnail"
              className="w-full h-40 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="p-2 bg-gray-50 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-gray-500" />
              <span className="text-xs text-gray-600 truncate">Current thumbnail</span>
            </div>
          </div>
        ) : (
          <div className="border-2 border-gray-200 bg-gray-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <File className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-black text-sm">Current File</p>
                <a
                  href={currentFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1 truncate max-w-full"
                >
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{currentFileUrl}</span>
                </a>
              </div>
            </div>
          </div>
        )}
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-[#F4E2A3] bg-[#F4E2A3]/10'
              : 'border-gray-300 hover:border-[#F4E2A3] hover:bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {imagePreview ? (
            <ImageIcon className="h-5 w-5 mx-auto text-gray-400 mb-1" />
          ) : (
            <Upload className="h-5 w-5 mx-auto text-gray-400 mb-1" />
          )}
          <p className="text-sm text-gray-600">
            <span className="font-medium text-[#B8A44E]">Click to replace</span> or drag & drop
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
    );
  }

  // === Default upload area / uploading state ===
  return (
    <div className="space-y-2">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          uploading
            ? 'border-[#F4E2A3] bg-[#F4E2A3]/5 cursor-wait'
            : isDragging
            ? 'border-[#F4E2A3] bg-[#F4E2A3]/10'
            : 'border-gray-300 hover:border-[#F4E2A3] hover:bg-gray-50 cursor-pointer'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        {uploading ? (
          <div className="space-y-3">
            <Loader2 className="h-8 w-8 mx-auto text-[#B8A44E] animate-spin" />
            <p className="text-sm font-medium text-gray-700">Uploading {imagePreview ? 'image' : 'file'}...</p>
            <div className="max-w-xs mx-auto">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">{progress}%</p>
            </div>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
              {imagePreview ? (
                <ImageIcon className="h-6 w-6 text-gray-400" />
              ) : (
                <Upload className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold text-[#B8A44E]">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-400">
              {imagePreview
                ? `JPG, PNG, WebP (max ${maxSizeMB}MB)`
                : `PDF, DOC, HTML, TXT, PPTX, XLSX, CSV, ZIP (max ${maxSizeMB}MB)`}
            </p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
      </div>
    </div>
  );
}