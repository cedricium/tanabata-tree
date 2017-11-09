const pg = require('pg');
const connectionString = process.env.DATABASE_URL;

const client = new pg.Client(connectionString);

client.connect();
client.query('CREATE TABLE IF NOT EXISTS tanabata_tree (id uuid, url VARCHAR(2000), \
  title TEXT, description TEXT, been_visited BOOLEAN DEFAULT false, created_at TIMESTAMP DEFAULT NOW())', (err, res) => {
    if (err) {
      client.end();
      return console.error('error with PostgreSQL database', err);
    }
});

client.end();