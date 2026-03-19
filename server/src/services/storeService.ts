import { prisma } from '../db';
import { NotFoundError, handlePrismaNotFound } from '../errors';
import { buildProductWhere, buildProductOrderBy, type ProductSortBy, type SortOrder } from '../lib/productFilters';

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
        handlePrismaNotFound(e, 'Store not found');
    }
}

export async function remove(id: string) {
    try {
        return await prisma.store.delete({ where: { id } });
    } catch (e) {
        handlePrismaNotFound(e, 'Store not found');
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
        q?: string;
        sortBy?: ProductSortBy;
        sortOrder?: SortOrder;
    }
) {
    const store = await prisma.store.findUnique({ where: { id: storeId }, select: { id: true } });
    if (!store) throw new NotFoundError('Store not found');

    const where = buildProductWhere({ ...opts, storeId });
    const orderBy = buildProductOrderBy(opts.sortBy ?? 'name', opts.sortOrder ?? 'asc');
    const skip = (opts.page - 1) * opts.limit;
    const take = opts.limit;

    const [total, data] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
            where,
            skip,
            take,
            orderBy,
        }),
    ]);

    return { data, total, page: opts.page, limit: opts.limit };
}

// Single query: store existence + SUM(quantity) + SUM(price*quantity). 404 if store missing.
export async function getInventoryValue(storeId: string) {
    const rows = await prisma.$queryRaw<
        [{ id: string; totalItems: number; totalValue: number }]
    >`
        SELECT s.id, COALESCE(SUM(p.quantity), 0) as totalItems, COALESCE(SUM(p.price * p.quantity), 0) as totalValue
        FROM stores s
        LEFT JOIN products p ON p.storeId = s.id
        WHERE s.id = ${storeId}
        GROUP BY s.id
    `;
    if (!rows.length) throw new NotFoundError('Store not found');
    const row = rows[0];
    return {
        storeId: row.id,
        totalItems: Number(row.totalItems),
        totalValue: Number(row.totalValue),
    };
}
