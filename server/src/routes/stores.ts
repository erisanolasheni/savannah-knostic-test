import { FastifyInstance } from 'fastify';
import { createStoreSchema, updateStoreSchema, productFilterSchema } from '../schemas';
import * as storeService from '../services/storeService';

export async function storeRoutes(fastify: FastifyInstance) {
    fastify.get('/stores', async () => {
        return storeService.getMany();
    });

    fastify.get('/stores/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            return await storeService.getById(id);
        } catch (e) {
            if (e instanceof storeService.NotFoundError) {
                return reply.status(404).send({ error: 'NOT_FOUND', message: e.message });
            }
            throw e;
        }
    });

    fastify.post('/stores', async (request, reply) => {
        const parsed = createStoreSchema.safeParse(request.body);
        if (!parsed.success) {
            return reply.status(400).send({
                error: 'VALIDATION_ERROR',
                message: 'Invalid store data',
                details: parsed.error.issues,
            });
        }
        const store = await storeService.create(parsed.data);
        return reply.status(201).send(store);
    });

    fastify.patch('/stores/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        const parsed = updateStoreSchema.safeParse(request.body);
        if (!parsed.success) {
            return reply.status(400).send({
                error: 'VALIDATION_ERROR',
                message: 'Invalid store data',
                details: parsed.error.issues,
            });
        }
        try {
            return await storeService.update(id, parsed.data);
        } catch (e) {
            if (e instanceof storeService.NotFoundError) {
                return reply.status(404).send({ error: 'NOT_FOUND', message: e.message });
            }
            throw e;
        }
    });

    fastify.delete('/stores/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            return await storeService.remove(id);
        } catch (e) {
            if (e instanceof storeService.NotFoundError) {
                return reply.status(404).send({ error: 'NOT_FOUND', message: e.message });
            }
            throw e;
        }
    });

    fastify.get('/stores/:id/products', async (request, reply) => {
        const { id } = request.params as { id: string };
        const parsed = productFilterSchema.safeParse(request.query);
        if (!parsed.success) {
            return reply.status(400).send({
                error: 'VALIDATION_ERROR',
                message: 'Invalid query',
                details: parsed.error.issues,
            });
        }
        const { page, limit, category, minPrice, maxPrice, minStock } = parsed.data;
        try {
            return await storeService.getProducts(id, {
                page,
                limit,
                category,
                minPrice,
                maxPrice,
                minStock,
            });
        } catch (e) {
            if (e instanceof storeService.NotFoundError) {
                return reply.status(404).send({ error: 'NOT_FOUND', message: e.message });
            }
            throw e;
        }
    });

    fastify.get('/stores/:id/inventory-value', async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            return await storeService.getInventoryValue(id);
        } catch (e) {
            if (e instanceof storeService.NotFoundError) {
                return reply.status(404).send({ error: 'NOT_FOUND', message: e.message });
            }
            throw e;
        }
    });
}
