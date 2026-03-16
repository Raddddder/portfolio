import localforage from "localforage";
import { initialRecords } from "../mockData";

// Since we're using DashScope (qwen) which doesn't support image generation,
// we directly use the high-quality Unsplash fallback images from mockData.
export async function checkAndGenerateImages(onProgress: (progress: number, total: number) => void) {
  // Check if we already have cached images
  const cachedImages = await localforage.getItem<Record<string, string>>('generated_food_images');
  
  if (cachedImages && Object.keys(cachedImages).length === initialRecords.length) {
    return cachedImages;
  }

  const images: Record<string, string> = {};
  
  for (let i = 0; i < initialRecords.length; i++) {
    onProgress(i + 1, initialRecords.length);
    images[initialRecords[i].id] = initialRecords[i].photoUrl;
  }

  await localforage.setItem('generated_food_images', images);
  return images;
}
