import { FastifyInstance } from 'fastify';
import { createStoreSchema, updateStoreSchema, productFilterSchema } from '../schemas';
import * as storeService from '../services/storeService';

export async function storeRoutes(fastify: FastifyInstance) {
    fastify.get('/stores', async () => {
        return storeService.getMany();
    });

    fastify.get('/stores/:id', async (request) => {
        const { id } = request.params as { id: string };
        return storeService.getById(id);
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
        return storeService.update(id, parsed.data);
    });

    fastify.delete('/stores/:id', async (request) => {
        const { id } = request.params as { id: string };
        return storeService.remove(id);
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
        const { page, limit, category, minPrice, maxPrice, minStock, q, sortBy, sortOrder } = parsed.data;
        return storeService.getProducts(id, {
            page,
            limit,
            category,
            minPrice,
            maxPrice,
            minStock,
            q,
            sortBy,
            sortOrder,
        });
    });

    fastify.get('/stores/:id/inventory-value', async (request) => {
        const { id } = request.params as { id: string };
        return storeService.getInventoryValue(id);
    });
}
