const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'cookie',
  host: 'localhost',
  port: 5432, // default Postgres port
  database: 'Todo List'
});

module.exports = {
  query: (text, params) => pool.query(text, params)
};