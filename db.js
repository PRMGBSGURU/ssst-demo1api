const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'ssst-demo1',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true
});

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('✓ MySQL Database Connected Successfully');
    connection.release();
  })
  .catch(err => {
    console.error('✗ Database Connection Error:', err.message);
    console.error('Make sure MySQL is running and database "ssst-demo1" exists.');
  });

module.exports = pool;
