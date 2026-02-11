import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'

export default function ImageUpload({ images = [], onChange }) {
  const { t } = useTranslation()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()

  const uploadFile = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
    if (!cloudName || !uploadPreset) {
      alert(t('imageUpload.notConfigured'))
      return null
    }
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', uploadPreset)
    formData.append('folder', 'goodobox')
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    if (data.secure_url) return data.secure_url
    throw new Error(data.error?.message || 'Upload failed')
  }

  const handleFiles = async (files) => {
    const valid = [...files].filter((f) => f.type.startsWith('image/'))
    if (valid.length === 0) return
    setUploading(true)
    try {
      const urls = []
      for (let i = 0; i < valid.length; i++) {
        setUploadProgress(t('imageUpload.uploadingProgress', { current: i + 1, total: valid.length }))
        const url = await uploadFile(valid[i])
        if (url) urls.push(url)
      }
      onChange([...images, ...urls])
    } catch (err) {
      alert(t('imageUpload.uploadFailed', { message: err.message }))
    } finally {
      setUploading(false)
      setUploadProgress('')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const removeImage = (index) => {
    onChange(images.filter((_, i) => i !== index))
  }

  const moveImage = (index, direction) => {
    const newImages = [...images]
    const target = index + direction
    if (target < 0 || target >= newImages.length) return
    ;[newImages[index], newImages[target]] = [newImages[target], newImages[index]]
    onChange(newImages)
  }

  return (
    <div>
      <label className="block text-sm font-bold text-gray-900 mb-1">
        {t('imageUpload.productImages')}
      </label>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-2">
          {images.map((img, i) => (
            <div key={i} className="relative group aspect-square border border-gray-200 rounded-md overflow-hidden bg-gray-50">
              <img src={img} alt="" className="w-full h-full object-cover" />
              {i === 0 && (
                <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-amber-400 text-[10px] font-bold text-gray-900 rounded">
                  {t('imageUpload.main')}
                </span>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(i, -1)}
                    className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100"
                    title={t('imageUpload.moveLeft')}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                  title={t('imageUpload.remove')}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                {i < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveImage(i, 1)}
                    className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100"
                    title={t('imageUpload.moveRight')}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition ${
          dragOver ? 'border-amber-400 bg-amber-50' :
          uploading ? 'border-gray-300 bg-gray-50' :
          'border-gray-300 hover:border-amber-400 hover:bg-amber-50/30'
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-500" />
            {uploadProgress || t('imageUpload.uploading')}
          </div>
        ) : (
          <>
            <svg className="w-8 h-8 mx-auto text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-500">
              <span className="text-amber-600 font-medium">{t('imageUpload.clickToSelect')}</span> {t('imageUpload.orDragDrop')}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{t('imageUpload.fileTypes')}</p>
          </>
        )}
      </div>
    </div>
  )
}
