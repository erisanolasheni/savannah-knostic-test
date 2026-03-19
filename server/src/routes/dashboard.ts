import { FastifyInstance } from 'fastify';
import * as dashboardService from '../services/dashboardService';

export async function dashboardRoutes(fastify: FastifyInstance) {
    fastify.get('/api/dashboard', async () => {
        return dashboardService.getDashboardStats();
    });
}
