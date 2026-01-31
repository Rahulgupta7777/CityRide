const { Client } = require('pg');

async function run() {
  const url = "postgresql://postgres.xogilzudxbrzukbhlbvv:Yash*123@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1";
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    const tablesRes = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`);
    const tables = tablesRes.rows.map(r => r.table_name);
    console.log("Tables:", tables);
    for (const t of tables) {
        const colRes = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1;`, [t]);
        console.log(`-- Table: ${t} --`);
        colRes.rows.forEach(c => console.log(`  ${c.column_name} (${c.data_type})`));
    }
  } catch (err) {
    console.error("Error connecting:", err.message);
  } finally {
    await client.end();
  }
}
run();
