import { FastifyInstance } from 'fastify';
import { storeRoutes } from './stores';
import { productRoutes } from './products';
import { healthRoutes } from './health';
import { dashboardRoutes } from './dashboard';
import { metricsRoutes } from './metrics';

export async function routes(fastify: FastifyInstance) {
    await fastify.register(healthRoutes);
    await fastify.register(metricsRoutes);
    await fastify.register(storeRoutes);
    await fastify.register(productRoutes);
    await fastify.register(dashboardRoutes);
}
