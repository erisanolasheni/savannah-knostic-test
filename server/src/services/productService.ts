import { prisma } from '../db';
import type { Prisma } from '@prisma/client';

export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
    }
}

export class BadRequestError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'BadRequestError';
    }
}

export async function getMany(opts: {
    page: number;
    limit: number;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    minStock?: number;
    storeId?: string;
}) {
    const where: Prisma.ProductWhereInput = {};
    if (opts.storeId) where.storeId = opts.storeId;
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
            include: { store: true },
            orderBy: { name: 'asc' },
        }),
    ]);

    return {
        data,
        total,
        page: opts.page,
        limit: opts.limit,
        totalPages: Math.ceil(total / opts.limit),
    };
}

export async function getById(id: string) {
    const product = await prisma.product.findUnique({
        where: { id },
        include: { store: true },
    });
    if (!product) throw new NotFoundError('Product not found');
    return product;
}

export async function create(data: {
    storeId: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
}) {
    const storeExists = await prisma.store.findUnique({ where: { id: data.storeId } });
    if (!storeExists) throw new BadRequestError('Store does not exist');
    return prisma.product.create({ data });
}

export async function update(
    id: string,
    data: { name?: string; category?: string; price?: number; quantity?: number }
) {
    try {
        return await prisma.product.update({
            where: { id },
            data,
        });
    } catch (e) {
        if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2025') {
            throw new NotFoundError('Product not found');
        }
        throw e;
    }
}

export async function remove(id: string) {
    try {
        return await prisma.product.delete({ where: { id } });
    } catch (e) {
        if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2025') {
            throw new NotFoundError('Product not found');
        }
        throw e;
    }
}
