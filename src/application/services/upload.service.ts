import { uploadRepository, type ImageKind } from '@/infrastructure/api/repositories/upload.repository';
import { AppError } from '@/domain/errors';

export class UploadService {
  async uploadImage(file: File, kind: ImageKind): Promise<string> {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new AppError('INVALID_IMAGE_TYPE', 'Tipo de imagen no permitido. Use JPEG, PNG o WebP.');
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new AppError('IMAGE_SIZE_EXCEEDS_LIMIT', 'La imagen no puede superar 5MB.');
    }

    const response = await uploadRepository.uploadImage(file, kind);
    if (!response.success || !response.data) {
      throw new AppError('IMAGE_UPLOAD_FAILED', 'No se pudo subir la imagen.');
    }

    return response.data.url;
  }
}

export const uploadService = new UploadService();
