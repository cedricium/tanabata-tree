const bodyParser = require('body-parser');
const express = require('express');
const meta = require('minimal-metainspector');
const wwwhisper = require('connect-wwwhisper');

const pg = require('pg');
const { Client } = pg;

pg.defaults.ssl = true;

// connection string to PostgreSQL database
const connectionString = process.env.DATABASE_URL;

const app = express();
const port = process.env.PORT || 3000;

// wwwhisper authentication
app.use(wwwhisper());

// set-up of body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('frontend'));
app.use(express.static('frontend/add'));

app.enable('strict routing');

app.listen(port);
console.log('Server started at localhost:' + port);

const apiRoute = '/api/v1/';

/**
 * "all/" route - Used to obtain all tanzakus in tanabata-tree
 *
 * hostname:[port]/all
 * @params {null} NONE
 */
app.get(apiRoute + 'tanzakus', function(request, response) {
  response.status(200);
  
  const client = new Client({
//    connectionString: connectionString
    connectionString: "this shouldn't work!"
  });
  
  pg.defaults.ssl = true;
  client.connect((err) => {
    if (err) {
      response.status(500);
      
      let reply = {
        status: 500,
        error: 'Error connecting to database.'
      };
      
      response.send(reply);
      console.error(err);
      client.end();
    }
  });

  client.query('SELECT * FROM tanzakus;', (err, res) => {
    let tanzakus = {};
  
    for (var i = 0; i < res.rows.length; i++)
      tanzakus[res.rows[i].title] = res.rows[i].url;

    client.end();
    response.send(tanzakus);
  });
});

/**
 * "add/" route - Used to add a tanzaku to tanabata-tree
 *
 * hostname:[port]/add/[title]/[url]
 * @param {string} title - the title of the URL being added
 * @param {string} url - the URL to be added
 */
app.post(apiRoute + 'tanzakus', addUrl);
function addUrl(request, response) {
  let title = request.body.title;
  let url = request.body.url;
  
  let reply;
  let tanzaku = {
    title: title,
    url: url
  };
  
  const client = new Client({
//    connectionString: connectionString
    connectionString: "this shouldn't work!"
  });

  pg.defaults.ssl = true;
  client.connect((err) => {
    if (err) {
      response.status(500);
      
      let reply = {
        status: 500,
        error: 'Error connecting to database.'
      };
      
      response.send(reply);
      console.error(err);
      client.end();
    }
  });

  client.query('INSERT INTO tanzakus (title, url) VALUES ($1, $2);', [title, url], (err, res) => {
    if (err)
      return console.error('error with PostgreSQL database', err);
    
    client.end();
    finished();
  });
  
  
  function finished(err) {
    if (err) {
      response.status(400);
      reply = {
        tanzaku,
        message: 'tanzaku_upload_failed',
        status: 'failed'
      };
      
      response.send(reply);
      throw err;
    } else {
      console.log('tanzaku_added: ' + JSON.stringify(tanzaku));
      
      response.status(201);
      reply = {
        tanzaku,
        message: 'tanzaku_uploaded',
        status: 'success'
      };

      response.send(reply);
    }
  }
}

/**
 * "gettitle/" route - Used to obtain the title of the requested URL
 *
 * hostname:[port]/gettitle/[url]
 * @params {string} url - the requested URL to get the title from
 */
app.get(apiRoute + 'actions/get-title', getTitle); 
function getTitle(request, response) {
  let url = request.query.url;
  
  // get title using 'minimal-metainspector'
  let client = new meta(url);
  let title = '';
  
  client.on('fetch', () => {
    title = client.title;
    
    response.status(200);
    reply = {
      url: url,
      title: title,
      message: 'get_title',
      status: 'success'
    };
    
    response.send(reply);
  });
  
  client.on('error', (err) => {
    response.status(400);
    reply = {
      url: url,
      title: title,
      message: 'get_title_failed',
      status: 'failed',
      err: err
    };
    
    response.send(reply);
  });

  client.fetch();
}