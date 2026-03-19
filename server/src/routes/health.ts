import { FastifyInstance } from 'fastify';
import { prisma } from '../db';

export async function healthRoutes(fastify: FastifyInstance) {
    fastify.get('/health', async (_request, reply) => {
        try {
            await prisma.$queryRaw`SELECT 1`;
            return reply.status(200).send({ status: 'ok', db: 'connected' });
        } catch (e) {
            fastify.log.error(e);
            return reply.status(503).send({ status: 'degraded', db: 'disconnected' });
        }
    });
}
