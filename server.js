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

const apiRoute = '/api/v1/';


/**
 * GET "api/v1/tanzakus/" - Used to obtain all tanzakus in tanabata-tree
 *
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
        has_been_visited = '',
        created_at = '';
  
    for (var i = 0; i < res.rows.length; i++) {
      id = res.rows[i].id;
      url = res.rows[i].url;
      title = res.rows[i].title;
      desc = res.rows[i].description;
      has_been_visited = res.rows[i].been_visited;
      created_at = res.rows[i].created_at;
      
      tanzakus[i] = {
        id: id,
        url: url,
        title: title,
        description: desc,
        has_been_visited: has_been_visited,
        created_at: created_at
      };
    }

    client.end();
    response.send(tanzakus);
  });
});

/**
 * POST "/api/v1/tanzakus/ - Used to add a tanzaku to tanabata-tree
 *
 * @param {string} title - the title of the URL being added
 * @param {string} url - the URL to be added
 * @param {string} desc - the description of the URL being added
 */
app.post(apiRoute + 'tanzakus', addUrl);
function addUrl(request, response) {
  const protocol_pattern = /^((http|https):\/\/)/;
  
  let title = request.body.title,
      url = request.body.url,
      desc = request.body.desc,
      id = '';

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
  
  // Appends 'http://' to `url` if not already included - fixes #3
  url = protocol_pattern.test(url) ? url : 'http://' + url;

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
 * DELETE "/api/v1/tanzakus/:id" - Used to delete a tanzaku from tanabata-tree
 *
 * @param {string} id - the id of the tanzaku (in the form of a uuid)
 */
app.delete(apiRoute + 'tanzakus/:id', deleteTanzakuFromDatabase);
function deleteTanzakuFromDatabase(request, response) {
  let id = request.params.id;
  
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
    
  client.query('DELETE FROM tanabata_tree WHERE id =  $1;', [id], (err, res) => {
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
        message: 'tanzaku_deletion_failed',
        status: 'failed'
      };
      
      response.send(reply);
    } else {
      response.status(204);
      reply = {
        message: 'tanzaku_deleted',
        status: 'success'
      };

      response.send(reply);
    }
  }
}

/**
 * GET "actions/get-meta/" - Used to obtain the meta data of the requested URL
 *
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