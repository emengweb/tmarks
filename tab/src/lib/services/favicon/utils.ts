/**
 * Favicon 工具函数
 */

export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
}

export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function compressImage(blob: Blob, maxSizeKB: number = 10): Promise<string | null> {
  try {
    const img = new Image();
    const objectUrl = URL.createObjectURL(blob);
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = objectUrl;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    let width = img.width;
    let height = img.height;
    const maxSize = 128;

    if (width > maxSize || height > maxSize) {
      if (width > height) {
        height = (height / width) * maxSize;
        width = maxSize;
      } else {
        width = (width / height) * maxSize;
        height = maxSize;
      }
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    URL.revokeObjectURL(objectUrl);

    let quality = 0.9;
    let dataUrl = canvas.toDataURL('image/png', quality);

    while (dataUrl.length > maxSizeKB * 1024 && quality > 0.1) {
      quality -= 0.1;
      dataUrl = canvas.toDataURL('image/jpeg', quality);
    }

    return dataUrl;
  } catch (error) {
    console.error('Failed to compress image:', error);
    return null;
  }
}
