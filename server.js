const bodyParser = require('body-parser');
const express = require('express');
const meta = require('minimal-metainspector');
const wwwhisper = require('connect-wwwhisper');
const uuidv5 = require('uuid');

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

const apiRoute = '/api/v1/';    // look at using Express Routers
                                // https://stackoverflow.com/a/29993694

/**
 * "all/" route - Used to obtain all tanzakus in tanabata-tree
 *
 * hostname:[port]/all
 * @params {null} NONE
 */
app.get(apiRoute + 'tanzakus', function(request, response) {
  response.status(200);
  
  const client = new Client({
    connectionString: connectionString
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

  client.query('SELECT * FROM tanabata_tree;', (err, res) => {
    let tanzakus = {},
        id = '',
        url = '',
        title = '',
        desc = '',
        created_at = '';
  
    for (var i = 0; i < res.rows.length; i++) {
      //tanzakus[res.rows[i].title] = res.rows[i].url;
      id = res.rows[i].id;
      url = res.rows[i].url;
      title = res.rows[i].title;
      desc = res.rows[i].description;
      created_at = res.rows[i].created_at;
      
      tanzakus[i] = {
        id: id,
        url: url,
        title: title,
        description: desc,
        created_at: created_at
      };
    }

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
  let title = request.body.title,
      url = request.body.url,
      desc = request.body.desc,
      id = '';
  
  // use node package 'uuid' here to create uuid based of url
  id = uuidv5(url, uuidv5.URL);
  
  let reply;
  let tanzaku = {
    id: id,
    url: url,
    title: title,
    description: desc
  };
  
  const client = new Client({
    connectionString: connectionString
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

  client.query('INSERT INTO tanabata_tree (id, url, title, description) VALUES ($1, $2, $3, $4);', [id, url, title, desc], (err, res) => {
    if (err) {
      finished(err);
      client.end();
      return console.error('error with PostgreSQL database', err);
    }
    
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
 * "actions/get-meta" route - Used to obtain the meta data of the requested URL
 *
 * hostname:[port]/get-meta/[url]
 * @params {string} url - the requested URL to get meta data from
 */
app.get(apiRoute + 'actions/get-meta', getMeta); 
function getMeta(request, response) {
  let url = request.query.url;
  
  // get title using 'minimal-metainspector'
  let client = new meta(url);
  let title = '',
      desc = '';
  
  client.on('fetch', () => {
    title = client.title;
    desc = client.description;
    
    response.status(200);
    reply = {
      meta: {
        url: url,
        title: title,
        description: desc
      },
      message: 'get_title',
      status: 'success'
    };
    
    response.send(reply);
  });
  
  client.on('error', (err) => {
    response.status(400);
    reply = {
      meta: {
        url: url,
        title: 'undefined',
        description: 'undefined'
      },
      message: 'get_title_failed',
      status: 'failed',
      err: err
    };
    
    response.send(reply);
  });

  client.fetch();
}