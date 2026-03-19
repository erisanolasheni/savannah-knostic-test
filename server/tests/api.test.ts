import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { buildServer } from '../src/index';

const app = buildServer();

describe('API Tests', () => {
    beforeAll(async () => {
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    let storeId = '';
    let productId = '';

    it('Create store', async () => {
        const response = await supertest(app.server)
            .post('/stores')
            .send({ name: 'Test Store', location: '123 Test St' });

        expect(response.status).toBe(201);
        expect(response.body.name).toBe('Test Store');
        storeId = response.body.id;
    });

    it('Get stores', async () => {
        const response = await supertest(app.server).get('/stores');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
    });

    it('Create product', async () => {
        const response = await supertest(app.server)
            .post('/products')
            .send({
                storeId,
                name: 'Test Product',
                category: 'Test Category',
                price: 99.99,
                quantity: 10,
            });

        expect(response.status).toBe(201);
        expect(response.body.name).toBe('Test Product');
        productId = response.body.id;
    });

    it('Get products with pagination', async () => {
        const response = await supertest(app.server).get('/products?page=1&limit=5');
        expect(response.status).toBe(200);
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.page).toBe(1);
        expect(response.body.limit).toBe(5);
    });

    it('Search products by q (name or category)', async () => {
        const response = await supertest(app.server).get('/products?q=Test&page=1&limit=10');
        expect(response.status).toBe(200);
        expect(response.body.data).toBeInstanceOf(Array);
        const names = response.body.data.map((p: { name: string }) => p.name);
        expect(names.some((n: string) => n.includes('Test'))).toBe(true);
    });

    it('Products ordering sortBy=price sortOrder=desc', async () => {
        const response = await supertest(app.server).get('/products?page=1&limit=100&sortBy=price&sortOrder=desc');
        expect(response.status).toBe(200);
        const data = response.body.data as Array<{ price: number }>;
        for (let i = 1; i < data.length; i++) {
            expect(data[i].price).toBeLessThanOrEqual(data[i - 1].price);
        }
    });

    it('Inventory value aggregation', async () => {
        const response = await supertest(app.server).get(`/stores/${storeId}/inventory-value`);
        expect(response.status).toBe(200);
        expect(response.body.totalItems).toBe(10);
        expect(response.body.totalValue).toBeCloseTo(999.9);
    });

    it('Validation error - POST /stores with invalid body', async () => {
        const response = await supertest(app.server)
            .post('/stores')
            .send({ name: '', location: 'x' });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('VALIDATION_ERROR');
    });

    it('Validation error - GET /products invalid query', async () => {
        const response = await supertest(app.server).get('/products?page=-1');
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('VALIDATION_ERROR');
    });

    it('404 - GET store by non-existent id', async () => {
        const response = await supertest(app.server).get('/stores/00000000-0000-0000-0000-000000000000');
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('NOT_FOUND');
    });

    it('404 - GET product by non-existent id', async () => {
        const response = await supertest(app.server).get('/products/00000000-0000-0000-0000-000000000000');
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('NOT_FOUND');
    });

    it('404 - GET /stores/:id/inventory-value for missing store', async () => {
        const response = await supertest(app.server).get('/stores/00000000-0000-0000-0000-000000000000/inventory-value');
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('NOT_FOUND');
    });

    it('BadRequest - POST product with invalid storeId', async () => {
        const response = await supertest(app.server)
            .post('/products')
            .send({
                storeId: '00000000-0000-0000-0000-000000000000',
                name: 'X',
                category: 'Y',
                price: 1,
                quantity: 1,
            });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('BAD_REQUEST');
    });

    it('PATCH store', async () => {
        const response = await supertest(app.server)
            .patch(`/stores/${storeId}`)
            .send({ name: 'Test Store Updated' });
        expect(response.status).toBe(200);
        expect(response.body.name).toBe('Test Store Updated');
    });

    it('PATCH product', async () => {
        const response = await supertest(app.server)
            .patch(`/products/${productId}`)
            .send({ quantity: 5 });
        expect(response.status).toBe(200);
        expect(response.body.quantity).toBe(5);
    });

    it('GET /health returns 200', async () => {
        const response = await supertest(app.server).get('/health');
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ok');
    });

    it('GET /api/dashboard returns stats', async () => {
        const response = await supertest(app.server).get('/api/dashboard');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('totalStores');
        expect(response.body).toHaveProperty('totalValue');
        expect(response.body).toHaveProperty('byStore');
        expect(response.body).toHaveProperty('byCategory');
    });

    it('GET /metrics returns Prometheus format', async () => {
        const response = await supertest(app.server).get('/metrics');
        expect(response.status).toBe(200);
        expect(response.text).toContain('http_requests_total');
    });

    it('DELETE product then 404 on GET', async () => {
        const del = await supertest(app.server).delete(`/products/${productId}`);
        expect(del.status).toBe(200);
        const get = await supertest(app.server).get(`/products/${productId}`);
        expect(get.status).toBe(404);
    });

    it('DELETE store returns 200', async () => {
        const response = await supertest(app.server).delete(`/stores/${storeId}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id', storeId);
    });
});
