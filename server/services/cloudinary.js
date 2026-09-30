import { v2 as cloudinary } from 'cloudinary';

export function cloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

export function initCloudinary() {
  if (!cloudinaryConfigured()) {
    console.warn('[media] Cloudinary not configured — admin can still save image URLs.');
    return false;
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return true;
}

export function signUpload(folder = 'united-scuba') {
  if (!cloudinaryConfigured()) {
    const err = new Error('Cloudinary is not configured');
    err.status = 503;
    throw err;
  }
  const timestamp = Math.round(Date.now() / 1000);
  const params = { timestamp, folder };
  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);
  return {
    timestamp,
    signature,
    folder,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  };
}

export async function destroyImage(publicId, resourceType = 'image') {
  if (!publicId) return;
  if (!cloudinaryConfigured()) {
    const err = new Error('Cloudinary is not configured, so the file could not be removed.');
    err.status = 503;
    throw err;
  }
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    invalidate: true,
  });
  if (result?.result !== 'ok' && result?.result !== 'not found') {
    const err = new Error('Could not remove the image from Cloudinary.');
    err.status = 502;
    throw err;
  }
}
