/**
 * Utility to construct full image URLs for profile pictures and campaigns
 * Backend stores images in public directories
 * Frontend needs to prepend the backend base URL
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

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
  // Backend serves static files at /uploads/profile_pictures/
  return `${BACKEND_URL}/uploads/profile_pictures/${profilePicturePath}`;
}

/**
 * Utility to construct full image URLs for campaign images
 * Backend stores campaign images in /uploads/campaigns/
 * Returns full URL like http://localhost:5000/uploads/campaigns/campaign-1770535471271.png
 */
export function getCampaignImageUrl(imageName?: string): string | null {
  if (!imageName) {
    return null;
  }

  // If it's already a full URL, return as is
  if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
    return imageName;
  }

  // If it starts with /, it's a relative path, prepend backend URL
  if (imageName.startsWith('/')) {
    return `${BACKEND_URL}${imageName}`;
  }

  // Otherwise assume it's just a filename and construct the full path
  return `${BACKEND_URL}/uploads/campaigns/${imageName}`;
}

/**
 * Alias for getProfilePictureUrl for consistency
 */
export function getImageUrl(imagePath?: string): string | null {
  return getProfilePictureUrl(imagePath);
}
