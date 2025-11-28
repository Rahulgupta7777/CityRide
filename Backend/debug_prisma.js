const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    const q = '158';
    console.log(`Testing with q="${q}"`);

    try {
        console.log('Testing route.findMany...');
        const routes = await prisma.route.findMany({
            where: {
                OR: [
                    { route_short_name: { contains: q, mode: 'insensitive' } },
                    { route_long_name: { contains: q, mode: 'insensitive' } }
                ]
            },
            include: {
                trips: {
                    distinct: ['direction_id'],
                    select: { direction_id: true, trip_headsign: true, trip_id: true }
                }
            }
        });
        console.log('route.findMany success:', routes.length, 'routes found');
    } catch (e) {
        console.error('route.findMany failed:', e);
    }

    try {
        console.log('Testing $queryRaw...');
        const stops = await prisma.$queryRaw`SELECT DISTINCT r.route_id, r.route_short_name, r.route_long_name, r.area, t.direction_id, t.trip_headsign, t.trip_id FROM "Route" r JOIN "Trip" t ON r.route_id = t.route_id JOIN "StopTime" st ON t.trip_id = st.trip_id JOIN "Stop" s ON st.stop_id = s.stop_id WHERE s.stop_name ILIKE ${'%' + q + '%'} LIMIT 50`;
        console.log('$queryRaw success:', stops.length, 'stops found');
    } catch (e) {
        console.error('$queryRaw failed:', e);
    }
}

test()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
