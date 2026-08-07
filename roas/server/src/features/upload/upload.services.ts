import { ImageKit } from '@imagekit/nodejs';
import config from '../../config/config';
import { ValidationError } from '../../utils/errors';
import logger from '../../utils/logger';

const imagekit = new ImageKit({
  privateKey: config.imagekitPrivateKey,
});

interface UploadResult {
  url: string;
  fileId: string;
  name: string;
  filePath: string;
  thumbnailUrl: string;
}

export const uploadFile = async (
  fileBuffer: Buffer,
  fileName: string,
  folder: string,
): Promise<UploadResult> => {
  if (!config.imagekitPrivateKey) {
    throw new ValidationError(
      'ImageKit is not configured. Please set IMAGEKIT_PRIVATE_KEY in your environment.',
    );
  }

  try {
    const response = await imagekit.files.upload({
      file: fileBuffer.toString('base64'),
      fileName,
      folder: `/roas-printfast/${folder}`,
    });

    logger.info(`File uploaded to ImageKit: ${response.name} -> ${response.url}`);

    return {
      url: response.url || '',
      fileId: response.fileId || '',
      name: response.name || '',
      filePath: response.filePath || '',
      thumbnailUrl: response.thumbnailUrl || '',
    };
  } catch (error) {
    logger.error('ImageKit upload failed:', error);
    throw new ValidationError('Failed to upload file to ImageKit');
  }
};

export const deleteFile = async (fileId: string): Promise<void> => {
  try {
    await imagekit.files.delete(fileId);
    logger.info(`File deleted from ImageKit: ${fileId}`);
  } catch (error) {
    logger.error('ImageKit delete failed:', error);
  }
};

export const getAuthParams = (): { token: string; expire: number; signature: string } => {
  // For client-side uploads, generate authentication parameters
  // Not used currently but available for future client-side uploading
  return {
    token: '',
    expire: 0,
    signature: '',
  };
};
