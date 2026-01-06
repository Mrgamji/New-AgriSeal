// components/UploadZone.tsx - COMPLETE WORKING VERSION
import React, { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle, Loader2, Sparkles, Brain } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { AnalysisRequest } from '../types';
import { useToast } from '../contexts/ToastContext';

interface UploadZoneProps {
  onUploadComplete: (request: AnalysisRequest) => void;
  activeCategory: 'crops' | 'livestock' | 'fishery';
  isProcessing?: boolean;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onUploadComplete, activeCategory, isProcessing = false }) => {
  const { showError, showWarning, showSuccess } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [cropType, setCropType] = useState('');
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadError('');
    
    // Filter to only allow images
    const imageFiles = acceptedFiles.filter(file => {
      const isValidType = file.type.startsWith('image/') && 
        ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp'].includes(file.type);
      
      if (!isValidType) {
        console.warn(`File rejected: ${file.name} - Invalid type: ${file.type}`);
        showWarning(`${file.name} has an invalid file type. Only JPEG, PNG, WEBP, BMP are allowed.`);
        return false;
      }
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        console.warn(`File rejected: ${file.name} - Too large: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        showWarning(`${file.name} is too large. Maximum file size is 10MB.`);
        return false;
      }
      
      return true;
    });
    
    // Limit to 5 files max
    const existingFiles = files.slice();
    const newFiles = [...existingFiles, ...imageFiles].slice(0, 5);
    
    if (acceptedFiles.length > imageFiles.length) {
      // Some files were rejected
      const errorMsg = `Some files were rejected. Only JPEG, PNG, WEBP, BMP files under 10MB are allowed.`;
      setUploadError(errorMsg);
      showWarning(errorMsg);
    }
    
    if (newFiles.length === 5 && acceptedFiles.length > existingFiles.length + imageFiles.length) {
      showWarning('Maximum 5 images allowed. Only the first 5 valid images will be used.');
    }
    
    setFiles(newFiles);
    if (imageFiles.length > 0) {
      showSuccess(`Added ${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''}. Total: ${newFiles.length}/5`);
    }
    console.log(`✅ Added ${imageFiles.length} files. Total: ${newFiles.length}/5`);
  }, [files, showSuccess, showWarning]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.bmp']
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isProcessing || isAnalyzing
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    console.log(`🗑️ Removed file at index ${index}. Remaining: ${newFiles.length}`);
  };

  const handleAnalyze = async () => {
    if (files.length === 0) {
      const errorMsg = 'Please upload at least one image for analysis';
      setUploadError(errorMsg);
      showError(errorMsg);
      return;
    }

    setIsAnalyzing(true);
    setUploadError('');

    try {
      console.log('📸 UploadZone: Starting analysis preparation');
      console.log(`📊 Files to analyze: ${files.length}`);
      
      // Create image URLs for preview
      const imageUrls = files.map(file => URL.createObjectURL(file));
      
      // Create FormData for API call
      const formData = new FormData();
      files.forEach((file, index) => {
        console.log(`📤 Adding file ${index + 1}: ${file.name} (${(file.size / 1024).toFixed(2)}KB)`);
        formData.append('images', file);
      });
      
      // Add metadata
      formData.append('category', activeCategory);
      if (cropType.trim()) {
        formData.append('cropType', cropType.trim());
      }
      if (description.trim()) {
        formData.append('description', description.trim());
      }

      console.log('📦 Creating AnalysisRequest...');
      
      const request: AnalysisRequest = {
        files,
        images: files, // Ensure images array is populated for backward compatibility
        category: activeCategory,
        cropType: cropType.trim() || undefined,
        description: description.trim() || undefined,
        timestamp: new Date().toISOString(),
        imageUrls, // Add preview URLs
        formData, // Add FormData for direct API usage
      };

      console.log('✅ UploadZone: Sending analysis request to parent');
      console.log('📋 Request details:', {
        category: request.category,
        cropType: request.cropType,
        fileCount: request.files?.length,
        imageCount: request.images?.length
      });
      
      // Call the parent handler
      onUploadComplete(request);
      showSuccess(`Prepared ${files.length} image${files.length > 1 ? 's' : ''} for analysis`);
      
    } catch (error: any) {
      console.error('❌ UploadZone: Error preparing analysis:', error);
      const errorMsg = `Failed to prepare analysis: ${error.message}`;
      setUploadError(errorMsg);
      showError(errorMsg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getCategoryIcon = () => {
    switch (activeCategory) {
      case 'crops': return '🌱';
      case 'livestock': return '🐄';
      case 'fishery': return '🐟';
      default: return '📸';
    }
  };

  const clearAll = () => {
    setFiles([]);
    setCropType('');
    setDescription('');
    setUploadError('');
    console.log('🧹 Cleared all files and inputs');
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-green-500 bg-green-50/50 border-green-300'
            : 'border-gray-300 hover:border-green-400 hover:bg-green-50/30'
        } ${(isProcessing || isAnalyzing) ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-green-600" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {isDragActive ? 'Drop images here' : `Upload ${activeCategory} Images`}
          </h3>
          
          <p className="text-gray-600 mb-4">
            Drag & drop {activeCategory} images or click to browse
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>JPG, PNG, WEBP, BMP</span>
            </div>
            <span className="hidden sm:inline text-gray-300">•</span>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Max 10MB each</span>
            </div>
            <span className="hidden sm:inline text-gray-300">•</span>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Up to 5 images</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Error */}
      {uploadError && (
        <div className="bg-gradient-to-r from-red-50 to-red-100/80 border border-red-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-800">{uploadError}</p>
            </div>
            <button
              onClick={() => setUploadError('')}
              className="text-red-500 hover:text-red-700 transition-colors"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-green-600" />
                Selected Images ({files.length}/5)
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Total size: {(files.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024).toFixed(2)}MB
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearAll}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                disabled={isProcessing || isAnalyzing}
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            </div>
          </div>
          
          {/* File Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
            {files.map((file, index) => (
              <div key={`${file.name}-${index}`} className="relative group">
                <div className="aspect-square rounded-xl border border-gray-200 overflow-hidden bg-gray-100 shadow-sm">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                    onLoad={() => console.log(`✅ Image ${index + 1} loaded: ${file.name}`)}
                  />
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
                    disabled={isProcessing || isAnalyzing}
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2 text-xs">
                  <div className="text-gray-700 truncate" title={file.name}>
                    {file.name.length > 15 ? `${file.name.substring(0, 12)}...` : file.name}
                  </div>
                  <div className="text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)}MB
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Information */}
          <div className="space-y-6">
            {activeCategory === 'crops' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Crop Type (Optional)
                </label>
                <input
                  type="text"
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  placeholder="e.g., Corn, Wheat, Tomatoes, Rice"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white/80 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={isProcessing || isAnalyzing}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Helps AI provide more specific recommendations
                </p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Any symptoms, observations, or specific concerns you've noticed..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none bg-white/80 disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={isProcessing || isAnalyzing}
              />
              <p className="text-xs text-gray-500 mt-1">
                Describe what you're seeing for better analysis
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Analyze Button with Enhanced Animation */}
      {files.length > 0 && !isProcessing && (
        <div className="relative">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform relative overflow-hidden group shadow-lg ${
              isAnalyzing 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 cursor-wait' 
                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
            } disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-emerald-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Button content */}
            <div className="relative flex items-center justify-center">
              {isAnalyzing ? (
                <>
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                    <span className="text-white text-lg">Preparing Analysis...</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Brain className="w-6 h-6 text-white" />
                      <div className="absolute -top-1 -right-1">
                        <Sparkles className="w-3 h-3 text-amber-300 animate-ping" />
                      </div>
                    </div>
                    <span className="text-white text-lg">
                      Start AI Analysis {getCategoryIcon()}
                    </span>
                  </div>
                </>
              )}
            </div>
            
            {/* Loading bar animation */}
            {isAnalyzing && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-emerald-400 animate-loading"></div>
            )}
          </button>
          
          {/* Info text */}
          <div className="text-center mt-3">
            <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 text-gray-400" />
              Uses 1 credit • Results in 45-60 seconds
            </p>
          </div>
        </div>
      )}

      {/* Processing Overlay */}
      {(isProcessing || isAnalyzing) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center animate-pulse">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -inset-4 border-4 border-green-500/30 rounded-full animate-ping"></div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {isAnalyzing ? 'Preparing Analysis' : 'AI Analysis in Progress'}
              </h3>
              
              <p className="text-gray-600 mb-6">
                {isAnalyzing 
                  ? 'Preparing your images for analysis...' 
                  : `Our neural networks are analyzing your ${activeCategory} images...`
                }
              </p>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full animate-pulse"></div>
              </div>
              
              <div className="text-sm text-gray-500 space-y-1">
                <p>• Processing {files.length} image{files.length !== 1 ? 's' : ''}</p>
                <p>• Please don't close this window</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-loading {
          animation: loading 1.5s infinite ease-in-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default UploadZone;