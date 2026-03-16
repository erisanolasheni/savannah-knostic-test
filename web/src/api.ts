const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function fetchProducts(options: { page?: number; limit?: number; category?: string; storeId?: string } = {}) {
    const params = new URLSearchParams();
    if (options.page) params.set('page', String(options.page));
    if (options.limit) params.set('limit', String(options.limit));
    if (options.category) params.set('category', options.category);
    if (options.storeId) params.set('storeId', options.storeId);

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
    options: { page?: number; limit?: number } = {}
) {
    const params = new URLSearchParams();
    if (options.page) params.set('page', String(options.page));
    if (options.limit) params.set('limit', String(options.limit));
    const res = await fetch(`${API_URL}/stores/${storeId}/products?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch store products');
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
