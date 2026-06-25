import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(filePath, folder = 'seapedia') {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    transformation: [
      { width: 800, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
    ],
    format: 'webp',
  });
  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  };
}

export function getOptimizedUrl(publicId, width = 400) {
  return cloudinary.url(publicId, {
    width,
    crop: 'scale',
    quality: 'auto',
    fetch_format: 'auto',
  });
}
