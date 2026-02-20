import { z } from 'zod';

export const paginationSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
});

export const productFilterSchema = paginationSchema.extend({
    category: z.string().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    minStock: z.coerce.number().optional(),
    storeId: z.string().uuid().optional(),
});

export const createStoreSchema = z.object({
    name: z.string().min(1),
    location: z.string().min(1),
});

export const createProductSchema = z.object({
    storeId: z.string().uuid(),
    name: z.string().min(1),
    category: z.string().min(1),
    price: z.number().min(0),
    quantity: z.number().int().min(0),
});

export const updateProductSchema = z.object({
    name: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    price: z.number().min(0).optional(),
    quantity: z.number().int().min(0).optional(),
});
