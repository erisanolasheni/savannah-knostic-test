import { prisma } from '../db';
import type { Prisma } from '@prisma/client';

export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
    }
}

export async function getMany() {
    return prisma.store.findMany();
}

export async function getById(id: string) {
    const store = await prisma.store.findUnique({ where: { id } });
    if (!store) throw new NotFoundError('Store not found');
    return store;
}

export async function create(data: { name: string; location: string }) {
    return prisma.store.create({ data });
}

export async function update(id: string, data: { name?: string; location?: string }) {
    try {
        return await prisma.store.update({ where: { id }, data });
    } catch (e) {
        if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2025') {
            throw new NotFoundError('Store not found');
        }
        throw e;
    }
}

export async function remove(id: string) {
    try {
        return await prisma.store.delete({ where: { id } });
    } catch (e) {
        if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2025') {
            throw new NotFoundError('Store not found');
        }
        throw e;
    }
}

export async function getProducts(
    storeId: string,
    opts: {
        page: number;
        limit: number;
        category?: string;
        minPrice?: number;
        maxPrice?: number;
        minStock?: number;
    }
) {
    await getById(storeId); // ensure store exists

    const where: Prisma.ProductWhereInput = { storeId };
    if (opts.category) where.category = opts.category;
    if (opts.minPrice !== undefined || opts.maxPrice !== undefined) {
        where.price = {};
        if (opts.minPrice !== undefined) where.price.gte = opts.minPrice;
        if (opts.maxPrice !== undefined) where.price.lte = opts.maxPrice;
    }
    if (opts.minStock !== undefined) {
        where.quantity = { gte: opts.minStock };
    }

    const [total, data] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
            where,
            skip: (opts.page - 1) * opts.limit,
            take: opts.limit,
            orderBy: { name: 'asc' },
        }),
    ]);

    return { data, total, page: opts.page, limit: opts.limit };
}

export async function getInventoryValue(storeId: string) {
    await getById(storeId);

    const aggregations = await prisma.product.aggregate({
        where: { storeId },
        _sum: { quantity: true },
    });

    const rawResult = await prisma.$queryRaw<[{ totalValue: number | null }]>`
        SELECT SUM(price * quantity) as totalValue
        FROM products
        WHERE storeId = ${storeId}
    `;

    return {
        storeId,
        totalItems: aggregations._sum.quantity ?? 0,
        totalValue: rawResult[0]?.totalValue ?? 0,
    };
}
