import { prisma } from '../db';
import { NotFoundError, BadRequestError, handlePrismaNotFound } from '../errors';
import { buildProductWhere, buildProductOrderBy, type ProductSortBy, type SortOrder } from '../lib/productFilters';

export async function getMany(opts: {
    page: number;
    limit: number;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    minStock?: number;
    storeId?: string;
    q?: string;
    sortBy?: ProductSortBy;
    sortOrder?: SortOrder;
}) {
    const where = buildProductWhere(opts);
    const orderBy = buildProductOrderBy(opts.sortBy ?? 'name', opts.sortOrder ?? 'asc');

    const [total, data] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
            where,
            skip: (opts.page - 1) * opts.limit,
            take: opts.limit,
            include: { store: true },
            orderBy,
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

export async function getDistinctCategories(): Promise<string[]> {
    const rows = await prisma.product.findMany({
        select: { category: true },
        distinct: ['category'],
        orderBy: { category: 'asc' },
    });
    return rows.map((r) => r.category);
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
        handlePrismaNotFound(e, 'Product not found');
    }
}

export async function remove(id: string) {
    try {
        return await prisma.product.delete({ where: { id } });
    } catch (e) {
        handlePrismaNotFound(e, 'Product not found');
    }
}
