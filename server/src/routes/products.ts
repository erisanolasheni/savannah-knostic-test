import { FastifyInstance } from 'fastify';
import {
    createProductSchema,
    updateProductSchema,
    productFilterSchema,
} from '../schemas';
import * as productService from '../services/productService';

export async function productRoutes(fastify: FastifyInstance) {
    fastify.get('/products', async (request, reply) => {
        const parsed = productFilterSchema.safeParse(request.query);
        if (!parsed.success) {
            return reply.status(400).send({
                error: 'VALIDATION_ERROR',
                message: 'Invalid query',
                details: parsed.error.issues,
            });
        }
        const { page, limit, category, minPrice, maxPrice, minStock, storeId } = parsed.data;
        return productService.getMany({
            page,
            limit,
            category,
            minPrice,
            maxPrice,
            minStock,
            storeId,
        });
    });

    fastify.get('/products/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            return await productService.getById(id);
        } catch (e) {
            if (e instanceof productService.NotFoundError) {
                return reply.status(404).send({ error: 'NOT_FOUND', message: e.message });
            }
            throw e;
        }
    });

    fastify.post('/products', async (request, reply) => {
        const parsed = createProductSchema.safeParse(request.body);
        if (!parsed.success) {
            return reply.status(400).send({
                error: 'VALIDATION_ERROR',
                message: 'Invalid product data',
                details: parsed.error.issues,
            });
        }
        try {
            const product = await productService.create(parsed.data);
            return reply.status(201).send(product);
        } catch (e) {
            if (e instanceof productService.BadRequestError) {
                return reply.status(400).send({ error: 'BAD_REQUEST', message: e.message });
            }
            throw e;
        }
    });

    fastify.patch('/products/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        const parsed = updateProductSchema.safeParse(request.body);
        if (!parsed.success) {
            return reply.status(400).send({
                error: 'VALIDATION_ERROR',
                message: 'Invalid product data',
                details: parsed.error.issues,
            });
        }
        try {
            return await productService.update(id, parsed.data);
        } catch (e) {
            if (e instanceof productService.NotFoundError) {
                return reply.status(404).send({ error: 'NOT_FOUND', message: e.message });
            }
            throw e;
        }
    });

    fastify.delete('/products/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            return await productService.remove(id);
        } catch (e) {
            if (e instanceof productService.NotFoundError) {
                return reply.status(404).send({ error: 'NOT_FOUND', message: e.message });
            }
            throw e;
        }
    });
}
