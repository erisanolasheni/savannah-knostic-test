import { FastifyInstance } from 'fastify';
import { getMetricsSnapshot, formatPrometheus } from '../lib/metrics';

export async function metricsRoutes(fastify: FastifyInstance) {
    fastify.get('/metrics', async (_request, reply) => {
        reply.header('Content-Type', 'text/plain; charset=utf-8');
        return formatPrometheus();
    });

    fastify.get('/api/metrics', async () => {
        return getMetricsSnapshot();
    });
}
