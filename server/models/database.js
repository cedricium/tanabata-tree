const pg = require('pg');
const connectionString = process.env.DATABASE_URL;

const client = new pg.Client(connectionString);

client.connect();

client.query("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tanabata_tree');", (err, res) => {
  let tableExists = '';
  if (err)
    return console.error(err);
  tableExists = JSON.stringify(res.rows[0].exists);
  if (tableExists === 'false') {
    client.query('CREATE TABLE tanabata_tree (id uuid, url VARCHAR(2000), \
      title TEXT, description TEXT, been_visited BOOLEAN DEFAULT false, created_at TIMESTAMP DEFAULT NOW())', (err, res) => {
        if (err) {
          client.end();
          return console.error('error with PostgreSQL database', err);
        }

        console.log(res);
    });
  }
});

client.end();