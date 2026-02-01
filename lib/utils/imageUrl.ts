/**
 * Utility to construct full image URLs for profile pictures
 * Backend stores relative paths like /public/profile_pictures/filename.jpg
 * Frontend needs to prepend the backend base URL
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';

export function getProfilePictureUrl(profilePicturePath?: string): string | null {
  if (!profilePicturePath) {
    return null;
  }

  // If it's already a full URL, return as is
  if (profilePicturePath.startsWith('http://') || profilePicturePath.startsWith('https://')) {
    return profilePicturePath;
  }

  // If it starts with /, it's a relative path, prepend backend URL
  if (profilePicturePath.startsWith('/')) {
    return `${BACKEND_URL}${profilePicturePath}`;
  }

  // Otherwise assume it's just a filename and construct the full path
  return `${BACKEND_URL}/public/profile_pictures/${profilePicturePath}`;
}

/**
 * Alias for getProfilePictureUrl for consistency
 */
export function getImageUrl(imagePath?: string): string | null {
  return getProfilePictureUrl(imagePath);
}
