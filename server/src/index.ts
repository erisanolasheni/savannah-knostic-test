import Fastify from 'fastify';
import cors from '@fastify/cors';
import { routes } from './routes';
import { ZodError } from 'zod';

export function buildServer() {
    const server = Fastify({ logger: true });

    server.register(cors, {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
    });

    server.register(routes);

    server.setErrorHandler((error, request, reply) => {
        if (error instanceof ZodError) {
            return reply.status(400).send({
                error: 'VALIDATION_ERROR',
                message: 'Invalid data',
                details: error.issues,
            });
        }
        server.log.error(error);
        reply.status(500).send({ error: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' });
    });

    return server;
}

if (require.main === module) {
    const server = buildServer();
    server.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
        if (err) {
            server.log.error(err);
            process.exit(1);
        }
        server.log.info(`Server listening at ${address}`);
    });
}
