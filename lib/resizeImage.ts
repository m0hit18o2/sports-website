// Downscales an image client-side before upload so large phone-camera/export
// files (often several MB) don't get stored and re-served at full resolution
// for images that only ever render small (team icons, gallery thumbnails).
// This is what keeps Supabase Storage egress in check.
export async function resizeImage(
  file: File,
  maxDim: number,
  outputType: "image/png" | "image/jpeg" = "image/jpeg",
  quality = 0.85
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      outputType,
      quality
    );
  });
}
