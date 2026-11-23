import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import sharp from 'sharp';
import { randomUUID } from 'node:crypto';

const fastify = Fastify({ logger: true });
const internalApiKey = process.env.MEDIA_INTERNAL_API_KEY;

function requireInternalKey(request, reply, done) {
  if (!internalApiKey || request.headers['x-internal-api-key'] !== internalApiKey) {
    reply.status(401).send({
      success: false,
      error: 'NÃ£o autorizado a usar o serviÃ§o de mÃ­dia.',
    });
    return;
  }

  done();
}

// ConfiguraÃ§Ã£o do limite de tamanho (ex: mÃ¡ximo 10MB por arquivo)
fastify.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

fastify.get('/health', async (request, reply) => {
  return { status: 'ok', uptime: process.uptime() };
});

fastify.post('/optimize', { preHandler: requireInternalKey }, async (request, reply) => {
  try {
    const data = await request.file();

    // 1. Erro: Nenhum arquivo enviado
    if (!data) {
      return reply.status(400).send({
        success: false,
        error: 'Nenhum arquivo foi enviado na requisiÃ§Ã£o.'
      });
    }

    // 2. Erro: Formato MIME invÃ¡lido (nÃ£o Ã© imagem)
    if (!data.mimetype || !data.mimetype.startsWith('image/')) {
      return reply.status(400).send({
        success: false,
        error: `Formato invÃ¡lido (${data.mimetype || 'desconhecido'}). Apenas arquivos de imagem sÃ£o permitidos.`
      });
    }

    // Converte o stream do arquivo para Buffer
    const buffer = await data.toBuffer();

    // 3. Processamento com Sharp
    const optimizedBuffer = await sharp(buffer)
      .rotate() // Corrige orientaÃ§Ã£o EXIF automaticamente
      .webp({ quality: 80 })
      .toBuffer();

    const uniqueFileName = `${randomUUID()}.webp`;

    return reply
      .type('image/webp')
      .header('Content-Disposition', `inline; filename="${uniqueFileName}"`)
      .send(optimizedBuffer);

  } catch (error) {
    request.log.error(error);

    // 4. Erro gerado pelo Fastify Multipart quando passa do limite de tamanho (10MB)
    if (error.code === 'FST_REQ_FILE_TOO_LARGE') {
      return reply.status(413).send({
        success: false,
        error: 'O arquivo enviado Ã© muito grande. O limite mÃ¡ximo permitido Ã© 10MB.'
      });
    }

    // 5. Erro gerado pelo Sharp (arquivo corrompido ou malformado)
    if (error.message && (error.message.includes('Vips') || error.message.includes('unsupported') || error.message.includes('corrupt'))) {
      return reply.status(400).send({
        success: false,
        error: 'NÃ£o foi possÃ­vel processar a imagem. O arquivo pode estar corrompido ou em um formato invÃ¡lido.'
      });
    }

    // Erro genÃ©rico de Servidor (Fallback)
    return reply.status(500).send({
      success: false,
      error: 'Erro interno ao processar a mÃ­dia.'
    });
  }
});

// FunÃ§Ã£o para iniciar o servidor (ESSENCIAL para o container nÃ£o fechar)
const start = async () => {
  try {
    const port = process.env.PORT || 3000;
    await fastify.listen({ port: Number(port), host: '0.0.0.0' });
    console.log(`ðŸš€ MicrosserviÃ§o de MÃ­dia rodando em http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
