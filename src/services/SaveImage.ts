import fs from 'fs/promises';
import path from 'path';

const folderPath = path.join(__dirname, '..', 'images');

export async function saveImage(imageBuffer: Buffer) {
  await fs.mkdir(folderPath);
  const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
  const fileName = `image_${timestamp}.png`;

  const filePath = path.join(folderPath, fileName);

  await fs.writeFile(filePath, imageBuffer);

  return filePath;
}
