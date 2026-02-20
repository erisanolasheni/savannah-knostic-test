import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const store1 = await prisma.store.create({
        data: {
            name: 'Downtown Tech',
            location: '123 Main St, Techville',
            products: {
                create: [
                    { name: 'Laptop Pro', category: 'Electronics', price: 1299.99, quantity: 15 },
                    { name: 'Wireless Mouse', category: 'Accessories', price: 49.99, quantity: 50 },
                    { name: 'Mechanical Keyboard', category: 'Accessories', price: 149.99, quantity: 20 },
                    { name: '27-inch Monitor', category: 'Electronics', price: 349.99, quantity: 10 },
                    { name: 'USB-C Cable', category: 'Accessories', price: 19.99, quantity: 100 },
                ],
            },
        },
    });

    const store2 = await prisma.store.create({
        data: {
            name: 'Uptown Essentials',
            location: '456 High St, Techville',
            products: {
                create: [
                    { name: 'Standing Desk', category: 'Furniture', price: 499.99, quantity: 8 },
                    { name: 'Ergonomic Chair', category: 'Furniture', price: 299.99, quantity: 12 },
                    { name: 'Laptop Stand', category: 'Accessories', price: 39.99, quantity: 30 },
                    { name: 'Desk Lamp', category: 'Lighting', price: 59.99, quantity: 25 },
                    { name: 'Noise-Canceling Headphones', category: 'Electronics', price: 199.99, quantity: 18 },
                ],
            },
        },
    });

    console.log({ store1, store2 });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
