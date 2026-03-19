import { prisma } from '../db';

export interface StoreSummary {
    storeId: string;
    storeName: string;
    productCount: number;
    totalItems: number;
    totalValue: number;
}

export interface CategorySummary {
    category: string;
    totalItems: number;
    totalValue: number;
}

export interface DashboardStats {
    totalStores: number;
    totalProducts: number;
    totalItems: number;
    totalValue: number;
    byStore: StoreSummary[];
    byCategory: CategorySummary[];
}

// Two queries: (1) global + per-store, (2) per-category. Efficient aggregation.
export async function getDashboardStats(): Promise<DashboardStats> {
    const [storeRows, categoryRows, globalRow] = await Promise.all([
        prisma.$queryRaw<
            Array<{
                storeId: string;
                storeName: string;
                productCount: number;
                totalItems: number;
                totalValue: number;
            }>
        >`
            SELECT s.id as storeId, s.name as storeName,
                   COUNT(p.id) as productCount,
                   COALESCE(SUM(p.quantity), 0) as totalItems,
                   COALESCE(SUM(p.price * p.quantity), 0) as totalValue
            FROM stores s
            LEFT JOIN products p ON p.storeId = s.id
            GROUP BY s.id, s.name
            ORDER BY s.name
        `,
        prisma.$queryRaw<
            Array<{ category: string; totalItems: number; totalValue: number }>
        >`
            SELECT category,
                   COALESCE(SUM(quantity), 0) as totalItems,
                   COALESCE(SUM(price * quantity), 0) as totalValue
            FROM products
            GROUP BY category
            ORDER BY category
        `,
        prisma.$queryRaw<
            Array<{ totalStores: number; totalProducts: number; totalItems: number; totalValue: number }>
        >`
            SELECT
                (SELECT COUNT(*) FROM stores) as totalStores,
                (SELECT COUNT(*) FROM products) as totalProducts,
                (SELECT COALESCE(SUM(quantity), 0) FROM products) as totalItems,
                (SELECT COALESCE(SUM(price * quantity), 0) FROM products) as totalValue
        `,
    ]);

    const global = globalRow[0];
    return {
        totalStores: Number(global?.totalStores ?? 0),
        totalProducts: Number(global?.totalProducts ?? 0),
        totalItems: Number(global?.totalItems ?? 0),
        totalValue: Number(global?.totalValue ?? 0),
        byStore: storeRows.map((r) => ({
            storeId: r.storeId,
            storeName: r.storeName,
            productCount: Number(r.productCount),
            totalItems: Number(r.totalItems),
            totalValue: Number(r.totalValue),
        })),
        byCategory: categoryRows.map((r) => ({
            category: r.category,
            totalItems: Number(r.totalItems),
            totalValue: Number(r.totalValue),
        })),
    };
}
