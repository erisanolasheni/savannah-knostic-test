export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
    }
}

export class BadRequestError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'BadRequestError';
    }
}

const P2025 = 'P2025';

export function handlePrismaNotFound(e: unknown, message: string): never {
    if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === P2025) {
        throw new NotFoundError(message);
    }
    throw e as Error;
}
