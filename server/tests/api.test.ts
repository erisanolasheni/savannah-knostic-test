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

    it('Test Inventory Value aggregation endpoint', async () => {
        const response = await supertest(app.server).get(`/stores/${storeId}/inventory-value`);
        expect(response.status).toBe(200);
        expect(response.body.totalItems).toBe(10);
        expect(response.body.totalValue).toBeCloseTo(999.9);
    });
});
