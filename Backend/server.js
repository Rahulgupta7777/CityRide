const express = require('express'),
    cors = require('cors'),
    { PrismaClient } = require('@prisma/client');
const app = express()
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());

// .env

// DATABASE_URL="postgresql://postgres.xogilzudxbrzukbhlbvv:Yash*123@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres"
// DIRECT_URL="postgresql://postgres.xogilzudxbrzukbhlbvv:Yash*123@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres"

app.get('/routes/search', async (req, res) => {
    console.log(`GET /routes/search q=${req.query.q}`);
    try {
        const { q } = req.query;
        if (!q) return res.json([]); // Handle empty query

        const [routes, stops] = await Promise.all([
            prisma.route.findMany({ where: { OR: [{ route_short_name: { contains: q, mode: 'insensitive' } }, { route_long_name: { contains: q, mode: 'insensitive' } }] }, include: { trips: { distinct: ['direction_id'], select: { direction_id: true, trip_headsign: true, trip_id: true } } } }),
            prisma.$queryRaw`SELECT DISTINCT r.route_id, r.route_short_name, r.route_long_name, r.area, t.direction_id, t.trip_headsign, t.trip_id FROM "Route" r JOIN "Trip" t ON r.route_id = t.route_id JOIN "StopTime" st ON t.trip_id = st.trip_id JOIN "Stop" s ON st.stop_id = s.stop_id WHERE s.stop_name ILIKE ${'%' + q + '%'} LIMIT 50`
        ]);
        const results = [], seen = new Set();
        const add = (r, d, h, id, a) => { const k = `${r.route_id}-${d}`; if (!seen.has(k)) { seen.add(k); results.push({ route_number: r.route_short_name, route_id: r.route_id, destination: h || r.route_long_name, area: a || r.area || "Central", example_trip_id: id }); } };
        routes.forEach(r => r.trips.forEach(t => add(r, t.direction_id, t.trip_headsign, t.trip_id, r.area)));
        stops.forEach(r => add(r, r.direction_id, r.trip_headsign, r.trip_id, r.area));
        res.json(results);
    } catch (error) {
        console.error('Search Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/route/details', async (req, res) => {
    const stops = await prisma.stopTime.findMany({ where: { trip_id: req.query.trip_id }, orderBy: { stop_sequence: 'asc' }, distinct: ['stop_sequence'], include: { stop: true } });
    res.json({ stops: stops.map(s => ({ sequence: s.stop_sequence, stop_name: s.stop.stop_name, time: s.arrival_time })) });
});

app.get('/journey', async (req, res) => {
    const { from, to } = req.query;
    res.json(await prisma.$queryRaw`SELECT r.route_short_name as route_number, t.trip_headsign, st1.arrival_time as start_time, st2.arrival_time as end_time, (st2.stop_sequence - st1.stop_sequence) as stops_in_between FROM "Trip" t JOIN "Route" r ON t.route_id = r.route_id JOIN "StopTime" st1 ON t.trip_id = st1.trip_id JOIN "StopTime" st2 ON t.trip_id = st2.trip_id JOIN "Stop" s1 ON st1.stop_id = s1.stop_id JOIN "Stop" s2 ON st2.stop_id = s2.stop_id WHERE s1.stop_name ILIKE '%' || ${from} || '%' AND s2.stop_name ILIKE '%' || ${to} || '%' AND st1.stop_sequence < st2.stop_sequence ORDER BY st1.arrival_time ASC LIMIT 20`);
});

app.listen(3000, () => console.log(`Server running on http://localhost:3000`));
