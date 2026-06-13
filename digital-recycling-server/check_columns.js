require('dotenv').config();
const mysql = require('mysql2');
const c = mysql.createConnection({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
c.connect();
c.query('SHOW COLUMNS FROM users', (e, r) => {
  if (e) {
    console.error(e.message);
    c.end();
    process.exit(1);
  }
  console.log('Current columns:');
  r.forEach(col => console.log(' -', col.Field, '|', col.Type, '| Null:', col.Null, '| Key:', col.Key));
  c.end();
});