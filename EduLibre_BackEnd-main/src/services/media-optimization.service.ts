import { randomUUID } from 'crypto';
import { readFile, unlink, writeFile } from 'fs/promises';
import path from 'path';
import { uploadDirectory } from '../config/upload';

const mediaServiceUrl = process.env.MEDIA_SERVICE_URL;
const mediaInternalApiKey = process.env.MEDIA_INTERNAL_API_KEY;

/**
 * Encaminha imagens já validadas pelo Multer ao serviço de mídia.
 * Se ele estiver indisponível, preserva o arquivo original para que o upload
 * do usuário não seja perdido.
 */
export default class MediaOptimizationService {
  public static async optimizeUploadedImage(
    file: Express.Multer.File,
  ): Promise<string> {
    const originalUrl = `/uploads/${file.filename}`;

    if (!mediaServiceUrl || !mediaInternalApiKey) {
      return originalUrl;
    }

    try {
      const source = await readFile(file.path);
      const formData = new FormData();
      formData.append(
        'file',
        new Blob([source], { type: file.mimetype }),
        file.originalname,
      );

      const response = await fetch(`${mediaServiceUrl}/optimize`, {
        method: 'POST',
        headers: {
          'x-internal-api-key': mediaInternalApiKey,
        },
        body: formData,
        signal: AbortSignal.timeout(8_000),
      });

      if (!response.ok || !response.headers.get('content-type')?.startsWith('image/webp')) {
        throw new Error(`Serviço de mídia retornou HTTP ${response.status}.`);
      }

      const optimizedName = `media-${randomUUID()}.webp`;
      await writeFile(
        path.join(uploadDirectory, optimizedName),
        Buffer.from(await response.arrayBuffer()),
      );
      await unlink(file.path);

      return `/uploads/${optimizedName}`;
    } catch (error) {
      console.warn('Falha ao otimizar imagem; arquivo original será mantido.', error);
      return originalUrl;
    }
  }
}
