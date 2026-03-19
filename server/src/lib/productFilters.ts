import type { Prisma } from '@prisma/client';

export interface ProductFilterOpts {
    storeId?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    minStock?: number;
    q?: string;
}

export type ProductSortBy = 'name' | 'category' | 'price' | 'quantity';
export type SortOrder = 'asc' | 'desc';

export function buildProductWhere(opts: ProductFilterOpts): Prisma.ProductWhereInput {
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
    if (opts.q?.trim()) {
        const term = opts.q.trim();
        where.OR = [
            { name: { contains: term } },
            { category: { contains: term } },
        ];
    }
    return where;
}

export function buildProductOrderBy(sortBy: ProductSortBy, sortOrder: SortOrder): Prisma.ProductOrderByWithRelationInput {
    return { [sortBy]: sortOrder };
}
