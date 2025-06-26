// lib/upload.ts
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary with validation
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  throw new Error('Missing CLOUDINARY_CLOUD_NAME environment variable')
}
if (!process.env.CLOUDINARY_API_KEY) {
  throw new Error('Missing CLOUDINARY_API_KEY environment variable')
}
if (!process.env.CLOUDINARY_API_SECRET) {
  throw new Error('Missing CLOUDINARY_API_SECRET environment variable')
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Use HTTPS
})

export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  resourceType: 'image' | 'video' | 'audio' | 'raw' = 'video'
): Promise<string> {
  try {
    console.log(`Uploading to Cloudinary - folder: ${folder}, type: ${resourceType}`)
    console.log(`Cloud name: ${process.env.CLOUDINARY_CLOUD_NAME}`)
    console.log(`API key: ${process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing'}`)
    console.log(`API secret: ${process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing'}`)
    
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          // Configuration for different file types
          ...(resourceType === 'video' && {
            quality: 'auto',
            fetch_format: 'auto',
            flags: 'streaming_attachment', // Better for video streaming
          }),
          // Allow various video/audio formats
          allowed_formats: ['webm', 'mp4', 'mov', 'avi', 'mkv', 'wav', 'mp3', 'ogg', 'm4a']
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error details:', {
              message: error.message,
              name: error.name,
              http_code: error.http_code,
              error: error
            })
            reject(new Error(`Cloudinary upload failed: ${error.message}`))
          } else if (result) {
            console.log('Cloudinary upload success:', result.secure_url)
            console.log('File details:', {
              public_id: result.public_id,
              format: result.format,
              resource_type: result.resource_type,
              bytes: result.bytes,
              duration: result.duration || 'N/A'
            })
            resolve(result.secure_url)
          } else {
            console.error('Cloudinary upload failed: No result returned')
            reject(new Error('Upload failed - no result returned'))
          }
        }
      ).end(buffer)
    })
  } catch (error) {
    console.error('Cloudinary upload setup error:', error)
    throw new Error(`Cloudinary setup error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}