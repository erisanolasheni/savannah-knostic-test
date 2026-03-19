import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const STORE_1_KEY = 'seed-downtown-tech';
const STORE_2_KEY = 'seed-uptown-essentials';

async function main() {
    // Backfill seedKey for existing stores (e.g. after adding seedKey column)
    const s1 = await prisma.store.findFirst({ where: { name: 'Downtown Tech', location: '123 Main St, Techville' } });
    if (s1 && s1.seedKey === null) await prisma.store.update({ where: { id: s1.id }, data: { seedKey: STORE_1_KEY } });
    const s2 = await prisma.store.findFirst({ where: { name: 'Uptown Essentials', location: '456 High St, Techville' } });
    if (s2 && s2.seedKey === null) await prisma.store.update({ where: { id: s2.id }, data: { seedKey: STORE_2_KEY } });

    const store1 = await prisma.store.upsert({
        where: { seedKey: STORE_1_KEY },
        create: {
            seedKey: STORE_1_KEY,
            name: 'Downtown Tech',
            location: '123 Main St, Techville',
            products: {
                create: [
                    { seedKey: 'seed-dt-laptop-pro', name: 'Laptop Pro', category: 'Electronics', price: 1299.99, quantity: 15 },
                    { seedKey: 'seed-dt-wireless-mouse', name: 'Wireless Mouse', category: 'Accessories', price: 49.99, quantity: 50 },
                    { seedKey: 'seed-dt-mechanical-keyboard', name: 'Mechanical Keyboard', category: 'Accessories', price: 149.99, quantity: 20 },
                    { seedKey: 'seed-dt-monitor', name: '27-inch Monitor', category: 'Electronics', price: 349.99, quantity: 10 },
                    { seedKey: 'seed-dt-usb-cable', name: 'USB-C Cable', category: 'Accessories', price: 19.99, quantity: 100 },
                ],
            },
        },
        update: {},
    });

    const store2 = await prisma.store.upsert({
        where: { seedKey: STORE_2_KEY },
        create: {
            seedKey: STORE_2_KEY,
            name: 'Uptown Essentials',
            location: '456 High St, Techville',
            products: {
                create: [
                    { seedKey: 'seed-ue-standing-desk', name: 'Standing Desk', category: 'Furniture', price: 499.99, quantity: 8 },
                    { seedKey: 'seed-ue-ergonomic-chair', name: 'Ergonomic Chair', category: 'Furniture', price: 299.99, quantity: 12 },
                    { seedKey: 'seed-ue-laptop-stand', name: 'Laptop Stand', category: 'Accessories', price: 39.99, quantity: 30 },
                    { seedKey: 'seed-ue-desk-lamp', name: 'Desk Lamp', category: 'Lighting', price: 59.99, quantity: 25 },
                    { seedKey: 'seed-ue-headphones', name: 'Noise-Canceling Headphones', category: 'Electronics', price: 199.99, quantity: 18 },
                ],
            },
        },
        update: {},
    });

    const productData1 = [
        { seedKey: 'seed-dt-laptop-pro', name: 'Laptop Pro', category: 'Electronics', price: 1299.99, quantity: 15 },
        { seedKey: 'seed-dt-wireless-mouse', name: 'Wireless Mouse', category: 'Accessories', price: 49.99, quantity: 50 },
        { seedKey: 'seed-dt-mechanical-keyboard', name: 'Mechanical Keyboard', category: 'Accessories', price: 149.99, quantity: 20 },
        { seedKey: 'seed-dt-monitor', name: '27-inch Monitor', category: 'Electronics', price: 349.99, quantity: 10 },
        { seedKey: 'seed-dt-usb-cable', name: 'USB-C Cable', category: 'Accessories', price: 19.99, quantity: 100 },
    ] as const;
    for (const p of productData1) {
        const existing = await prisma.product.findFirst({ where: { storeId: store1.id, name: p.name } });
        if (existing?.seedKey === null) await prisma.product.update({ where: { id: existing.id }, data: { seedKey: p.seedKey } });
        await prisma.product.upsert({
            where: { seedKey: p.seedKey },
            create: { ...p, storeId: store1.id },
            update: {},
        });
    }
    const productData2 = [
        { seedKey: 'seed-ue-standing-desk', name: 'Standing Desk', category: 'Furniture', price: 499.99, quantity: 8 },
        { seedKey: 'seed-ue-ergonomic-chair', name: 'Ergonomic Chair', category: 'Furniture', price: 299.99, quantity: 12 },
        { seedKey: 'seed-ue-laptop-stand', name: 'Laptop Stand', category: 'Accessories', price: 39.99, quantity: 30 },
        { seedKey: 'seed-ue-desk-lamp', name: 'Desk Lamp', category: 'Lighting', price: 59.99, quantity: 25 },
        { seedKey: 'seed-ue-headphones', name: 'Noise-Canceling Headphones', category: 'Electronics', price: 199.99, quantity: 18 },
    ] as const;
    for (const p of productData2) {
        const existing = await prisma.product.findFirst({ where: { storeId: store2.id, name: p.name } });
        if (existing?.seedKey === null) await prisma.product.update({ where: { id: existing.id }, data: { seedKey: p.seedKey } });
        await prisma.product.upsert({
            where: { seedKey: p.seedKey },
            create: { ...p, storeId: store2.id },
            update: {},
        });
    }

    console.log('Seed completed (idempotent).', { store1: store1.id, store2: store2.id });
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
