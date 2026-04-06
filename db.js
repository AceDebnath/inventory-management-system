const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: "postgresql://postgres.gqfohspqmtxzgazhjxjy:Ace123%40%23%25200@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres",
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;