import { FastifyInstance } from 'fastify';
import {
    createProductSchema,
    updateProductSchema,
    productFilterSchema,
} from '../schemas';
import * as productService from '../services/productService';

export async function productRoutes(fastify: FastifyInstance) {
    fastify.get('/products/categories', async () => {
        return productService.getDistinctCategories();
    });

    fastify.get('/products', async (request, reply) => {
        const parsed = productFilterSchema.safeParse(request.query);
        if (!parsed.success) {
            return reply.status(400).send({
                error: 'VALIDATION_ERROR',
                message: 'Invalid query',
                details: parsed.error.issues,
            });
        }
        const { page, limit, category, minPrice, maxPrice, minStock, storeId, q, sortBy, sortOrder } = parsed.data;
        return productService.getMany({
            page,
            limit,
            category,
            minPrice,
            maxPrice,
            minStock,
            storeId,
            q,
            sortBy,
            sortOrder,
        });
    });

    fastify.get('/products/:id', async (request) => {
        const { id } = request.params as { id: string };
        return productService.getById(id);
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
        const product = await productService.create(parsed.data);
        return reply.status(201).send(product);
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
        return productService.update(id, parsed.data);
    });

    fastify.delete('/products/:id', async (request) => {
        const { id } = request.params as { id: string };
        return productService.remove(id);
    });
}
