const { Client } = require('pg');

async function testConnection(url) {
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    const res = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`);
    console.log("SUCCESS");
    console.log("Tables in database:", url.split('@')[1]);
    console.log(res.rows.map(r => r.table_name));
  } catch (err) {
    console.error("Error connecting:", err.message);
  } finally {
    try { await client.end(); } catch (e) {}
  }
}

async function run() {
    console.log("Testing 6543 encoded:");
    await testConnection("postgresql://postgres.xogilzudxbrzukbhlbvv:Yash%2A123@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1");
    // Testing 5432 encoded
    console.log("Testing 5432 encoded:");
    await testConnection("postgresql://postgres.xogilzudxbrzukbhlbvv:Yash%2A123@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres");
}
run();
