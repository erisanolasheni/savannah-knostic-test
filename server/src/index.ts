import Fastify from 'fastify';
import cors from '@fastify/cors';
import { routes } from './routes';
import { ZodError } from 'zod';
import { NotFoundError, BadRequestError } from './errors';
import { incrementRequestCount, recordRequestDurationMs } from './lib/metrics';

export function buildServer() {
    const server = Fastify({ logger: true });

    server.addHook('onRequest', (request, _reply, done) => {
        (request as { _startTime?: number })._startTime = Date.now();
        incrementRequestCount();
        done();
    });
    server.addHook('onResponse', (request, _reply, done) => {
        const start = (request as { _startTime?: number })._startTime;
        if (typeof start === 'number') recordRequestDurationMs(Date.now() - start);
        done();
    });

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
        if (error instanceof NotFoundError) {
            return reply.status(404).send({ error: 'NOT_FOUND', message: error.message });
        }
        if (error instanceof BadRequestError) {
            return reply.status(400).send({ error: 'BAD_REQUEST', message: error.message });
        }
        server.log.error(error);
        reply.status(500).send({ error: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' });
    });

    return server;
}

const isEntry =
    (typeof require !== 'undefined' && require.main === module) ||
    (process.argv[1] && (process.argv[1].endsWith('index.ts') || process.argv[1].endsWith('index.js')));
if (isEntry) {
    const server = buildServer();
    server.listen({ port: 3000, host: '0.0.0.0' }, (err: Error | null, address: string) => {
        if (err) {
            server.log.error(err);
            process.exit(1);
        }
        server.log.info(`Server listening at ${address}`);
    });
}
