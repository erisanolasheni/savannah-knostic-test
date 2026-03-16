import { FastifyInstance } from 'fastify';
import { storeRoutes } from './stores';
import { productRoutes } from './products';

export async function routes(fastify: FastifyInstance) {
    await fastify.register(storeRoutes);
    await fastify.register(productRoutes);
}
