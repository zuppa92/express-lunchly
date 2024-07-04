const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://localhost/lunchly'
});

client.connect();

module.exports = client;
