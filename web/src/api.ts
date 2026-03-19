const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export type ProductSortBy = 'name' | 'category' | 'price' | 'quantity';
export type SortOrder = 'asc' | 'desc';

export async function fetchCategories(): Promise<string[]> {
    const res = await fetch(`${API_URL}/products/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
}

export async function fetchProducts(options: {
    page?: number;
    limit?: number;
    category?: string;
    storeId?: string;
    minPrice?: number;
    maxPrice?: number;
    minStock?: number;
    q?: string;
    sortBy?: ProductSortBy;
    sortOrder?: SortOrder;
} = {}) {
    const params = new URLSearchParams();
    if (options.page) params.set('page', String(options.page));
    if (options.limit) params.set('limit', String(options.limit));
    if (options.category) params.set('category', options.category);
    if (options.storeId) params.set('storeId', options.storeId);
    if (options.minPrice != null) params.set('minPrice', String(options.minPrice));
    if (options.maxPrice != null) params.set('maxPrice', String(options.maxPrice));
    if (options.minStock != null) params.set('minStock', String(options.minStock));
    if (options.q?.trim()) params.set('q', options.q.trim());
    if (options.sortBy) params.set('sortBy', options.sortBy);
    if (options.sortOrder) params.set('sortOrder', options.sortOrder);

    const res = await fetch(`${API_URL}/products?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
}

export async function fetchProductById(id: string) {
    const res = await fetch(`${API_URL}/products/${id}`);
    if (!res.ok) throw new Error('Product not found');
    return res.json();
}

export async function updateProduct(id: string, data: Partial<{ name: string; price: number; quantity: number; category: string }>) {
    const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update product');
    return res.json();
}

export async function fetchStores() {
    const res = await fetch(`${API_URL}/stores`);
    if (!res.ok) throw new Error('Failed to fetch stores');
    return res.json();
}

export async function fetchStoreById(id: string) {
    const res = await fetch(`${API_URL}/stores/${id}`);
    if (!res.ok) throw new Error('Store not found');
    return res.json();
}

export async function fetchStoreProducts(
    storeId: string,
    options: {
        page?: number;
        limit?: number;
        category?: string;
        minPrice?: number;
        maxPrice?: number;
        minStock?: number;
        q?: string;
        sortBy?: ProductSortBy;
        sortOrder?: SortOrder;
    } = {}
) {
    const params = new URLSearchParams();
    if (options.page) params.set('page', String(options.page));
    if (options.limit) params.set('limit', String(options.limit));
    if (options.category) params.set('category', options.category);
    if (options.minPrice != null) params.set('minPrice', String(options.minPrice));
    if (options.maxPrice != null) params.set('maxPrice', String(options.maxPrice));
    if (options.minStock != null) params.set('minStock', String(options.minStock));
    if (options.q?.trim()) params.set('q', options.q.trim());
    if (options.sortBy) params.set('sortBy', options.sortBy);
    if (options.sortOrder) params.set('sortOrder', options.sortOrder);
    const res = await fetch(`${API_URL}/stores/${storeId}/products?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch store products');
    return res.json();
}

export async function fetchStoreInventoryValue(storeId: string) {
    const res = await fetch(`${API_URL}/stores/${storeId}/inventory-value`);
    if (!res.ok) throw new Error('Failed to fetch inventory value');
    return res.json() as Promise<{ storeId: string; totalItems: number; totalValue: number }>;
}

export async function fetchDashboard() {
    const res = await fetch(`${API_URL}/api/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch dashboard');
    return res.json();
}

export async function createStore(data: { name: string; location: string }) {
    const res = await fetch(`${API_URL}/stores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create store');
    return res.json();
}

export async function updateStore(id: string, data: Partial<{ name: string; location: string }>) {
    const res = await fetch(`${API_URL}/stores/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update store');
    return res.json();
}

export async function deleteStore(id: string) {
    const res = await fetch(`${API_URL}/stores/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete store');
    return res.json();
}

export async function createProduct(data: {
    storeId: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
}) {
    const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create product');
    return res.json();
}

export async function deleteProduct(id: string) {
    const res = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete product');
    return res.json();
}
