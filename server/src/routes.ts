import { FastifyInstance } from 'fastify';
import { prisma } from './db';
import { z } from 'zod';
import {
    createProductSchema,
    createStoreSchema,
    productFilterSchema,
    updateProductSchema,
} from './schemas';

export async function routes(fastify: FastifyInstance) {
    // Stores
    fastify.get('/stores', async () => {
        return prisma.store.findMany();
    });

    fastify.get('/stores/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        const store = await prisma.store.findUnique({ where: { id } });
        if (!store) {
            return reply.status(404).send({ error: 'NOT_FOUND', message: 'Store not found' });
        }
        return store;
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

        const store = await prisma.store.create({ data: parsed.data });
        return reply.status(201).send(store);
    });

    fastify.get('/stores/:id/products', async (request) => {
        const { id } = request.params as { id: string };
        const parsed = productFilterSchema.parse(request.query);
        const { page, limit, category, minPrice, maxPrice, minStock } = parsed;

        const where: any = { storeId: id };
        if (category) where.category = category;
        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {};
            if (minPrice !== undefined) where.price.gte = minPrice;
            if (maxPrice !== undefined) where.price.lte = maxPrice;
        }
        if (minStock !== undefined) {
            where.quantity = { gte: minStock };
        }

        const [total, data] = await Promise.all([
            prisma.product.count({ where }),
            prisma.product.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { name: 'asc' },
            }),
        ]);

        return { data, total, page, limit };
    });

    // Non-Trivial Aggregation: Inventory Value
    fastify.get('/stores/:id/inventory-value', async (request, reply) => {
        const { id } = request.params as { id: string };
        const store = await prisma.store.findUnique({ where: { id } });
        if (!store) {
            return reply.status(404).send({ error: 'NOT_FOUND', message: 'Store not found' });
        }

        const aggregations = await prisma.product.aggregate({
            where: { storeId: id },
            _sum: {
                quantity: true,
            },
            // Note: Prisma aggregate doesn't support complex math expressions directly, 
            // so we use raw query for sum(price * quantity)
        });

        const rawResult = await prisma.$queryRaw<[{ totalValue: number }]>`
      SELECT SUM(price * quantity) as totalValue 
      FROM products 
      WHERE storeId = ${id}
    `;

        return {
            storeId: id,
            totalItems: aggregations._sum.quantity || 0,
            totalValue: rawResult[0]?.totalValue || 0,
        };
    });

    // Products
    fastify.get('/products', async (request) => {
        const parsedQuery = productFilterSchema.safeParse(request.query);
        if (!parsedQuery.success) {
            throw parsedQuery.error;
        }
        const { page, limit, category, minPrice, maxPrice, minStock, storeId } = parsedQuery.data;

        const where: any = {};
        if (storeId) where.storeId = storeId;
        if (category) where.category = category;
        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {};
            if (minPrice !== undefined) where.price.gte = minPrice;
            if (maxPrice !== undefined) where.price.lte = maxPrice;
        }
        if (minStock !== undefined) {
            where.quantity = { gte: minStock };
        }

        const [total, data] = await Promise.all([
            prisma.product.count({ where }),
            prisma.product.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                include: { store: true },
                orderBy: { name: 'asc' },
            }),
        ]);

        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    });

    fastify.get('/products/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        const product = await prisma.product.findUnique({
            where: { id },
            include: { store: true },
        });
        if (!product) {
            return reply.status(404).send({ error: 'NOT_FOUND', message: 'Product not found' });
        }
        return product;
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

        const storeExists = await prisma.store.findUnique({ where: { id: parsed.data.storeId } });
        if (!storeExists) {
            return reply.status(400).send({ error: 'BAD_REQUEST', message: 'Store does not exist' });
        }

        const product = await prisma.product.create({ data: parsed.data });
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

        try {
            const product = await prisma.product.update({
                where: { id },
                data: parsed.data,
            });
            return product;
        } catch (error) {
            return reply.status(404).send({ error: 'NOT_FOUND', message: 'Product not found' });
        }
    });
}
