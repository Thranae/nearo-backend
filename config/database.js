const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "nearo",  
  password: "7777",
  port: 5432,
});


pool.connect((err, client, release) => {
  if (err) {
    console.error("PostgreSQL connection error ❌", err.message);
  } else {
    console.log("Connected to PostgreSQL ✅");
    release();
  }
});

module.exports = pool;