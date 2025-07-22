
'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Check, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

interface ScreenshotUploadProps {
  maxFiles?: number;
  onUpload: (urls: string[]) => void;
  disabled?: boolean;
  existingFiles?: string[];
}

interface UploadFile {
  id: string;
  file: File;
  url: string;
  uploaded: boolean;
  uploading: boolean;
  error?: string;
}

export default function ScreenshotUpload({ 
  maxFiles = 5, 
  onUpload, 
  disabled = false,
  existingFiles = []
}: ScreenshotUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles || disabled) return;

    const newFiles: UploadFile[] = [];
    const totalFiles = files.length + existingFiles.length + selectedFiles.length;

    if (totalFiles > maxFiles) {
      toast({
        title: 'Çok fazla dosya',
        description: `Maksimum ${maxFiles} dosya yükleyebilirsiniz.`,
        variant: 'destructive',
      });
      return;
    }

    Array.from(selectedFiles).forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Geçersiz dosya türü',
          description: 'Sadece resim dosyaları yükleyebilirsiniz.',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Dosya çok büyük',
          description: 'Dosya boyutu 5MB\'dan küçük olmalıdır.',
          variant: 'destructive',
        });
        return;
      }

      const id = Math.random().toString(36).substring(2);
      const url = URL.createObjectURL(file);
      
      newFiles.push({
        id,
        file,
        url,
        uploaded: false,
        uploading: false,
      });
    });

    setFiles(prev => [...prev, ...newFiles]);
  }, [files.length, existingFiles.length, maxFiles, disabled, toast]);

  const uploadFile = async (uploadFile: UploadFile) => {
    setFiles(prev => prev.map(f => 
      f.id === uploadFile.id ? { ...f, uploading: true, error: undefined } : f
    ));

    const formData = new FormData();
    formData.append('file', uploadFile.file);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[uploadFile.id] || 0;
          if (current >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return { ...prev, [uploadFile.id]: current + 10 };
        });
      }, 200);

      const response = await fetch('/api/upload/screenshot', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [uploadFile.id]: 100 }));

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, uploading: false, uploaded: true, url: result.data.url }
          : f
      ));

      toast({
        title: 'Başarılı',
        description: 'Screenshot başarıyla yüklendi.',
      });

    } catch (error) {
      console.error('Upload error:', error);
      
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, uploading: false, error: error instanceof Error ? error.message : 'Upload failed' }
          : f
      ));

      toast({
        title: 'Upload hatası',
        description: error instanceof Error ? error.message : 'Dosya yüklenirken hata oluştu.',
        variant: 'destructive',
      });
    }
  };

  const uploadAllFiles = async () => {
    const unuploadedFiles = files.filter(f => !f.uploaded && !f.uploading);
    
    for (const file of unuploadedFiles) {
      await uploadFile(file);
      // Add small delay between uploads
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Update parent component with uploaded URLs
    const uploadedUrls = files
      .filter(f => f.uploaded)
      .map(f => f.url);
    
    onUpload([...existingFiles, ...uploadedUrls]);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      const uploadedUrls = updated.filter(f => f.uploaded).map(f => f.url);
      onUpload([...existingFiles, ...uploadedUrls]);
      return updated;
    });
    setUploadProgress(prev => {
      const updated = { ...prev };
      delete updated[fileId];
      return updated;
    });
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const allFilesUploaded = files.every(f => f.uploaded);
  const hasFiles = files.length > 0;
  const totalFiles = files.length + existingFiles.length;

  return (
    <div className="space-y-4">
      {/* File Upload Area */}
      <Card className={`transition-all duration-200 ${
        isDragging ? 'border-purple-500 bg-purple-500/10' : 'border-gray-700'
      } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <CardContent className="p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? 'border-purple-500 bg-purple-500/5' : 'border-gray-600'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="flex justify-center">
                <Upload className={`w-12 h-12 ${isDragging ? 'text-purple-400' : 'text-gray-400'}`} />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Screenshot Yükle
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  PNG, JPG, JPEG veya WebP formatında resim dosyalarınızı sürükleyip bırakın
                </p>
                
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                  id="file-upload"
                  disabled={disabled}
                />
                
                <label htmlFor="file-upload">
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer"
                    disabled={disabled || totalFiles >= maxFiles}
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Dosya Seç
                  </Button>
                </label>
                
                <div className="text-xs text-gray-500 mt-2">
                  Maksimum {maxFiles} dosya, dosya başına 5MB limit
                </div>
                <div className="text-xs text-gray-500">
                  Yüklenen: {totalFiles}/{maxFiles}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Files */}
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-300">Mevcut Dosyalar:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {existingFiles.map((url, index) => (
              <div key={`existing-${index}`} className="relative">
                <div className="aspect-video relative rounded-lg overflow-hidden border border-green-500/30">
                  <Image
                    src={url}
                    alt={`Existing screenshot ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <div className="bg-green-500 text-white rounded-full p-1">
                      <Check className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File List */}
      <AnimatePresence>
        {hasFiles && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <h4 className="text-sm font-semibold text-gray-300">Yeni Dosyalar:</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative"
                >
                  <div className={`aspect-video relative rounded-lg overflow-hidden border ${
                    file.uploaded ? 'border-green-500/30' :
                    file.error ? 'border-red-500/30' :
                    file.uploading ? 'border-blue-500/30' :
                    'border-gray-700'
                  }`}>
                    <Image
                      src={file.url}
                      alt={file.file.name}
                      fill
                      className="object-cover"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      {file.uploaded ? (
                        <div className="bg-green-500 text-white rounded-full p-2">
                          <Check className="w-4 h-4" />
                        </div>
                      ) : file.error ? (
                        <div className="bg-red-500 text-white rounded-full p-2">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                      ) : file.uploading ? (
                        <div className="text-center">
                          <div className="bg-blue-500 text-white rounded-full p-2 mb-2">
                            <Upload className="w-4 h-4 animate-pulse" />
                          </div>
                          <Progress 
                            value={uploadProgress[file.id] || 0} 
                            className="w-16 h-1"
                          />
                        </div>
                      ) : null}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFile(file.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      disabled={file.uploading}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  
                  {/* File Info */}
                  <div className="mt-1 text-xs">
                    <div className="text-gray-400 truncate">{file.file.name}</div>
                    <div className="text-gray-500">
                      {(file.file.size / 1024 / 1024).toFixed(1)} MB
                    </div>
                    {file.error && (
                      <div className="text-red-400 mt-1">{file.error}</div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Upload All Button */}
            {hasFiles && !allFilesUploaded && (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={uploadAllFiles}
                  disabled={files.some(f => f.uploading) || disabled}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Tüm Dosyaları Yükle
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
